#!/bin/bash
set -e
mkdir -p nginx/ssl
./mkcert.exe -install
./mkcert.exe \
  -key-file nginx/ssl/nginx.key \
  -cert-file nginx/ssl/nginx.crt \
  localhost 127.0.0.1
docker compose down
docker compose up -d
