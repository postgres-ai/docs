---
title: Database Lab Engine components
sidebar_label: Database Lab Engine components
---

## Control instance

#### Name
Defined by user.

#### Container labels
- `dblab_control`
 
#### Responsibility
- Manages Database Lab Engine and clone instances
- Runs retrieval
- Provides HTTP API to manage snapshots and clones
- Generates an internal Database Lab RuntimeID on each start to mark related components

#### How to manage

Runs as a Docker container. Check out the [guide](/docs/how-to-guides/administration/engine-manage) to learn how to manage Database Lab.

---

## Clone instance

#### Name
Starts with the prefix `dblab_clone_`. 

The container clone names will correspond to ports. For example, `dblab_clone_6000` for the clone running on port 6000.

#### Container labels 
- `dblab_clone`

**Responsibility**
- Provides thin clones of your data

**How to manage**
- Using [HTTP API](/docs/reference-guides/database-lab-engine-api-reference)
- Using [CLI](/docs/reference-guides/dblab-client-cli-reference)
- Using GUI provided [Postgres.ai Platform](/docs/platform)

---

## Sync instance

#### Name
Starts with the prefix `dblab_sync_`. 

The container names will contain a Database Lab RuntimeID. For example, `dblab_sync_bt48bvi9c0h0`.

#### Container labels 
- `dblab_control`

#### Responsibility
- sets up a replica fetching WAL archives to provide continuously update of physically-restored data 

#### How to manage
Starts and stops automatically. 

To activate a sync instance, use the `syncInstance` option for a physical restore job in the Database Lab configuration file.

---

## Physical restore instance

#### Name 
Starts with the prefix `dblab_phr_`.
 
The container names will contain a Database Lab RuntimeID. For example, `dblab_phr_bt48bvi9c0h0`.

#### Container labels 
- `dblab_control`

#### Responsibility
- restores a physical copy of an initial database

#### How to manage
Starts and stops automatically. 

Executed by a physical restore job.

---

## Promote instance

#### Name
Starts with the prefix `dblab_sync_`. 

The container names will contain a Database Lab RuntimeID. For example, `dblab_sync_bt48bvi9c0h0`.

#### Container labels 
- `dblab_control`

#### Responsibility
- promotes a database after fetching of physically-restored data

#### How to manage
Starts and stops automatically. 

To activate data promotion, use the `promotion.enabled` option for a physical snapshot job in the Database Lab configuration file.

---

## Logical dump instance

#### Name
Starts with the prefix `dblab_ld_`. 

The container names will contain a Database Lab RuntimeID. For example, `dblab_ld_bt48bvi9c0h0`.

#### Container labels 
- `dblab_control`

#### Responsibility
- makes a logical copy of an initial database

#### How to manage
Starts and stops automatically. 

Executed by a logical dump job.

---

## Logical restore instance

#### Name
Starts with the prefix `dblab_lr_`. 

The container names will contain a Database Lab RuntimeID. For example, `dblab_lr_bt48bvi9c0h0`.

#### Container labels 
- `dblab_control`

#### Responsibility
- restores a logical copy of an initial database

#### How to manage
Starts and stops automatically. 

Executed by a logical restore job.
