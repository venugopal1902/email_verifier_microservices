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

# Create Superuser
echo "Checking Superuser 'admin'..."
python << END
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

username = 'admin'
email = 'admin@example.com'
password = 'password'

try:
    if not User.objects.filter(username=username).exists():
        print(f"Creating superuser: {username}")
        User.objects.create_superuser(username, email, password)
        print("!!! SUPERUSER CREATED SUCCESSFULLY !!!")
        print(f"Login with: {username} / {password}")
    else:
        print(f"Superuser {username} already exists.")
except Exception as e:
    print(f"ERROR creating superuser: {e}")
END

# Start Server
echo "Starting Server..."
python manage.py runserver 0.0.0.0:8000

exec "$@"