#!/bin/bash
# ---------------------------------------------------------------------------
# Runs once, on the first startup of an empty postgres-data volume.
# Provisions one PostgreSQL database per backend service.
# ---------------------------------------------------------------------------
set -euo pipefail

databases=(
  billingdb
  appointmentdb
  taskdb
  webstoredb
  iamdb
)

for db in "${databases[@]}"; do
  echo "Creating database '${db}' owned by '${POSTGRES_USER}'..."
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    SELECT 'CREATE DATABASE "${db}"'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${db}')\gexec
    ALTER DATABASE "${db}" OWNER TO "${POSTGRES_USER}";
    GRANT ALL PRIVILEGES ON DATABASE "${db}" TO "${POSTGRES_USER}";
EOSQL
done

echo "Local databases ready: ${databases[*]}"
