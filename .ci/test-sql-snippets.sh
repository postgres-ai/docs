#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
POSTGRES_VERSIONS="${POSTGRES_VERSIONS:-12 13 14 15 16 17 18}"
DOCKER_BIN="${DOCKER_BIN:-docker}"
IFS=' ' read -r -a DOCKER_CMD <<< "${DOCKER_BIN}"
TMP_DIR="$(mktemp -d)"
CONTAINERS=()

cleanup() {
  local container
  for container in "${CONTAINERS[@]:-}"; do
    "${DOCKER_CMD[@]}" rm -f "${container}" >/dev/null 2>&1 || true
  done
  rm -rf "${TMP_DIR}"
}
trap cleanup EXIT

extract_snippet() {
  local doc_path="$1"
  local snippet_name="$2"
  local output_path="$3"

  awk -v snippet="${snippet_name}" '
    $0 == "<!-- sql-snippet-test: " snippet " begin -->" { inside=1; next }
    $0 == "<!-- sql-snippet-test: " snippet " end -->" { inside=0; next }
    inside && $0 !~ /^```/ { print }
  ' "${doc_path}" > "${output_path}"

  if ! grep -q '[^[:space:]]' "${output_path}"; then
    echo "No SQL extracted for snippet ${snippet_name} from ${doc_path}" >&2
    return 1
  fi
}

wait_for_postgres() {
  local container="$1"
  local attempt
  for attempt in $(seq 1 60); do
    if "${DOCKER_CMD[@]}" exec "${container}" pg_isready -U postgres >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  echo "Postgres did not become ready in ${container}" >&2
  "${DOCKER_CMD[@]}" logs "${container}" >&2 || true
  return 1
}

run_snippet_on_version() {
  local version="$1"
  local sql_path="$2"
  local container="docs-sql-snippets-pg${version}-$$"

  echo "[sql-snippets] PostgreSQL ${version}: starting"
  "${DOCKER_CMD[@]}" rm -f "${container}" >/dev/null 2>&1 || true
  "${DOCKER_CMD[@]}" run \
    --detach \
    --name "${container}" \
    --env POSTGRES_PASSWORD=postgres \
    "postgres:${version}" \
    >/dev/null
  CONTAINERS+=("${container}")
  wait_for_postgres "${container}"

  echo "[sql-snippets] PostgreSQL ${version}: running xmin horizon snippet"
  "${DOCKER_CMD[@]}" exec -i "${container}" \
    psql -U postgres -d postgres -v ON_ERROR_STOP=1 \
    < "${sql_path}" \
    >/dev/null
  echo "[sql-snippets] PostgreSQL ${version}: ok"
}

main() {
  local doc_path="${ROOT_DIR}/docs/postgres-howtos/performance-optimization/monitoring/how-to-monitor-xmin-horizon.md"
  local sql_path="${TMP_DIR}/xmin-horizon.sql"

  extract_snippet "${doc_path}" "xmin-horizon" "${sql_path}"

  local versions=()
  local version
  IFS=' ' read -r -a versions <<< "${POSTGRES_VERSIONS}"
  for version in "${versions[@]}"; do
    run_snippet_on_version "${version}" "${sql_path}"
  done
}

main "$@"
