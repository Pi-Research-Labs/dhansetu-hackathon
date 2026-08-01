#!/usr/bin/env bash
# DHANSETU v1.2 -> Postgres. Idempotent: safe to re-run.
#
#   ./load.sh /path/to/dhansetu_v1_2        # data dir containing the CSVs
#
# Env overrides: PGDATABASE PGHOST PGPORT PGUSER
set -euo pipefail

DATA_DIR="${1:-../dhansetu_v1_2}"
SQL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB="${PGDATABASE:-dhansetu}"

command -v psql >/dev/null || { echo "psql not found. sudo apt install -y postgresql postgresql-client"; exit 1; }
[ -d "$DATA_DIR" ] || { echo "data dir not found: $DATA_DIR"; exit 1; }
[ -f "$DATA_DIR/enterprises.csv" ] || { echo "enterprises.csv not in $DATA_DIR"; exit 1; }

echo "==> database: $DB"
if ! psql -lqt 2>/dev/null | cut -d\| -f1 | grep -qw "$DB"; then
  createdb "$DB"
  echo "    created"
else
  echo "    exists"
fi

# gzipped tables are decompressed into a scratch dir so \copy needs no superuser
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
echo "==> staging CSVs in $WORK"
for f in "$DATA_DIR"/*.csv; do ln -sf "$(readlink -f "$f")" "$WORK/$(basename "$f")"; done
for f in "$DATA_DIR"/*.csv.gz; do
  [ -e "$f" ] || continue
  base="$(basename "$f" .gz)"
  gzip -dc "$f" > "$WORK/$base"
  printf '    %-34s %s\n' "$base" "$(wc -l < "$WORK/$base") lines"
done

run() { echo "==> $1"; psql -d "$DB" -v ON_ERROR_STOP=1 -q -f "$SQL_DIR/$1"; }

run 01_schema.sql
echo "==> 02_load.sql (this is the slow one, ~830k rows)"
( cd "$WORK" && psql -d "$DB" -v ON_ERROR_STOP=1 -f "$SQL_DIR/02_load.sql" )
run 03_constraints_indexes.sql
run 04_live_data.sql
run 05_views.sql
run 07_auth.sql
run 08_app_grants.sql

echo "==> row counts"
psql -d "$DB" -q -c "
SELECT relname AS table_name, n_live_tup AS rows
FROM pg_stat_user_tables WHERE schemaname='dhansetu'
ORDER BY n_live_tup DESC LIMIT 12;"

echo "==> sanity checks"
psql -d "$DB" -q -c "
SELECT 'enterprises' k, count(*)::text v FROM dhansetu.enterprises
UNION ALL SELECT 'districts/states/langs',
  concat(count(DISTINCT district),'/',count(DISTINCT state),'/',count(DISTINCT preferred_lang))
  FROM dhansetu.enterprises
UNION ALL SELECT 'stress_episodes', count(*)::text FROM dhansetu.stress_episodes
UNION ALL SELECT 'live forecast rows', count(*)::text FROM dhansetu.forecasts WHERE is_live_forecast
UNION ALL SELECT 'worklist (all officers)', count(*)::text FROM dhansetu.v_officer_worklist
UNION ALL SELECT 'Prakash worklist', count(*)::text FROM dhansetu.v_officer_worklist WHERE officer_id='FO1';"

echo
echo "done. try:  psql -d $DB -f $SQL_DIR/demo_queries.sql"
