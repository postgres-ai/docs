---
title: How to flush caches (OS page cache and Postgres buffer pool)
sidebar_label: flush caches (OS page cache and PG buffer pool)
description: ''
keywords:
  - postgresql
  - flush
  - caches
  - page
  - cache
  - postgres
  - buffer
  - pool)
  - intermediate
tags:
  - intermediate
  - caches
  - performance
  - testing
  - buffer-pool
  - os-cache
difficulty: intermediate
estimated_time: 5 min
---


For experiments, it is important to take into account the state of caches – Postgres buffer pool (size of which is
controlled by `shared_buffers`) and OS page cache. If we decide to start each experiment run with cold caches, we need
to flush them.

## Flushing Postgres buffer pool

To flush Postgres buffer pool, restart Postgres.

To analyze the current state of the buffer pool,
use [pg_buffercache](https://postgresql.org/docs/current/pgbuffercache.html).

## Flushing OS page cache

To flush Linux page cache:

```bash
sync
echo 3 > /proc/sys/vm/drop_caches
```

To see the current state of RAM consumption (in MiB) in Linux:

```bash
free -m
```

On macOS, to flush the page cache:

```bash
sync
sudo purge
```

To see the current state of RAM on macOS:

```bash
vm_stat
```
