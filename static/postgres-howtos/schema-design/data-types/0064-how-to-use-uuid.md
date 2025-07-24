---
title: How to use UUID
slug: how-to-use-uuid
sidebar_label: use UUID
description: ""
keywords: ["postgresql","uuid","intermediate"]
tags: ["intermediate", "uuid", "data-types", "primary-keys", "identifiers", "schema-design"]
difficulty: intermediate
estimated_time: 5 min
---


As of PG16 (year 2023), Postgres implements UUID versions from 1 to 5, based
on [RFC 4122](https://datatracker.ietf.org/doc/html/rfc4122).

- Docs: [UUID Data Type](https://postgresql.org/docs/current/datatype-uuid.html)
- Additional module [uuid-ossp](https://postgresql.org/docs/current/uuid-ossp.html)

A UUID value can be generated using `get_random_uuid()`, it generates UUID version 4
([source code for PG16](https://github.com/postgres/postgres/blob/03749325d16c4215ecd6d6a6fe117d93931d84aa/src/backend/utils/adt/uuid.c#L405-L423)):

```sql
nik=# select gen_random_uuid();
           gen_random_uuid
--------------------------------------
 c027497b-c510-413b-9092-8e6c99cf9596
(1 row)

nik=# select gen_random_uuid();
           gen_random_uuid
--------------------------------------
 08e63fed-f883-45d8-9896-8f087074bff5
(1 row)
```

In standard UUIDs, the version can be understood looking at the first character after the 2nd hyphen:

```
08e63fed-f883-4 ...  👈 this means v4
```

The values are coming in a "pseudorandom" order. This has certain negative impact on performance: in a B-tree index,
inserts happen in various locations, which, in general, affects write performance, as well as performance of Top-N
reads (selecting N latest rows).

There is a proposal to implement newer versions of UUID both in RFC and Postgres – v7 provides a time-based UUID that
includes a millisecond-precision timestamp, sequence number, and additional entropy in the form of random or fixed bits.
This kind of UUID not only ensures global uniqueness but also preserves the temporal aspect, which can be very
beneficial for performance.

- [Commitfest: UUID v7](https://commitfest.postgresql.org/45/4388/)
- [rfc4122bis proposal](https://datatracker.ietf.org/doc/draft-ietf-uuidrev-rfc4122bis/)

📣 UUIDv7 has been committed to Postgres 18! https://x.com/samokhvalov/status/1867204871159710181

UUID values are 16-byte – the same as `timestamptz` or `timestamp` values.

Good materials explaining performance aspects:

- [The effect of Random UUID on database performance](https://twitter.com/hnasr/status/1695270411481796868) (video, ~19
  min) by [@hnasr](https://twitter.com/hnasr)

- [Identity Crisis: Sequence v. UUID as Primary Key](https://brandur.org/nanoglyphs/026-ids#ulids) by
  [@brandur](https://twitter.com/brandur)

Since Postgres doesn't support UUID v7 natively yet, there are two options to use them

- generate on client side
- implement a helper function in Postgres.

For the latter approach, here is [SQL function](https://gist.github.com/kjmph/5bd772b2c2df145aa645b837da7eca74)
(thanks [@DanielVerite](https://twitter.com/DanielVerite)):

```sql
create or replace function uuid_generate_v7(
  ts timestamptz default null
) returns uuid
as $$
  -- use random v4 uuid as starting point (which has the same variant we need)
  -- then overlay timestamp
  -- then set version 7 by flipping the 2 and 1 bit in the version 4 string
select encode(
  set_bit(
    set_bit(
      overlay(
        uuid_send(gen_random_uuid())
        placing substring(int8send(floor(extract(epoch from coalesce(ts, clock_timestamp())) * 1000)::bigint) from 3)
        from 1 for 6
      ),
      52, 1
    ),
    53, 1
  ),
  'hex')::uuid;
$$ language sql volatile;
```

Examples:

```sql
nik=# select uuid_generate_v7();
           uuid_generate_v7
--------------------------------------
 018c1be3-e485-7252-b80f-76a71843466a
(1 row)

nik=# select uuid_generate_v7();
           uuid_generate_v7
--------------------------------------
 018c1be3-e767-76b9-93dc-23c0c48be6c7
(1 row)

nik=# select uuid_generate_v7();
           uuid_generate_v7
--------------------------------------
 018c1be3-e973-7704-82ad-5967b79cf5c4
(1 row)
```

After a few minutes:

```sql
nik=# select uuid_generate_v7();
           uuid_generate_v7
--------------------------------------
 018c1be8-5002-70ab-96c0-c96ad5afa151
(1 row)
```

This function also supports generating UUIDv7 values for artbitrary timestamps, which can be useful in many scenarios:
```
nik=# select uuid_generate_v7('2024-10-15 01:02:03');
           uuid_generate_v7
--------------------------------------
 01928db2-42f8-7539-8b09-47d9a00e668b
(1 row)

nik=# select uuid_generate_v7('2024-10-15 01:02:03');
           uuid_generate_v7
--------------------------------------
 01928db2-42f8-74ba-82d7-e65125b0ac84
(1 row)
```

A few notes:

1) If you use these value in the `ORDER BY` clause, the chronological order will persist.

2) For the first 3 values (that we generated during a few seconds) there is a common prefix, `018c1be3-e`, and with the
   last value that was generated slightly later, there is common prefix `018c1be`.

3) Note `7` after the second hyphen in all values:
   ```
   018c1be3-e973-7... 👈 this means v7
   ```

4) The function returns a value of the UUID type, so it's still 16-byte (while text representation of it would take 36
   characters including hyphens, meaning 40 bytes total with `VARLENA` header):

   ```sql
   nik=# select pg_column_size(gen_random_uuid());
    pg_column_size
   ----------------
                16
   (1 row)

   nik=# select pg_column_size(uuid_generate_v7());
    pg_column_size
   ----------------
                16
   (1 row)
   ```

And here is a function that allows extracting timestamp from UUIDv7 value:
```sql
create or replace function public.uuid_v7_to_ts(uuid_v7 uuid) returns timestamp
as $$
select
    to_timestamp(
    (
        'x' || substring(
        encode(uuid_send(uuid_v7), 'hex')
        from 1 for 12
        )
    )::bit(48)::bigint / 1000.0
    )::timestamptz at time zone 'UTC';
$$ language sql immutable;
```

Let's test it for some values above:
```
nik=# select uuid_v7_to_ts('018c1be3-e485-7252-b80f-76a71843466a');
      uuid_v7_to_ts
-------------------------
 2023-11-29 16:22:49.221
(1 row)

nik=# select uuid_v7_to_ts('01928db2-42f8-7539-8b09-47d9a00e668b');
    uuid_v7_to_ts
---------------------
 2024-10-15 01:02:03
(1 row)
```