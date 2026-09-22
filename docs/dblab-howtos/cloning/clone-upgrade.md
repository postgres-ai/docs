---
title: How to perform a Postgres major upgrade in a DBLab clone
sidebar_label: Upgrade Postgres in a clone
description: Upgrade a single DBLab clone to a newer Postgres major version with one command (dblab clone upgrade, the UI, or the API) to rehearse a production upgrade on real data. DBLab Engine 4.2+.
---

DBLab Engine 4.2 can move a single clone to a newer Postgres major version in place, without touching the rest of the instance. This makes it practical to rehearse a production upgrade against production-like data: run the upgrade on a clone, test the application against it, then throw the clone away.

The clone's Postgres is shut down cleanly, `pg_upgrade --link` converts its data directory in place, and the clone restarts on an image of the target major. Because `--link` hard-links the data files instead of copying them, the upgrade is fast and consumes almost no extra space.

Switching the whole DBLab instance to a new Postgres major version is outside the scope of this article.

:::info
DBLab Engine must be version `4.2.0` or higher. On older engines, use the [manual procedure](#manual-procedure-dblab-engine-before-42) at the end of this page.
:::

## Enable clone upgrades on the instance

Clone upgrades are off until the administrator sets `provision.pgUpgradeImage` in `server.yml`. The image is built on the target major's binaries and is the single source of the target version: users do not choose a version when they upgrade a clone.

```yaml
provision:
  pgUpgradeImage: "postgresai/pg-upgrade:17"   # clones are upgraded to PostgreSQL 17
  pgUpgradeTimeout: 3h                          # optional, default: 3h
  pgUpgradePullTimeout: 1h                      # optional, default: 1h
```

- The engine reads the major out of a release tag (`:17`, `:17-0.8.0`, `:17-0.8.0-glibc236`) and re-reads it from the image's own `PG_MAJOR` before every upgrade, so a tag repointed at another build is caught before any data moves. A tag that states no major (a digest pin, `latest`, a CI build) is fetched in the background at startup and the major is read from the image; until that lands the upgrade reports itself unavailable.
- `pgUpgradeTimeout` bounds a single upgrade run. When it runs out, the upgrade container is removed and the outcome is classified like any other failure: if no data had been converted yet the clone restarts on its original version, otherwise it is rebuilt from its origin snapshot (see [How an upgrade can end](#how-an-upgrade-can-end)).
- `pgUpgradePullTimeout` bounds each of the two image pulls that precede the upgrade. The upgrade image carries the target major plus the server packages of the four preceding ones, so the first upgrade on an instance downloads several gigabytes; pre-pulling both images makes this step a no-op. The pulls happen while the clone is still serving traffic, so exceeding this budget leaves the clone untouched and running.
- `upgradeImageAllowList` (optional) restricts which repositories an explicit `--docker-image` may name. When it is empty, as it is by default, any repository the instance can reach is accepted.

:::caution Restrict the images users may run
Any API token that can upgrade a clone can also pass `--docker-image`, and by default the engine runs whatever image it names, as the clone container, over that clone's data. Set `upgradeImageAllowList` (for example to `["postgresai/extended-postgres"]`) whenever the engine API is reachable by anyone other than administrators, and in particular when `platform.enablePersonalTokens` is on.
:::

Reload the configuration or restart the engine after the change (see [Reconfigure DBLab Engine](/docs/dblab-howtos/administration/engine-manage#reconfigure-dblab-engine)). The instance then reports the target in `GET /status` as `cloneUpgrade.targetVersion`, and the UI shows it on the confirmation dialog.

See the [configuration reference](/docs/reference-guides/database-lab-engine-configuration-reference#section-provision-thin-cloning-environment-settings) for the full description of these options.

## Upgrade a clone

Create a clone [as usual](/docs/dblab-howtos/cloning/create-clone). It is a good idea to mark it [protected](/docs/dblab-howtos/cloning/clone-protection) so that it is not deleted while you test.

### GUI
1. Open the **Database Lab clone** page.
2. Click **Upgrade clone**. The dialog shows the clone's current major and the target major the instance is configured for.
3. Confirm. The clone status changes to **Upgrading**; when it returns to **OK**, the clone runs the new version.

### CLI
Before you run any commands, install the DBLab CLI and initialize the configuration. For more information, see [Install and initialize DBLab CLI](/docs/dblab-howtos/cli/cli-install-init).

Reference: [`dblab clone upgrade`](/docs/reference-guides/dblab-client-cli-reference#subcommand-upgrade).

```bash
dblab clone upgrade my-clone
# The clone has been upgraded to PostgreSQL 17: my-clone
```

The command waits for the upgrade to finish (up to 30 minutes) and prints the version the clone ended up on. Add `--async` to return as soon as the engine accepts the request, then watch `dblab clone status my-clone`:

```bash
dblab clone upgrade --async my-clone
# The clone is being upgraded to PostgreSQL 17: my-clone
```

By default the engine keeps the clone's current image and substitutes only the major in its tag (`postgresai/extended-postgres:16-0.8.0-glibc236` becomes `postgresai/extended-postgres:17-0.8.0-glibc236`), so the extension bundle and the glibc build stay the same. To run the upgraded clone on a different image, pass `--docker-image`; when its tag names a major, it must be the target major:

```bash
dblab clone upgrade --docker-image postgresai/extended-postgres:17-0.8.0 my-clone
```

### API
Reference: [DBLab API](/docs/reference-guides/database-lab-engine-api-reference).

```bash
curl -X POST \
  -H "Verification-Token: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}' \
  http://localhost:2345/clone/my-clone/upgrade
```

The optional body field `dockerImage` has the same meaning as the CLI flag. The request returns as soon as the clone enters the `UPGRADING` state, with the plan the engine derived (`targetVersion`, `dockerImage`). Poll `GET /clone/{id}` for the result: `status.code` returns to `OK` and `dbVersion` reports the new major.

A `clone_upgrade` [webhook](/docs/reference-guides/database-lab-engine-configuration-reference#section-webhooks-webhook-configuration) is sent when an upgrade succeeds.

## How an upgrade can end

Almost every outcome leaves the clone running:

| Clone status | Meaning |
|---|---|
| `OK` | The clone runs the target version; `dbVersion` reports it. |
| `WARNING` | The upgrade was not applied. Either nothing had been converted and the clone still runs its original version, or conversion had begun and the clone was rebuilt from its origin snapshot, in which case data written since the clone was created is lost. The status message says which, and points at the `pg_upgrade` log under `<clone directory>/upgrade/logs/`. |
| `WARNING`, clone not running | The upgrade settled on disk but the clone container did not come back up. The data directory is intact and the upgrade is still recorded as pending, so the next engine start finishes or undoes it and brings the clone back. |
| `FATAL` | Recovery itself failed and there is nothing left to finish. Reset or delete the clone. |

## Roll back

[Reset the clone](/docs/dblab-howtos/cloning/reset-clone). A reset re-provisions the clone from its origin snapshot using the instance-wide image, so it always returns the clone to the version the instance is configured with.

## Things to know

- The clone's current major must be 12 or newer: the upgrade image carries no binaries for older versions, so clones on Postgres 10 or 11 are always refused.
- The target must be newer than the clone's current major and at most four majors ahead, because the upgrade image carries binaries for the four preceding versions. A clone outside that range is refused; upgrading it means pointing `pgUpgradeImage` at a different major.
- Only majors DBLab ships a default configuration for can be targeted (up to 18 at the time of writing). In practice, clones on 12 to 17 can be upgraded to 13 to 18.
- `pg_upgrade` verifies that every extension in the source database has a matching library for the new major. An extension outside the image's set fails this check and the clone rolls back untouched.
- Clones using non-default tablespaces are refused, because those live outside the clone dataset.
- In physical mode the sync instance and the pool are untouched; the upgrade only ever acts on a clone's own dataset. The instance-wide `dockerImage` must still match the source major.
- The upgrade does not run `ANALYZE`. Collect statistics before measuring query performance on the upgraded clone, for example with `vacuumdb --all --analyze-only --jobs N`.

:::caution Known limitation: snapshots of upgraded clones
A snapshot created from an upgraded clone does not record its major version, so clones created from that snapshot start on the instance-wide image and fail to start. Avoid snapshotting upgraded clones until snapshot-level version resolution lands.
:::

## Manual procedure (DBLab Engine before 4.2)

<details>
<summary>Semi-automated upgrade with SSH access to the DBLab server</summary>

This procedure applies to DBLab Engine `3.4.0` to `4.1.x`. The Postgres image used by DBLab must be either "Generic" version `0.3.0` or newer, or "SE" (paid customers) version `0.4.0` or newer. Some steps require an SSH connection to the server with DBLab Engine.

#### 1. Create a clone and mark it "protected"
Create a clone [as usual](/docs/dblab-howtos/cloning/create-clone) and mark it [protected](/docs/dblab-howtos/cloning/clone-protection). Remember its port.

#### 2. Export the clone port
Assuming your clone's port is 6000:
```bash
export DBLAB_CLONE_PORT=6000
```

#### 3. Switch to the clone's container
```bash
sudo docker exec -it dblab_clone_${DBLAB_CLONE_PORT} bash
```

#### 4. Define necessary variables
Define additional environment variables (edit if needed, for example `$PG_NEW_VERSION`):
```bash
export PG_USER=postgres
export PG_NEW_VERSION=17  # target major version
export PG_OLD_VERSION=${PG_SERVER_VERSION}
export PG_OLD_DATA=${PGDATA}  # data directory
export PG_NEW_DATA=${PGDATA}${PG_NEW_VERSION}
export PG_SHARED_PRELOAD_LIBRARIES=$(psql -h $PG_UNIX_SOCKET_DIR -p $PG_SERVER_PORT -U $PG_USER -d template1 -tAXc "show shared_preload_libraries" | sed 's/,\s*logerrors//')
export PG_INSTALL_USER=$(psql -h $PG_UNIX_SOCKET_DIR -p $PG_SERVER_PORT -U $PG_USER -d template1 -tAXc "select rolname from pg_roles where oid = 10")
export PG_DATA_CHECKSUMS=$(psql -h $PG_UNIX_SOCKET_DIR -p $PG_SERVER_PORT -U $PG_USER -d template1 -tAXc "show data_checksums")
export PG_SERVER_ENCODING=$(psql -h $PG_UNIX_SOCKET_DIR -p $PG_SERVER_PORT -U $PG_USER -d template1 -tAXc "show server_encoding")
export PG_LC_COLLATE=$(psql -h $PG_UNIX_SOCKET_DIR -p $PG_SERVER_PORT -U $PG_USER -d template1 -tAXc "select datcollate from pg_database where datname='template0'")
export PG_LC_CTYPE=$(psql -h $PG_UNIX_SOCKET_DIR -p $PG_SERVER_PORT -U $PG_USER -d template1 -tAXc "select datctype from pg_database where datname='template0'")
export PG_LC_MESSAGES=$(psql -h $PG_UNIX_SOCKET_DIR -p $PG_SERVER_PORT -U $PG_USER -d template1 -tAXc "show lc_messages")
export PG_LC_MONETARY=$(psql -h $PG_UNIX_SOCKET_DIR -p $PG_SERVER_PORT -U $PG_USER -d template1 -tAXc "show lc_monetary")
export PG_LC_NUMERIC=$(psql -h $PG_UNIX_SOCKET_DIR -p $PG_SERVER_PORT -U $PG_USER -d template1 -tAXc "show lc_numeric")
export PG_LC_TIME=$(psql -h $PG_UNIX_SOCKET_DIR -p $PG_SERVER_PORT -U $PG_USER -d template1 -tAXc "show lc_time")
# Check variables
env | grep PG_ | sort
```

#### 5. Install new PostgreSQL packages
```bash
sudo apt update
# Exclude Citus package here (install it separately if needed)
sudo apt install -y $(dpkg -l | awk -v old="$PG_OLD_VERSION" -v new="$PG_NEW_VERSION" '$0 ~ "postgres" && $0 ~ old && $0 !~ "citus" { gsub(old, new, $2); print $2 }')
# Check installed packages
dpkg -l | grep postgres
```

#### 6. Create new data directory
```bash
mkdir -p ${PG_NEW_DATA} && chmod 700 ${PG_NEW_DATA} && chown -R postgres:postgres ${PG_NEW_DATA}
echo ${PG_NEW_DATA}
```

#### 7. Prepare Postgres configuration
```bash
# Remove 'logerrors' in shared_preload_libraries (or install new 'logerrors' package)
sed -i 's/,\s*logerrors//g' ${PGDATA}/postgresql.dblab.snapshot.conf
# Check shared_preload_libraries
grep shared_preload_libraries ${PGDATA}/postgresql.dblab.snapshot.conf
```

#### 8. Initialize new data directory
```bash
initdb_command="/usr/lib/postgresql/${PG_NEW_VERSION}/bin/initdb \
  --username=${PG_INSTALL_USER} \
  --encoding=${PG_SERVER_ENCODING} \
  --lc-collate=${PG_LC_COLLATE} \
  --lc-ctype=${PG_LC_CTYPE} \
  --lc-messages=${PG_LC_MESSAGES} \
  --lc-monetary=${PG_LC_MONETARY} \
  --lc-numeric=${PG_LC_NUMERIC} \
  --lc-time=${PG_LC_TIME} \
  --pgdata=${PG_NEW_DATA}"

if [[ "${PG_DATA_CHECKSUMS}" = "on" ]]; then
  initdb_command="${initdb_command} --data-checksums"
fi

su postgres -c "${initdb_command}"
```

#### 9. Stop old Postgres
```bash
su postgres -c "/usr/lib/postgresql/${PG_OLD_VERSION}/bin/pg_ctl -D ${PG_OLD_DATA} stop"
# waiting for server to shut down.... done - might take up to a few minutes
# server stopped
```

#### 10. Run `pg_upgrade` in `check` mode (dry run)
```bash
su postgres -c "cd /var/lib/postgresql && /usr/lib/postgresql/${PG_NEW_VERSION}/bin/pg_upgrade \
  --socketdir=/tmp \
  --username=${PG_INSTALL_USER} \
  --old-bindir=/usr/lib/postgresql/${PG_OLD_VERSION}/bin/ \
  --new-bindir=/usr/lib/postgresql/${PG_NEW_VERSION}/bin/ \
  --old-datadir=${PG_OLD_DATA} \
  --new-datadir=${PG_NEW_DATA} \
  --old-options '-c config_file=${PG_OLD_DATA}/postgresql.conf' \
  --new-options \"-c config_file=${PG_NEW_DATA}/postgresql.conf -c shared_preload_libraries='${PG_SHARED_PRELOAD_LIBRARIES}'\" \
  --link \
  --check"
```

If your Postgres setup is compatible with the new version (you received the message "`Clusters are compatible`"), you can proceed. Otherwise, resolve all reported issues before proceeding.

#### 11. Upgrade Postgres
```bash
su postgres -c "cd /var/lib/postgresql && /usr/lib/postgresql/${PG_NEW_VERSION}/bin/pg_upgrade \
  --socketdir=/tmp \
  --username=${PG_INSTALL_USER} \
  --old-bindir=/usr/lib/postgresql/${PG_OLD_VERSION}/bin/ \
  --new-bindir=/usr/lib/postgresql/${PG_NEW_VERSION}/bin/ \
  --old-datadir=${PG_OLD_DATA} \
  --new-datadir=${PG_NEW_DATA} \
  --old-options '-c config_file=${PG_OLD_DATA}/postgresql.conf' \
  --new-options \"-c config_file=${PG_NEW_DATA}/postgresql.conf -c shared_preload_libraries='${PG_SHARED_PRELOAD_LIBRARIES}'\" \
  --link"
```

#### 12. Copy Postgres configuration files
```bash
su postgres -c "cp ${PG_OLD_DATA}/*.conf ${PG_NEW_DATA}/"
```

#### 13. Rename data directory
```bash
mv ${PG_OLD_DATA} ${PG_OLD_DATA}_old && mv ${PG_NEW_DATA} ${PG_OLD_DATA}
```

#### 14. Start new Postgres
```bash
su postgres -c "/usr/lib/postgresql/${PG_NEW_VERSION}/bin/pg_ctl -D ${PGDATA} start \
  -o '-c unix_socket_directories=${PG_UNIX_SOCKET_DIR} -c port=${PG_SERVER_PORT}'"
```

#### 15. Check Postgres version
```bash
psql -h ${PG_UNIX_SOCKET_DIR} -p ${PG_SERVER_PORT} -U ${PG_INSTALL_USER} -d template1 \
  -c "select version()"
```

#### 16. Collect statistics for all tables
```bash
/usr/lib/postgresql/${PG_NEW_VERSION}/bin/vacuumdb \
  -h ${PG_UNIX_SOCKET_DIR} \
  -p ${PG_SERVER_PORT} \
  -U ${PG_INSTALL_USER} \
  --all \
  --analyze-only \
  --jobs 4 # adjust if needed; e.g., if server has 16 vCPUs and we can use them all, use 16
```

Optional (if any), collect statistics for partitioned tables. Connect to the database (replace `DBNAME` with the name of your database) and run:
```sql
select
  format(
    'analyze verbose %I.%I;',
    relnamespace::oid::regnamespace,
    oid::regclass
  ) as vacuum_command
from pg_class
where relkind = 'p' \gexec
```

Done. Exit the container with `exit` and [connect](/docs/dblab-howtos/cloning/connect-clone) to the clone.

</details>

## Related
- Guide: [Reset a clone](/docs/dblab-howtos/cloning/reset-clone)
- Guide: [Protect clones from deletion](/docs/dblab-howtos/cloning/clone-protection)
- Reference: [`provision` configuration](/docs/reference-guides/database-lab-engine-configuration-reference#section-provision-thin-cloning-environment-settings)
