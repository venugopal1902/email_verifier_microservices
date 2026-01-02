#!/bin/sh

# Wait for Postgres to be ready (Simple check)
echo "Waiting for Accounts Database..."
while ! nc -z db-accounts 5432; do
  sleep 0.1
done
echo "Accounts Database started"

# Run Migrations
echo "Running Migrations..."
python manage.py migrate

# Start Server (Gunicorn for production-like, or runserver for dev)
# Binding to 0.0.0.0 is CRITICAL for Docker
echo "Starting Server..."
python manage.py runserver 0.0.0.0:8000

exec "$@"