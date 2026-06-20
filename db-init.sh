#!/bin/sh
set -eu

until pg_isready -h postgres -U "$DB_USER"; do
  sleep 2
done

create_db() {
  db_name="$1"
  exists="$(psql -h postgres -U "$DB_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$db_name'")"
  if [ "$exists" != "1" ]; then
    createdb -h postgres -U "$DB_USER" "$db_name"
  fi
}

create_db keycloak_db
create_db sonarqube_db
