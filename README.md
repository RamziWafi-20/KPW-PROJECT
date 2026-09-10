# STORA — Laravel 13 + MySQL Persistent Database

STORA keeps the existing UI/UX and stores application data in MySQL through a Laravel backend. Database schema is created with migrations and initial demo data is loaded with seeders. The existing client-side UI synchronizes its state to Laravel automatically and polls for server-side changes every 5 seconds.

## Requirements
- PHP 8.3+
- Composer 2+
- MySQL/MariaDB

## Install
```powershell
composer install
copy .env.example .env
php artisan key:generate
```

Create a MySQL database named `stora`, then set DB values in `.env`.

```powershell
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

Open http://127.0.0.1:8000

## Database
The `stora_state` table is the persistent source for the current STORA application dataset. It contains JSON snapshots of users, categories, items, store requests, stock movements, notifications and audit logs. The schema itself is versioned by Laravel migrations and the initial dataset is reproducible through `StoraStateSeeder`.

## Automatic synchronization
The current STORA UI continues to work with the same service API. Every successful client-side mutation is queued to Laravel with `PUT /api/stora/state`; the browser also polls `GET /api/stora/state` every 5 seconds so changes made from another session are reflected automatically. If the network is unavailable, the UI temporarily falls back to localStorage and retries on the next mutation/poll.
