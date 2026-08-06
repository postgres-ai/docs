---
title: Rename databases during snapshot creation
sidebar_label: Rename databases
description: Use the databaseRename option in DBLab Engine to expose different database names in clones than in the source, for logical and physical snapshots.
---

Use the `databaseRename` option when you want DBLab clones to expose different database names than the source system. This is useful when production database names include environment-specific suffixes such as `_prod`, but your development and CI tooling expects names like `_dev` or `_test`.

:::note
`databaseRename` is supported in DBLab Engine 4.1 and later.
:::

## When to use it

Typical cases:

- production uses `app_prod`, but clones should expose `app_dev`
- you want to normalize database names across environments before tests run
- you need clone database names to match application defaults without changing production

The rename happens during snapshot preparation on the DBLab side. It does not rename databases in the source system.

## Logical snapshots

For dump/restore workflows, add `databaseRename` under `retrieval.spec.logicalSnapshot.options`:

```yaml
retrieval:
  spec:
    logicalSnapshot:
      options:
        databaseRename:
          app_prod: app_dev
          analytics_prod: analytics_ci
```

DBLab will restore data from the original names and then rename those databases before the snapshot is finalized.

## Physical snapshots

For physical workflows, add `databaseRename` under `retrieval.spec.physicalSnapshot.options`:

```yaml
retrieval:
  spec:
    physicalSnapshot:
      options:
        databaseRename:
          app_prod: app_dev
          analytics_prod: analytics_ci
```

This runs after `preprocessingScript`, which is useful if your rename logic depends on earlier prep steps.

## Things to keep in mind

- Keys are original source database names; values are the names that clones will expose.
- Update connection settings in your application or test suite to use the renamed database names.
- If you already use `preprocessingScript`, remember that `databaseRename` runs after it.

## Related

- Reference: [DBLab Engine configuration reference](/docs/reference-guides/database-lab-engine-configuration-reference)
- Guide: [How to create a DBLab clone](/docs/dblab-howtos/cloning/create-clone)
