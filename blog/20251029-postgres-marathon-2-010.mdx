---
title: "#PostgresMarathon 2-010: Prepared statements and partitioned table lock explosion, part 2"
date: 2025-10-29 23:59:59
authors: nik
tags: [Postgres insights, PostgresMarathon, internals, locks, prepared statements, partitioning]
---

In [#PostgresMarathon 2-009](https://postgres.ai/blog/20251028-postgres-marathon-2-009), we focused on Lock Manager's behavior when dealing with prepared statements and partitioned tables. 

And observed a lock explosion in our simple synthetic example: from 8 locks (custom plans) during first 5 calls, to 52 locks (building generic plan) in the 6th call, to 13 locks (using cached generic plan) in the 7th and subsequent calls. We left with questions:
- this lock explosion at the 6th call – why is it so exactly and can it be avoided?
- why do we lock all 12 partitions even though runtime pruning removes 11 of them?

Let's dig deeper.

<!--truncate-->

## The 6th call: why 52 locks?

In [#PostgresMarathon 2-008](https://postgres.ai/blog/20251014-postgres-marathon-2-008), we studied the code flow for unpartitioned tables. The same pattern applies here, but with a critical difference: while for the first 5 calls we had very efficient planning-time partition pruning, it is not used during generic plan building in the 6th call.

Let's trace the execution (using PG18 sources; `//` comments are mine):

**Step 1: [Acquire planner locks](https://github.com/postgres/postgres/blob/ef6168bafe9be1a5781b2c471ffa4650f31f9a77/src/backend/utils/cache/plancache.c#L1295)**

[`GetCachedPlan()`](https://github.com/postgres/postgres/blob/ef6168bafe9be1a5781b2c471ffa4650f31f9a77/src/backend/utils/cache/plancache.c#L1280-L1389) starts by locking the Query tree via [`AcquirePlannerLocks()`](https://github.com/postgres/postgres/blob/ef6168bafe9be1a5781b2c471ffa4650f31f9a77/src/backend/utils/cache/plancache.c#L726):

```c
AcquirePlannerLocks(plansource->query_list, true);
```

The Query tree (parser output) contains only the parent table reference. Result -- 4 locks acquired (parent table + 3 parent indexes). Partition locks will be acquired later during planning.

**Step 2: [plan type decision](https://github.com/postgres/postgres/blob/ef6168bafe9be1a5781b2c471ffa4650f31f9a77/src/backend/utils/cache/plancache.c#L1298)**

Function [`choose_custom_plan()`](https://github.com/postgres/postgres/blob/ef6168bafe9be1a5781b2c471ffa4650f31f9a77/src/backend/utils/cache/plancache.c#L1158-L1205) decides whether to use custom or generic plan:

```c
if (plansource->num_custom_plans < 5)
    return true;  // NOT taken (num_custom_plans = 5)

if (plansource->generic_cost < avg_custom_cost)
    return false;  // TAKEN (generic_cost = -1, meaning "not yet calculated")
```

Result here: use generic plan.

**Step 3: [build generic plan](https://github.com/postgres/postgres/blob/ef6168bafe9be1a5781b2c471ffa4650f31f9a77/src/backend/utils/cache/plancache.c#L1311)**

Since no cached plan exists yet ([`CheckCachedPlan()`](https://github.com/postgres/postgres/blob/ef6168bafe9be1a5781b2c471ffa4650f31f9a77/src/backend/utils/cache/plancache.c#L943) returns false), we build one:

```c
plan = BuildCachedPlan(plansource, qlist, NULL, queryEnv);
                                          // ^^^^ NULL = no bound parameters
```

**Inside step 3: partition pruning fails**

During planning, [`prune_append_rel_partitions()`](https://github.com/postgres/postgres/blob/ef6168bafe9be1a5781b2c471ffa4650f31f9a77/src/backend/optimizer/util/inherit.c#L318) attempts to prune partitions. It calls [`get_matching_partitions()`](https://github.com/postgres/postgres/blob/ef6168bafe9be1a5781b2c471ffa4650f31f9a77/src/backend/partitioning/partprune.c#L832), which eventually hits this [critical check](https://github.com/postgres/postgres/blob/ef6168bafe9be1a5781b2c471ffa4650f31f9a77/src/backend/partitioning/partprune.c#L2068-L2074):

```c
paramids = pull_exec_paramids(expr);
if (!bms_is_empty(paramids))  // TRUE - $1 detected as PARAM_EXEC
{
    context->has_exec_param = true;
    if (context->target != PARTTARGET_EXEC)  // TRUE - we're in planner
        return PARTCLAUSE_UNSUPPORTED;  // PRUNING FAILS
}
```

Why pruning fails:
- Our query has `WHERE event_time = $1`
- No `boundParams` provided (generic plan building)
- Parameter detected as `PARAM_EXEC`
- Context is `PARTTARGET_PLANNER` (not executor)
- Returns `PARTCLAUSE_UNSUPPORTED`

Result -- `get_matching_partitions()` returns all partitions:

```c
/* If there's nothing usable, return all partitions */
if (pruning_steps == NIL)
    return bms_add_range(NULL, 0, rel->nparts - 1);  // ALL 12 PARTITIONS
```

**Still inside step 3: expand all partitions**

Since pruning failed, the planner opens every partition via `try_table_open()`:

```c
childrel = try_table_open(childOID, lockmode);
```

All 12 partitions and their 36 indexes are opened and added to the `PlannedStmt`'s rtable (range table - the list of all tables and indexes referenced in the plan).

**Back to the top level: [cache the plan](https://github.com/postgres/postgres/blob/ef6168bafe9be1a5781b2c471ffa4650f31f9a77/src/backend/utils/cache/plancache.c#L1315)**

After `BuildCachedPlan()` returns, the plan is cached:

```c
plansource->gplan = plan;  // Cache plan with ALL partitions
```

The generic plan is now cached with all 52 relations in its range table. The 52 planner locks remain held until transaction end.

To summarize the mechanics of the 6th call:

```
GetCachedPlan()
├─ AcquirePlannerLocks() → 4 locks
├─ choose_custom_plan() → decide generic
└─ BuildCachedPlan()
   └─ pg_plan_queries()
      └─ standard_planner()
         └─ build_simple_rel() / expand_inherited_rtentry()
            ├─ prune_append_rel_partitions() → pruning fails
            ├─ try_table_open() for each partition → +12 locks (tables)
            └─ get_relation_info() for indexes → +36 locks (indexes)
   [returns plan with all 52 rels]
└─ Cache it → plansource->gplan = plan
```

So, on execution 6, we build a generic plan but cannot prune at planning time without parameter values. The planner must consider all partitions, locking all 52 relations.

To be continued.
