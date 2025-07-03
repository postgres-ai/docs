---
title: How to perform a Postgres major upgrade in a DBLab clone
sidebar_label: Upgrade Postgres in a clone
---

Here we discuss in-place major upgrades of Postgres inside DBLab clones, which can be very helpful for testing new Postgres versions before upgrading production. Switching to a new Postgres major version for the whole DBLab instance is outside of the scope of this help article.

:::info
DBLab Engine must be version `3.4.0` or higher. Postgres image used by DBLab has to be either "Generic" version `0.3.0` or newer, or "SE" (paid customers) version `0.4.0` or newer.
:::

:::info
The process described here is semi-automated. Full automation of Postgres upgrades inside clones is not yet supported. Some actions require SSH connection to the server with DBLab Engine.
:::

## 1. Create a clone and mark it "protected"
Create a clone [as usual](/docs/how-to-guides/cloning/create-clone).

It is recommended to mark the clone [protected](/docs/how-to-guides/cloning/clone-protection), so that DBLab Engine does not delete it during database maintenance.

Once the clone is created, remember its port.
:::

## 2. Connect to DBLab server using SSH and perform Postgres major upgrade
Perform the following steps to upgrade PostgreSQL inside your clone.

### 1. Export the clone port
Assuming your clone's port is 6000:
```bash
export DBLAB_CLONE_PORT=6000
```

### 2. Switch to clone's container
```bash
sudo docker exec -it dblab_clone_${DBLAB_CLONE_PORT} bash
```

### 3. Define necessary variables
Define a bunch of additional environment variables (edit if needed, e.g., `$PG_NEW_VERSION`)
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

### 4. Install new PostgreSQL packages
```bash
sudo apt update
# Exclude Citus package here (install it separately if needed)
sudo apt install -y $(dpkg -l | awk -v old="$PG_OLD_VERSION" -v new="$PG_NEW_VERSION" '$0 ~ "postgres" && $0 ~ old && $0 !~ "citus" { gsub(old, new, $2); print $2 }')
# Check installed packages
dpkg -l | grep postgres
```

### 5. Create new data directory
```bash
mkdir -p ${PG_NEW_DATA} && chmod 700 ${PG_NEW_DATA} && chown -R postgres:postgres ${PG_NEW_DATA}
echo ${PG_NEW_DATA}
```

### 6. Prepare Postgres configuration
```bash
# Remove 'logerrors' in shared_preload_libraries (or install new 'logerrors' package)
sed -i 's/,\s*logerrors//g' ${PGDATA}/postgresql.dblab.snapshot.conf
# Check shared_preload_libraries
grep shared_preload_libraries ${PGDATA}/postgresql.dblab.snapshot.conf
```

### 7. Initialize new data directory
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

### 8. Stop old Postgres
```bash
su postgres -c "/usr/lib/postgresql/${PG_OLD_VERSION}/bin/pg_ctl -D ${PG_OLD_DATA} stop"
# waiting for server to shut down.... done - might take up to a few minutes
# server stopped
```

### 9. Run `pg_upgrade` in `check` mode (dry run)
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

If your Postgres setup is compatible with the new version (you received the message "`Clusters are compatible`"), you can proceed. Otherwise, all reported issues have to be resolved before proceeding.

### 10. Upgrade Postgres
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

### 11. Copy Postgres configuration files
```bash
su postgres -c "cp ${PG_OLD_DATA}/*.conf ${PG_NEW_DATA}/"
```

### 12. Rename data directory
```bash
mv ${PG_OLD_DATA} ${PG_OLD_DATA}_old && mv ${PG_NEW_DATA} ${PG_OLD_DATA}
```

### 13. Start new Postgres
```bash
su postgres -c "/usr/lib/postgresql/${PG_NEW_VERSION}/bin/pg_ctl -D ${PGDATA} start \
  -o '-c unix_socket_directories=${PG_UNIX_SOCKET_DIR} -c port=${PG_SERVER_PORT}'"
```

### 14. Check Postgres version
```bash
psql -h ${PG_UNIX_SOCKET_DIR} -p ${PG_SERVER_PORT} -U ${PG_INSTALL_USER} -d template1 \
  -c "select version()"
```

### 15. Collect statistics for all tables
```bash
/usr/lib/postgresql/${PG_NEW_VERSION}/bin/vacuumdb \
  -h ${PG_UNIX_SOCKET_DIR} \
  -p ${PG_SERVER_PORT} \
  -U ${PG_INSTALL_USER} \
  --all \
  --analyze-only \
  --jobs 4 # adjust if needed; e.g., if server has 16 vCPUs and we can use them all, use 16
```

Optional (if any), collect statistics for partitioned tables.

  1. Connect to database (replace `DBNAME` with the name of your database):
  ```bash
  psql -h ${PG_UNIX_SOCKET_DIR} -p ${PG_SERVER_PORT} -U ${PG_INSTALL_USER} -d DBNAME
  ```

  2. Run the following query
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

Done! You can exit from container:
```bash
exit
```

## 3. Connect to clone
Now you can [connect](/docs/how-to-guides/cloning/connect-clone) to the clone and perform any tests and work on the new Postgres version.
