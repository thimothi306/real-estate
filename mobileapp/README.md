# Kavuri Estates — Mobile App (React Native / Expo)

The buyer- and owner-facing mobile app. It talks to the Laravel API in
[`../backend-admin`](../backend-admin) — all business logic, validation, and
authorization live there; this app is the UI layer.

Built with Expo (React Native 0.86, React 19, TypeScript).

## Running it

**1. Start the API so the phone can reach it.**

`php artisan serve` binds to localhost only, which a phone cannot reach. Bind to all interfaces:

```bash
cd ../backend-admin
php artisan serve --host=0.0.0.0 --port=8000
```

**2. Point the app at your machine.**

Open [`src/api/config.ts`](src/api/config.ts) and set `LAN_HOST` to your computer's LAN IP
(currently `192.168.1.13`). Find it with `ipconfig` on Windows — use the Wi-Fi adapter's IPv4
address. The phone and the computer must be on the same Wi-Fi network.

If you're using an Android emulator rather than a physical device, set
`USING_ANDROID_EMULATOR = true` instead — the emulator reaches the host at the special
address `10.0.2.2`.

**3. Start the app.**

```bash
npm start
```

Scan the QR code with the Expo Go app on your phone, or press `a` for an Android emulator.

## What's built

**Authentication** — register (with role selection), phone OTP verification, sign in,
forgot/reset password, sign out. The session token is kept in `expo-secure-store` and
restored on cold start, so you stay signed in between launches.

**Browsing** — home screen with category tiles and latest listings, search with text query,
filters (city, listing type, property type, price range, bedrooms), sorting, and infinite scroll.

**Property detail** — photo gallery, price, full spec table, features, amenities, lifestyle tags,
verification badges, property timeline (price/status history), similar properties, save to
favorites, request a callback, call the owner, share, open in Maps, and report a listing.
Bookable types (farmhouse, resort, wedding venue, PG, hostel) show a date-range booking
request; everything else shows visit scheduling.

**Favorites** — saved properties, refreshed whenever the tab regains focus.

**Notifications** — inbox reachable from the bell in the Home header, with unread state and
mark-all-read.

**Saved searches** — save the current filter set from the Search screen; the server notifies
you when a matching property is published. Manage/remove them from Profile → Tools.

**EMI calculator** — reachable from Profile → Tools, or prefilled from a for-sale listing.

**My bookings** — date-range booking requests with their confirmation status.

**Owner tools** (shown only for roles the server lets create listings — owner, landlord,
builder, agent) — my listings with moderation status, post a new property with multi-photo
upload and lifestyle tags, save as draft or submit for review.

**Profile** — view account details, edit name/city, sign out.

## How it's organised

```
src/
├── api/          config (API host), fetch client, typed endpoint modules
├── auth/         AuthContext — token storage, session restore, sign in/out
├── components/   shared UI primitives + PropertyCard
├── navigation/   RootNavigator — swaps auth/app stacks based on session
├── screens/      one file per screen, owner screens under owner/
└── theme.ts      colors, spacing, price formatting
```

Two details worth knowing:

- **`src/api/client.ts`** unwraps the backend's `{ success, message, data, meta }` envelope and
  throws a typed `ApiError` carrying the HTTP status and per-field validation errors, which the
  forms render inline. A network-level failure is reported as "cannot reach the server" with the
  configured URL, since on a phone that almost always means a wrong host rather than a real outage.
- **A 401 from any request signs the user out automatically**, so a revoked or expired token
  can't leave the app stuck in a half-signed-in state.

## Not built yet

- Push notification *delivery* (device-token registration endpoint exists; nothing sends yet)
- Embedded map view — the detail page deep-links into the device's Maps app instead, which
  avoids needing a Google Maps API key
- Editing an existing listing (create-only for now) and adding photos to an already-posted listing
- Owner-side booking management (confirm/cancel incoming requests) — API exists
- Chat, AI features, payments — deliberately out of scope for the MVP
- Maps (the API returns lat/lng, but no map view is wired up)
- Chat, AI features, payments — deliberately out of scope for the MVP
