#!/bin/sh

# Wait for Postgres to be ready
echo "Waiting for Accounts Database..."
while ! nc -z db-accounts 5432; do
  sleep 0.1
done
echo "Accounts Database started"

# FIX: Create migrations for the custom user model first
echo "Creating migrations for 'accounts' app..."
python manage.py makemigrations accounts

# Run Migrations
echo "Running Migrations..."
python manage.py migrate

# Start Server
echo "Starting Server..."
python manage.py runserver 0.0.0.0:8000

exec "$@"