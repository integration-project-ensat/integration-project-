#!/bin/bash
psql -U "$POSTGRES_USER" -c "CREATE DATABASE sonarqube;"
