#!/bin/bash

echo "🚀 Pokreće se start.sh..."

# Kreiraj folder za SQLite bazu (ako koristiš persistent disk)
mkdir -p /persistent/data

# Pokreni migracije
echo "🛠 Pokrećem migracije..."
python manage.py migrate --noinput

# Pokreni gunicorn server
echo "🌐 Pokrećem gunicorn..."
gunicorn config.wsgi:application --workers 2 --preload --bind 0.0.0.0:8000
