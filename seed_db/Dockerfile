FROM postgres:16

# Copy SQL files into container
COPY tables.sql /docker-entrypoint-initdb.d/01_tables.sql
COPY seed-db.sql /docker-entrypoint-initdb.d/02_seed.sql
COPY init-school-db.sh /docker-entrypoint-initdb.d/00_init.sh

RUN chmod +x /docker-entrypoint-initdb.d/00_init.sh
