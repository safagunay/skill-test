#!/bin/bash
set -e

# Wait for PostgreSQL to start
until pg_isready -U postgres; do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 1
done

# Check if the database exists
if psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='school_mgmt'" | grep -q 1; then
  echo "Database 'school_mgmt' already exists, skipping initialization."
else
  echo "Creating database 'school_mgmt' and initializing schema/data..."
  createdb -U postgres school_mgmt
  psql -U postgres -d school_mgmt -f /docker-entrypoint-initdb.d/01_tables.sql
  psql -U postgres -d school_mgmt -f /docker-entrypoint-initdb.d/02_seed.sql
fi

echo "Verifying db setup."
psql -d school_mgmt -c "SELECT COUNT(*) FROM users;"
