---
title: How to use OpenAI APIs right from Postgres to implement semantic search and GPT chat
slug: how-to-use-openai-apis-in-postgres
sidebar_label: use OpenAI APIs right from PG to implement semantic search and GPT chat
description: ""
keywords: ["postgresql","openai","apis","right","from","postgres","implement","semantic","search","chat","intermediate"]
tags: ["intermediate", "extensions", "ai", "pgvector", "plpython", "openai", "semantic-search"]
difficulty: intermediate
estimated_time: 9 min
---


<img src="/img/postgres-howtos/0025_elephant_with_sunglasses.jpg" width="600" />

Today we will implement RAG ([Retrieval Augmented Generation](https://en.wikipedia.org/wiki/Prompt_engineering#Retrieval-augmented_generation])) right in Postgres:

1. Load full Postgres commit history to a Postgres table
2. Using `plpython3u` (N/A on some managed services, such as RDS), start calling OpenAI APIs right from Postgres.
   > ⚠️ Warning: this approach doesn't scale well, so it's not recommended for larger production clusters. Consider this as
   either for fun or for only small projects/services.
3. For each commit, generate OpenAI embeddings and store them in the "vector" format (`pgvector`).
4. Use semantic search to find commits, sped by `pgvector`'s HNSW index.
5. Finally, "talk to commit history" via OpenAI GPT4.

(Inspired by: [@jonatasdp's Tweet](https://twitter.com/jonatasdp/status/1714711585191596419))

## Preparations

First, install extensions:

```sql
create extension if not exists plpython3u;
create extension if not exists vector;
```

Then, we'll need an [OpenAI API key](https://help.openai.com/en/articles/4936850-where-do-i-find-my-secret-api-key).
Let's store it as a custom GUC defined for our current database

> ⚠️ Warning: this is not the safest way to store it; we're using this method for simplicity):

```sql
do $$ begin
 execute(
   format(
     'alter database %I set openai.api_key = %L',
     current_database(),
     'sk-XXXXXXXXXXXX'
   )
 );
end $$;
```

## Import commit history from Git

Create a table where we'll store Git commits:

```bash
psql -X \
  -c "create table commit_logs (
    id bigserial primary key,
    hash text not null,
    created_at timestamptz not null,
    authors text,
    message text,
    embedding vector(1536)
  )" \
  -c "create unique index on commit_logs(hash)"
```

Now, clone the Postgres repo from GitHub or GitLab and fetch the full commit history to a CSV file (taking care of
escaping double quotes in the commit messages):

```bash
git clone https://gitlab.com/postgres/postgres.git
cd postgres

git log --all --pretty=format:'%H,%ad,%an,🐘%s %b🐘🐍' --date=iso \
 | tr '\n' ' ' \
 | sed 's/"/""/g' \
 | sed 's/🐘/"/g' \
 | sed 's/🐍/\n/g' \
 > commit_logs.csv
```

Load the commit history from CSV to the table:

```bash
psql -Xc "copy commit_logs(hash, created_at, authors, message)
   from stdin
   with delimiter ',' csv" \
 < commit_logs.csv

psql -X \
 -c "update commit_logs set hash = trim(hash)" \
 -c "vacuum full analyze commit_logs"
```

As of July 2025, this will yield ~96k rows, covering more than 10k days of the Postgres development history – more
than 27 years – the first commit was made on in July 1996!

## Create and store embeddings
Here is a function that we'll use to get vectors for each commit entry, from OpenAI API using `plpython3u` (`u` here
means "untrusted" – it is allowed to such functions to talk to the external world):

```sql
create or replace function openai_get_embedding(
  content text,
  api_key text default current_setting('openai.api_key', true)
) returns vector(1536)
as $$
  import requests

  response = requests.post(
    'https://api.openai.com/v1/embeddings',
    headers={ 'Authorization': f'Bearer {api_key}' },
    json={
      'model': 'text-embedding-3-small',
      'input': content.replace("\n", " ")
   }
 )

  if response.status_code >= 400:
   raise Exception(f"Failed. Code: {response.status_code}")

  return response.json()['data'][0]['embedding']
$$ language plpython3u;
```

Once it's created, start obtaining and storing vectors. We'll do it in small batches, to avoid long-running
transactions – no to lose large data volumes in case of failure and not to block concurrent sessions, if any:

```sql
with scope as (
  select hash
  from commit_logs
  where embedding is null
  order by id
  limit 5
), upd as (
  update commit_logs
  set embedding = openai_get_embedding(
    content := format(
      'Date: %s. Hash: %s. Message: %s',
      created_at,
      hash,
      message
    )
  )
  where hash in (
    select hash
    from scope
 )
 returning *
)
select
  count(embedding) as cnt_vectorized,
  max(upd.id) as latest_upd_id,
  round(
    max(upd.id)::numeric * 100 /
      (select max(c.id) from commit_logs as c),
    2
  )::text || '%' as progress,
  1 / count(*) as err_when_done
from upd
\watch .1
```

This process might take a significant amount of time, perhaps more than an hour, so prepare to wait. Also, here is where
we start paying OpenAI for the API use (although, embedding creation is very cheap, and you'll pay somewhat `~$1` here,
see [pricing](https://openai.com/pricing)).

Once it's done – or earlier, with partial results – you can start using it.

## Semantic search

Here's a straightforward example of using semantic search to find the most relevant commits:

The concept here is straightforward:

1. First, we call OpenAI API to "vectorize" the text of our request.
2. Then, we use `pgvector`'s similarity search to find K nearest neighbors.

We will use the `HNSW` index, considered one of the best approaches today (although originally described in
[2016](https://arxiv.org/abs/1603.09320)); added in by many DBMSes. In `pgvector`, it was added in version 0.5.0.
Note that this is `ANN` index – "approximate nearest neighbors", so it is, for the sake of speed, allowed to produce
not strict result, unlike regular indexes in Postgres.

Create an index:

```bash
psql -Xc "create index on commit_logs
 using hnsw (embedding vector_cosine_ops)"
```

Now, in `psql`, perform the search:

```sql
select openai_get_embedding('psql features') as q_vector \gset

select
  created_at,
  format(
    'https://gitlab.com/postgres/postgres/-/commit/%s',
    left(hash, 8)
 ),
 left(message, 150),
 authors,
 1 - (embedding <-> :'q_vector') as similarity
from commit_logs
order by embedding <-> :'q_vector'
limit 5 \gx
```

If index is created, the second query should be very fast. You can check the plan and details of execution using
`EXPLAIN (ANALYZE, BUFFERS)`. Our dataset is tiny (<100k), so the search speed should be ~1ms, and the buffer hit/read
numbers ~1000 or less. There are a few tuning options for indexes `pgvector` offers, check out its
[README](https://github.com/pgvector/pgvector/blob/master/README.md).

Here is an example result for the query `psql "\watch" limited count of loops`:

```
postgres-# limit 5 \gx
┌─[ RECORD 1 ]────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ created_at │ 2025-05-29 20:58:57-07                                                                                                                                 │
│ format     │ https://gitlab.com/postgres/postgres/-/commit/13cb16e7                                                                                                 │
│ left       │ Implement comprehensive improvements to pg_restore object tracking - Add command-line options for file paths and disable flag - Capture actual Postgre │
│ authors    │ Nikolay Samokhvalov                                                                                                                                    │
│ similarity │ -0.025786986265972756                                                                                                                                  │
├─[ RECORD 2 ]────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ created_at │ 2025-05-04 11:38:42-07                                                                                                                                 │
│ format     │ https://gitlab.com/postgres/postgres/-/commit/2448c7a9                                                                                                 │
│ left       │ doc: Put some psql documentation pieces back into alphabetical order                                                                                   │
│ authors    │ Peter Eisentraut                                                                                                                                       │
│ similarity │ -0.03374895125754507                                                                                                                                   │
├─[ RECORD 3 ]────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ created_at │ 2025-05-29 20:05:54-07                                                                                                                                 │
│ format     │ https://gitlab.com/postgres/postgres/-/commit/64512a7b                                                                                                 │
│ left       │ Improve test and add documentation for pg_restore object tracking - Simplify test to use single table instead of complex schema - Use unique index cor │
│ authors    │ Nikolay Samokhvalov                                                                                                                                    │
│ similarity │ -0.037387386782650855                                                                                                                                  │
├─[ RECORD 4 ]────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ created_at │ 2025-05-23 14:05:35-07                                                                                                                                 │
│ format     │ https://gitlab.com/postgres/postgres/-/commit/4050aedd                                                                                                 │
│ left       │ Implement complete WAL metrics functionality for table statistics This commit adds comprehensive WAL tracking to PostgreSQL table-level statistics, en │
│ authors    │ Nikolay Samokhvalov                                                                                                                                    │
│ similarity │ -0.050729119237905795                                                                                                                                  │
├─[ RECORD 5 ]────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ created_at │ 2025-05-20 14:31:00-07                                                                                                                                 │
│ format     │ https://gitlab.com/postgres/postgres/-/commit/a6060f1c                                                                                                 │
│ left       │ pg_dump: Fix array literals in fetchAttributeStats(). Presently, fetchAttributeStats() builds array literals by treating the elements as SQL identifie │
│ authors    │ Nathan Bossart                                                                                                                                         │
│ similarity │ -0.0509084177885033                                                                                                                                    │
└────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## "Talk to the Git history" using OpenAI APIs right from Postgres

Finally, create two more functions and pose questions about the Postgres commit history:

```sql
create or replace function openai_gpt_call(
  question text,
  data_to_embed text,
  model text default 'gpt-4.1-nano-2025-04-14',
  token_limit int default 4096,
  api_key text default current_setting('openai.api_key', true)
) returns text
as $$
  import requests, json

  prompt = """Be terse. Discuss only Postgres and it's commits.
For commits, mention timestamp and hash.
CONTEXT (git commits):
---
%s
---
QUESTION: %s
""" % (data_to_embed[:2000], question)

  ### W: this code lacks error handling
  response = requests.post(
    'https://api.openai.com/v1/chat/completions',
    headers={ 'Authorization': f'Bearer {api_key}' },
    json={
      'model': model,
      'messages': [
          {"role": "user", "content": prompt}
      ],
      'max_tokens': token_limit,
      'temperature': 0
    }
 )

  if response.status_code >= 400:
    raise Exception(f"Failed. Code: {response.status_code}. Response: {response.text}")

  return response.json()['choices'][0]['message']['content']
$$ language plpython3u;

create or replace function openai_chat(
  in question text,
  in model text default 'gpt-4',
  out answer text
) as $$
  with q as materialized (
    select openai_get_embedding(
      question
    ) as emb
  ), find_enries as (
    select
      format(
        e'Created: %s, hash: %s, message: %s, committer: %s\n',
        created_at,
        left(hash, 8),
        message,
        authors
      ) as entry
    from commit_logs
    where embedding <=> (select emb from q) < 0.8
    order by embedding <=> (select emb from q)
    limit 10 -- adjust if needed
  )
  select openai_gpt_call(
    question := openai_chat.question,
    data_to_embed := string_agg(entry, e'\n'),
    model := openai_chat.model
  )
  from find_enries;
$$ language sql;
```

Now, just ask using `openai_chat(...)`, for example:

```
nik=# \a
Output format is unaligned.

nik=# select openai_chat('tell me about fixes of CREATE INDEX CONCURRENTLY – when, who, etc.');
openai_chat
There are two notable fixes for CREATE INDEX CONCURRENTLY. The first one was made on 2016-02-16 18:43:03+00 by Tom Lane, with the commit hash a65313f2. The commit improved the documentation about CREATE INDEX CONCURRENTLY, clarifying the description of which transactions will block a CREATE INDEX CONCURRENTLY command from proceeding.

The second fix was made on 2012-11-29 02:25:27+00, with the commit hash 3c840464. This commit fixed assorted bugs in CREATE/DROP INDEX CONCURRENTLY. The issue was that the pg_index state for an index that's reached the final pre-drop stage was the same as the state for an index just created by CREATE INDEX CONCURRENTLY. This was fixed by adding an additional boolean column "indislive" to pg_index.
(1 row)
```

Note that it uses the models `text-embedding-3-small` for embeddings and `gpt-4.1-nano-2025-04-14` for completion API calls by default. By the time you're reading this, there might be newer, better models – see [pricing](https://openai.com/pricing) and [models](https://platform.openai.com/docs/models).

## A few final notes

1. As mentioned above, this approach – calling external API from Postgres – doesn't scale well. It is good for fast
   prototyping but should not be used in projects where a significant growth of TPS is expected (otherwise, with growth,
   CPU saturation risks, idle-in-tx spikes, etc., might cause significant performance issues and even outages).

2. Another disadvantage of this approach is that `plpython3u` is not available in some Postgres services (e.g., RDS).

3. Finally, when working with in SQL context, it is quite easy to unintentionally have API calls in a loop. This might
   cause excessive expenses. To avoid it, we need to carefully check the execution plans.

4. For some people, such code is harder to debug.

Nonetheless, the concepts described above might work well in certain cases – just keep in mind these nuances and avoid
inefficient moves. And if concerns are too high, the code calling APIs should be moved from `plpython3u` to outside
Postgres.
