---
title: Usage
---

## Command List
---
### Command `explain`
Analyze your query (`SELECT`, `INSERT`, `DELETE`, `UPDATE` or `WITH`) and generate recommendations.

---
### Command `exec`
Execute any query (for example, `CREATE INDEX`).

---
### Command `reset`
Revert the database to the initial state (usually takes less than a minute, all changes will be lost).

---
### psql commands
Provide `psql` meta information commands: `\d`, `\d+`, `\dt`, `\dt+`, `\di`, `\di+`, `\l`, `\l+`, `\dv`, `\dv+`, `\dm`, `\dm+`.
Show the official docs for more information: 

---
### Command `help`
Show help message.

## Usage examples
![Demo](assets/joe/demo.gif)

## Use cases

#### Define the task
Suppose we want to optimize the query:
```
select count(*) from posts where likes > 10 and created > '2019-10-01';
```

#### Run the explain command

![Use case - Initial explain](assets/joe/tutorial-use-case-1-initial-explain.png)

#### Consider the result
- Execution Time: *2.5 minutes*
- Joe Bot gives us some recommendations:
    - **Query processes too much data to return a relatively small number of rows**
    - **Specialized index needed**    
- Shared buffers reads: 165789 (**~1.30 GiB**) from the OS file cache, including disk I/O

#### Carefully consider the result
- Uses `Index Scan`.
- Rows Returned: `142`.
- Rows Removed by Filter: `170975`.

    ```
    Aggregate  (cost=276857.32..276857.33 rows=1 width=8) (actual time=148536.494..148536.495 rows=1 loops=1)
        Buffers: shared hit=4803 read=165789
        ->  Index Scan using iiii on public.posts  (cost=0.56..276856.00 rows=528 width=0) (actual time=25230.526..148536.091 rows=142 loops=1)
                Index Cond: (posts.likes > 10)
                Filter: (posts.created > '2019-10-01 00:00:00'::timestamp without time zone)
                Rows Removed by Filter: 170975
                Buffers: shared hit=4803 read=165789
    ```

- The query condition partially does not match the index condition. 
    ```
    Index Cond: (posts.likes > 10)
    Filter: (posts.created > '2019-10-01 00:00:00'::timestamp without time zone)
    ```

- **Need a specialized index.**

#### Optimize the query

- Сreate a new index in the current session:
    ```
    create index improved_ix_posts on posts(likes, created desc);
    ```

    ![Use case - Create index](assets/joe/tutorial-use-case-1-create-index.png)

#### Check the results

- Run the explain command again:
    ```
    explain select count(*) from posts where likes > 10 and created > '2019-10-01'
    ```
- Examine the results:
    ```
    Cost: 4147.02

    Time: 157.236 ms
    - planning: 1.185 ms
    - execution: 156.051 ms

    Shared buffers:
    - hits: 69 (~552.00 KiB) from the buffer pool
    - reads: 778 (~6.10 MiB) from the OS file cache, including disk I/O
    - dirtied: 0
    - writes: 0

    Aggregate  (cost=4147.01..4147.02 rows=1 width=8) (actual time=155.973..155.974 rows=1 loops=1)
        Buffers: shared hit=69 read=778
        ->  Index Only Scan using improved_ix_posts on public.posts  (cost=0.56..4145.69 rows=528 width=0) (actual time=3.981..155.870 rows=142 loops=1)
                Index Cond: ((posts.likes > 10) AND (posts.created > '2019-10-01 00:00:00'::timestamp without time zone))
                Heap Fetches: 142
                Buffers: shared hit=69 read=778

    ```

- Total optimization results:
    - Execution Time: *~ 150 ms*  
        - **1000x faster**

    - Shared buffers reads: 778 (~6.10 MiB) from the OS file cache, including disk I/Oincluding disk I/O 
        -  **218x less**

    - **Index Only Scan**
