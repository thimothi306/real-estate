# Kavuri Estates — Backend API (Laravel 9 + MySQL)

The API backend for the Kavuri Estates mobile app, web app, and admin panel. See [../Project-Architecture.md](../Project-Architecture.md) for the full system design.

## Stack
- Laravel 9 (PHP 8.0+)
- MySQL 8 / MariaDB 10.4+
- Laravel Sanctum (token auth)
- Database-backed cache/queue/session (no Redis dependency required to run locally)

## Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
```

Create the database (adjust credentials to match your `.env`):
```sql
CREATE DATABASE kavuri_estates CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Run migrations and seed reference data (amenities + one admin account):
```bash
php artisan migrate
php artisan storage:link
php artisan db:seed
```

The seeded admin login comes from `.env` (`ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`, defaults are in `.env.example`) — **change these before deploying anywhere real.**

Start the server:
```bash
php artisan serve
```

Two things are now running:
- **API** at `http://127.0.0.1:8000/api/v1/...` — for the mobile app and public web app
- **Admin panel** at `http://127.0.0.1:8000/admin` — sign in with the seeded admin account

## Admin panel

A server-rendered Blade UI (no build step, no separate project) at `/admin`. It talks to the models
directly rather than round-tripping through the API — same authorization rules, fewer moving parts.

- **Dashboard** — listing counts by status, user counts by role, leads in the last 7 days, and a queue of listings awaiting review
- **Listings** — filter by status/city/title, open any listing to see full details, photos, and reports against it
- **Moderation** — approve & publish (also fires saved-search notifications), reject with a reason, archive a live listing
- **Verification badges** — apply or remove any of the five badge types
- **Reports** — review user-submitted reports, action or dismiss them, optionally archive the listing
- **Duplicates** — review auto-raised duplicate-photo flags; confirming archives the newer listing
- **Users** — filter by role/status, search by name/email/phone, suspend (revokes all their tokens) or reactivate

Access is restricted by the `admin.web` middleware: session guard + `role === admin` + `status === active`.
The login form returns the same generic error for unknown accounts, wrong passwords, and non-admin
accounts so it can't be used to enumerate users, and it shares the API's `throttle:login` rate limiter.

## What's implemented

**Auth & security** (`app/Http/Controllers/Api/V1/Auth`, `app/Services/AuthService.php`, `app/Services/OtpService.php`)
- Registration with phone OTP verification
- Login with brute-force lockout (configurable attempts/duration via `LOGIN_MAX_ATTEMPTS` / `LOGIN_LOCKOUT_MINUTES`)
- Per-endpoint rate limiting on `login`, `otp/*`, and `register` (separate, tighter limiters than the general API limiter — see `RouteServiceProvider::configureRateLimiting()`)
- Password reset via OTP; changing a password revokes all existing tokens
- Sanctum token auth with configurable expiry (`SANCTUM_TOKEN_EXPIRATION`)
- Full login/OTP audit trail (`login_activities` table)
- Role-based access via a `role` middleware + `PropertyPolicy` (Laravel policy)
- Consistent JSON error envelope for all exceptions, including validation, auth, and rate-limit errors (`app/Exceptions/Handler.php`) — no stack traces leak in production (`APP_DEBUG=false`)

**Property module**
- Full CRUD, draft → pending review → published moderation workflow
- Search with indexed filters, MySQL full-text search, and radius (lat/lng) search — see `app/Services/PropertySearchService.php` for the performance notes on each
- Media upload (local disk by default; swap to S3 by changing `FILESYSTEM_DISK`/`config/filesystems.php`)
- Amenities (cached list, rarely changes)
- Favorites, leads, visit scheduling
- Community reviews (city/locality ratings)

**Admin**
- Pending listing queue, approve/reject with reason, verification badges
- User search, suspend (revokes all sessions), reactivate
- Report review queue (resolve, optionally archive the listing)
- Duplicate-image flag review (confirm archives the listing, or dismiss)

**Trust & safety (MVP additions)**
- Report/flag a listing (`POST /properties/{property}/report`) — one open report per user per property; admin resolves via `/admin/reports`
- Duplicate-image detection — every uploaded photo is content-hashed (SHA-256); a hash match against another property's media auto-creates a flag for admin review (`app/Services/DuplicateDetectionService.php`). Catches exact re-uploads (e.g. a scraped or re-posted listing); does not catch a cropped/recompressed copy — that needs perceptual hashing or a vision model, out of scope for MVP.

**Profile & account**
- Update profile (`PUT /profile`), avatar upload, change password (revokes all other sessions, keeps the current one)

**Discovery**
- Saved searches (`/saved-searches`) — when an admin publishes a property, matching saved searches get a database notification automatically (`app/Services/SavedSearchMatchService.php`, runs synchronously — see note in that file about moving to a queued job at scale)
- In-app notifications (`/notifications`, `/notifications/{id}/read`, `/notifications/read-all`)
- Device token registration (`/devices`) — stores FCM tokens per user; actual push *sending* isn't wired up yet, this just gets the registration plumbing in place
- City/locality autocomplete (`/locations/cities`, `/locations/localities`) — city list is cached and busted on every property approval
- Compare properties (`GET /properties/compare?ids=1,2,3`, public, max 4)
- Recently viewed (`GET /my/recently-viewed`) — upserted on each detail view so revisits reorder rather than duplicate
- Similar properties (`GET /properties/{property}/similar`) — same city + type within ±25% price; a heuristic, not a recommendation engine
- Health check (`GET /health`) — checks DB connectivity, for uptime monitoring

**Property timeline & lifestyle**
- Property history (`GET /properties/{property}/timeline`) — price changes, status changes, and creation are logged automatically by `app/Observers/PropertyObserver.php`, so the audit trail can't be bypassed by forgetting to log at a call site
- Lifestyle tags (`GET /lifestyle-tags`, filter via `?lifestyle_tag=pet-friendly`) — Family Friendly, Pet Friendly, Bachelor Friendly, Luxury Living, Weekend Home, Retirement Home, Startup Office, Hotel Investment
- `pg` added as a distinct property type alongside `hostel`

**Bookings (date-range)**
- For bookable types (farmhouse, resort, wedding venue, PG, hostel) — distinct from the one-off "schedule a visit" flow
- `GET /properties/{property}/availability` (public), `POST /properties/{property}/bookings`, `GET /my/bookings`, `PATCH /bookings/{booking}/status`, `POST /properties/{property}/bookings/block` (owner blocks dates)
- Overlapping requests are rejected server-side via `AvailabilityBlock::scopeOverlapping`

## Tests

```bash
php artisan test
```

21 feature tests covering the auth flow (registration, OTP, login, brute-force lockout, suspension, token revocation) and the property lifecycle (role permissions, draft→published moderation, price-change history, search filters, ownership checks, favorites).

Tests run against a separate `kavuri_estates_test` MySQL database (configured in `phpunit.xml`), not sqlite — several migrations use MySQL-specific raw SQL (`ALTER ... MODIFY COLUMN ENUM(...)`, `FULLTEXT` indexes) that sqlite can't execute. Create it once with:

```sql
CREATE DATABASE kavuri_estates_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Serving the mobile app

`php artisan serve` binds to localhost, which a phone cannot reach. For device testing:

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

Then point [`../mobileapp/src/api/config.ts`](../mobileapp/src/api/config.ts) at this machine's LAN IP.

## Performance choices worth knowing about

- List/search endpoints use a lightweight `PropertyListResource` (no description, no full amenity list) — the detail page uses a separate, heavier `PropertyDetailResource`. Don't merge these; the split is what keeps search fast.
- `PropertySearchService` selects specific columns instead of `SELECT *`, and only eager-loads the first image + score to avoid N+1 queries without over-fetching media.
- Full-text search uses the MySQL `FULLTEXT` index (`whereFullText`) rather than `LIKE '%term%'`, which cannot use an index.
- Radius search pre-filters with an indexed lat/lng bounding box before running the more expensive Haversine calculation.
- `RegisterRequest` intentionally avoids `email:dns` and `Password::uncompromised()` — both make a live external network call per request, which adds latency and an external failure mode to a hot path.
- Amenities are cached for 6 hours (`Cache::remember`) since they change rarely.

## Deliberately out of scope for this MVP
- **AI features** (listing auto-detect, description generation, conversational search, investment scoring) — excluded by design for now. `property_scores` table / `PropertyScore` model exist so this can slot in later without a schema change.
- **Chat** — `conversations`/`messages` tables exist but no controllers; excluded by design for now.
- **Payments, builder/agent dashboards, rental agreements, property management module** — Phase 2 per the roadmap.
- Real SMS gateway — `OtpService::dispatch()` currently logs the OTP to `storage/logs/laravel.log` instead of sending a real SMS. Swap that method for MSG91/Twilio before going to production.
- Redis — not required to run locally (cache/queue/session use the `database` driver), but recommended for production throughput; swap the drivers in `.env` when available.
- Actual push notification delivery — device tokens are collected (`/devices`) but nothing sends to FCM yet.
- Nearby amenities (schools/hospitals distance) — needs a places/geocoding provider, not wired up.

## Testing the API quickly

```bash
# Register
curl -X POST http://127.0.0.1:8000/api/v1/auth/register -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"you@example.com","phone":"+919876543210","password":"Passw0rd!123","password_confirmation":"Passw0rd!123","role":"buyer"}'

# OTP is logged to storage/logs/laravel.log — grab it, then verify:
curl -X POST http://127.0.0.1:8000/api/v1/auth/otp/verify-registration -H "Content-Type: application/json" \
  -d '{"phone":"+919876543210","code":"123456","purpose":"registration"}'

# Login
curl -X POST http://127.0.0.1:8000/api/v1/auth/login -H "Content-Type: application/json" \
  -d '{"identifier":"you@example.com","password":"Passw0rd!123"}'
```
