# Render Docker + FreeDB

## Render

- Runtime: `Docker`
- Branch: `main`
- Dockerfile: `Dockerfile`
- Health check path: `/up`

Set these environment variables in Render:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://your-render-backend.onrender.com`
- `FRONTEND_URL=https://your-vercel-project.vercel.app`
- `APP_KEY=` your generated Laravel key
- `DB_CONNECTION=mysql`
- `DB_HOST=` your FreeDB host
- `DB_PORT=3306`
- `DB_DATABASE=` your FreeDB database name
- `DB_USERNAME=` your FreeDB username
- `DB_PASSWORD=` your FreeDB password
- `MYSQL_ATTR_SSL_CA=` leave blank unless your FreeDB account specifically requires a CA certificate path

Optional if used by your app:

- `MAIL_*`
- `PUSHER_*`
- `ERTITECH_*`
- `RETAILER_RECHARGE_*`
- `RAZORPAY_*`

Recommended for FreeDB to avoid exhausting hourly MySQL connection limits:

- `SESSION_DRIVER=file`
- `CACHE_STORE=file`
- `QUEUE_CONNECTION=sync`
- `RUN_MIGRATIONS=false`
- `RUN_ADMIN_SEEDER=false`

Important:

- Do not run migrations automatically on every Render deploy when using FreeDB.
- Run `php artisan migrate --force` only when you actually added a new migration.
- Run the admin seeder only once when you truly need it, not on every container boot.

Generate an app key locally:

```bash
php artisan key:generate --show
```

## FreeDB

Use the FreeDB MySQL connection details in the Render environment variables above.

## Render Service Settings

- Service type: `Web Service`
- Environment: `Docker`
- Root directory: leave blank
- Dockerfile path: `./Dockerfile`
- Build command: leave blank
- Start command: leave blank
