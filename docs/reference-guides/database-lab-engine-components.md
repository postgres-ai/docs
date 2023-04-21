---
title: Database Lab Engine components
sidebar_label: DLE components
---

## Main container
#### Name
User-defined.

#### Container labels
- `dblab_control`
 
#### Responsibility
- Manages all other containers
- Handles data retrieval and snapshot creation
- Offers an HTTP API to manage snapshots and clones
- Generates an internal DLE RuntimeID on each start to mark related components

#### How to manage
Operates as a Docker container. See the [guide](/docs/how-to-guides/administration/engine-manage) for administering DLE.

---

## Clone container
#### Name
Begins with the prefix `dblab_clone_`. 

The clone's container name is associated with its port number, such as `dblab_clone_6000` for a clone operating on port 6000.

#### Container labels 
- `dblab_clone`
- <pool_name>

#### Responsibility
- Provides a thin clone: an independent PostgreSQL database server with thinly cloned / branched data directory

#### How to manage
- Using [HTTP API](/docs/reference-guides/database-lab-engine-api-reference)
- Using [CLI](/docs/reference-guides/dblab-client-cli-reference)
- Using [UI](/docs/database-lab/user-interface)

---

## Sync container
#### Name
Begins with the prefix `dblab_sync_`.

Container names include a DLE RuntimeID, such as `dblab_sync_bt48bvi9c0h0`.

#### Container labels 
- `dblab_control`: `dblab_sync`
- `dblab_instance_id`: <dle_instance_id>
- `dblab_engine_name`: <dle_container_name>

#### Responsibility
- Sets up a replica fetching WALs from either archives or source database to maintain continuously updated state of the original data directory

#### How to manage
Automatically starts and stops.

To activate a sync instance, use the `syncInstance` option for a physical restore job in the DLE configuration file.

---

## Physical restore container
#### Name 
Begins with the prefix `dblab_phr_`.
 
Container names include a DLE RuntimeID, such as `dblab_phr_bt48bvi9c0h0`.

#### Container labels 
- `dblab_control`: `dblab_restore`
- `dblab_instance_id`: <dle_instance_id>
- `dblab_engine_name`: <dle_container_name>

#### Responsibility
- Restores a physical copy of the initial database

#### How to manage
Automatically starts and stops.

Executed by a physical restore job.

---

## Promote container
#### Name
Begins with the prefix `dblab_promote_`. 

Container names include a DLE RuntimeID, such as  `dblab_promote_bt48bvi9c0h0`.

#### Container labels 
- `dblab_control`: `dblab_promote`
- `dblab_instance_id`: <dle_instance_id>
- `dblab_engine_name`: <dle_container_name>

#### Responsibility
- Promotes a database after fetching of physically-restored data

#### How to manage
Automatically starts and stops.

To activate data promotion, use the `promotion.enabled` option for a physical snapshot job in the Database Lab configuration file.

---

## Logical dump container
#### Name
Begins with the prefix `dblab_ld_`. 

Container names include a Database Lab RuntimeID, such as `dblab_ld_bt48bvi9c0h0`.

#### Container labels 
- `dblab_control`: `dblab_dump`
- `dblab_instance_id`: <dle_instance_id>
- `dblab_engine_name`: <dle_container_name>

#### Responsibility
- Creates a logical copy (dump) of the source database

#### How to manage
Automatically starts and stops.

Executed by a logical dump job.

---

## Logical restore container
#### Name
Starts with the prefix `dblab_lr_`. 

The container names will contain a DLE RuntimeID. For example, `dblab_lr_bt48bvi9c0h0`.

#### Container labels 
- `dblab_control`: `dblab_restore`
- `dblab_instance_id`: <dle_instance_id>
- `dblab_engine_name`: <dle_container_name>

#### Responsibility
- Restores a database from a logical copy (dump) of the source database

#### How to manage
Automatically starts and stops.

Executed by a logical restore job.

---

## Logical patch container
#### Name
Begins with the prefix `dblab_patch_`.

Container names include a DLE RuntimeID, such as `dblab_patch_bt48bvi9c0h0`.

#### Container labels
- `dblab_control`: `dblab_patch`
- `dblab_instance_id`: <dle_instance_id>
- `dblab_engine_name`: <dle_container_name>

#### Responsibility
- Executes preprocessing queries before capturing a logical snapshot

#### How to manage
Automatically starts and stops.

Runs during a logical restore job if preprocessing queries are enabled in the configuration settings (`logicalSnapshot.options.dataPatching`).

---

## Embedded UI container
#### Name
Begins with the prefix `dblab_embedded_ui_`.

Container names include a DLE RuntimeID, such as `dblab_embedded_ui_bt48bvi9c0h0`.

#### Container labels
- `dblab_satellite`: `dblab_embedded_ui`
- `dblab_instance_id`: <dle_instance_id>
- `dblab_engine_name`: <dle_container_name>

#### Responsibility
- provides a visual user interface (UI) for interacting with the DLE.

#### How to manage
Automatically starts and stops based on configuration settings in the `embeddedUI` section.
