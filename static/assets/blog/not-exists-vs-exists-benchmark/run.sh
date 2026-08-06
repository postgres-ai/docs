#!/usr/bin/env bash
# Benchmark: NOT EXISTS(deleted) vs EXISTS(NOT deleted) — partial indexes
#
# Full reproducible script. Tested on PG18, CCX33 (8 vCPU, 32 GiB), Hetzner NBG1.
# Results: https://gitlab.com/postgres-ai/postgresql-consulting/tests-and-benchmarks/-/issues/74
# Blog post: https://postgres.ai/blog/20260306-not-exists-vs-exists-partial-index
#
# Usage:
#   sudo bash run.sh
#
# Requirements:
#   - PostgreSQL 14+ (tested on PG18)
#   - pg_prewarm extension (postgresql-contrib)
#   - Dedicated benchmark VM (not the machine you work on)
#   - Run as root or a user with sudo + pg_ctlcluster access

set -Eeuo pipefail
IFS=$'\n\t'

PG_SUPERUSER="${PG_SUPERUSER:-postgres}"
DB="bench"
ROWS=50000000
TAG_ROWS=500000

log() { echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] $*"; }

psql_bench() { sudo -u "$PG_SUPERUSER" psql -d "$DB" "$@"; }
psql_root()  { sudo -u "$PG_SUPERUSER" psql "$@"; }

drop_caches() {
    log "Dropping OS page cache + restarting PostgreSQL..."
    systemctl stop postgresql
    echo 3 > /proc/sys/vm/drop_caches
    systemctl start postgresql
    sleep 2
}

run_explain() {
    local label="$1" sql="$2"
    log "Running: ${label}"
    echo ""
    echo "### ${label}"
    echo "\`\`\`"
    psql_bench -c "explain (analyze, buffers, verbose, settings, format text) ${sql}"
    echo "\`\`\`"
    echo ""
}

# ── Setup ─────────────────────────────────────────────────────────────────────

log "Applying PostgreSQL settings..."
psql_root -c "alter system set shared_buffers = '8GB';"
psql_root -c "alter system set effective_cache_size = '24GB';"
psql_root -c "alter system set work_mem = '64MB';"
psql_root -c "alter system set random_page_cost = 1.1;"
psql_root -c "alter system set track_io_timing = on;"
psql_root -c "select pg_reload_conf();"

log "Creating database and tables..."
psql_root -c "drop database if exists ${DB};" 2>/dev/null || true
psql_root -c "create database ${DB};"

psql_bench <<SQL
-- autovacuum disabled: VM state must be fully deterministic
create table posts (
    post_id  bigint primary key,
    deleted  boolean not null default false,
    content  text not null default repeat('x', 200)
) with (autovacuum_enabled = false);

create table post_tags (
    tag_id   int not null,
    post_id  bigint not null,
    primary key (tag_id, post_id)
) with (autovacuum_enabled = false);
SQL

log "Inserting ${ROWS} rows into posts (2% deleted)..."
psql_bench -c "
insert into posts (post_id, deleted)
select g, (random() < 0.02)
from generate_series(1, ${ROWS}) g;"

log "Creating partial indexes..."
psql_bench -c "create unique index posts_not_deleted_id_key on posts (post_id) where not deleted;"
psql_bench -c "create unique index posts_deleted_id_key     on posts (post_id) where deleted;"

log "Inserting ${TAG_ROWS} rows into post_tags..."
psql_bench -c "
insert into post_tags (tag_id, post_id)
select (g % 1000) + 1, (random() * $((ROWS - 1)) + 1)::bigint
from generate_series(1, ${TAG_ROWS}) g
on conflict do nothing;"

# ── Correct VM state ──────────────────────────────────────────────────────────
# Step 1: vacuum analyze — fill visibility map cleanly
log "Running vacuum analyze posts..."
psql_bench -c "vacuum analyze posts;"
psql_bench -c "vacuum analyze post_tags;"

# Step 2: controlled dirty update — simulate active production table
log "Dirtying 10% of pages..."
psql_bench -c "update posts set content = repeat('y', 200) where post_id % 10 = 0;"

# Step 3: analyze only — update stats, do NOT re-clean the VM
psql_bench -c "analyze posts;"

# Verify: last_autovacuum must be NULL
log "Verifying autovacuum never ran..."
psql_bench -c "
select relname, last_autovacuum, last_autoanalyze
from pg_stat_user_tables
where relname in ('posts', 'post_tags')
order by relname;"

# Sizes
log "Table and index sizes:"
psql_bench -c "
select indexrelname, pg_size_pretty(pg_relation_size(indexrelid)) as size
from pg_stat_user_indexes
where relname = 'posts'
order by indexrelname;"
psql_bench -c "select pg_size_pretty(pg_relation_size('posts')) as heap_size;"

log "PG config:"
psql_bench -c "show shared_buffers; show effective_cache_size; show work_mem; show random_page_cost; show track_io_timing;"

# ── Queries ───────────────────────────────────────────────────────────────────

q1() { local s=$1; echo "select pt.*
from post_tags pt
where pt.tag_id = any(array(select generate_series(1,${s})))
  and exists (
      select
      from posts
      where posts.post_id = pt.post_id
        and not deleted
  );"; }

q2() { local s=$1; echo "select pt.*
from post_tags pt
where pt.tag_id = any(array(select generate_series(1,${s})))
  and not exists (
      select
      from posts
      where posts.post_id = pt.post_id
        and deleted
  );"; }

# ── Cold cache: all scales ─────────────────────────────────────────────────────

echo ""
echo "================================================================"
echo "COLD CACHE"
echo "================================================================"

for scale in 50 250 1000; do
    drop_caches
    run_explain "Q1 EXISTS(NOT deleted) — ${scale} tag_ids — COLD" "$(q1 $scale)"
    drop_caches
    run_explain "Q2 NOT EXISTS(deleted) — ${scale} tag_ids — COLD" "$(q2 $scale)"
done

# ── Hot cache: pg_prewarm, 250 tag_ids ────────────────────────────────────────

echo ""
echo "================================================================"
echo "HOT CACHE — 250 tag_ids (pg_prewarm indexes + heap)"
echo "================================================================"

log "Prewarming..."
psql_bench <<SQL
create extension if not exists pg_prewarm;
select 'posts_not_deleted_id_key', pg_prewarm('posts_not_deleted_id_key');
select 'posts_deleted_id_key',     pg_prewarm('posts_deleted_id_key');
select 'posts (heap)',             pg_prewarm('posts');
SQL

run_explain "Q1 EXISTS(NOT deleted) — 250 tag_ids — HOT" "$(q1 250)"
run_explain "Q2 NOT EXISTS(deleted) — 250 tag_ids — HOT" "$(q2 250)"

echo ""
log "Done."
