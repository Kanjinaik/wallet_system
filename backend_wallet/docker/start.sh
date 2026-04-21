#!/bin/sh
set -eu

mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache

php artisan config:cache

if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
  php artisan migrate --force
fi

if [ "${RUN_ADMIN_SEEDER:-false}" = "true" ]; then
  php artisan db:seed --class=AdminSeeder --force
fi

exec php artisan serve --host=0.0.0.0 --port="${PORT:-10000}"
