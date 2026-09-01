# Kavuri Estates — Web Application (Next.js)

The public-facing website — SEO-facing listing pages for organic search traffic, complementing the mobile app. Talks to the same Laravel API in [`../backend-admin`](../backend-admin); all business logic lives there.

Built with Next.js (App Router, Next 16), React 19, TypeScript, Tailwind CSS 4.

## Running it

```bash
npm install
npm run dev
```

Runs on `http://localhost:3000`. Requires the backend API running (`cd ../backend-admin && php artisan serve`).

`.env.local` sets `NEXT_PUBLIC_API_URL` (defaults to `http://127.0.0.1:8000/api/v1`).

## What's built

- **Home page** (`/`) — hero search bar, category shortcuts, latest listings
- **Search/browse page** (`/properties`) — server-rendered, reads filters from the URL query string (city, property type, listing type, price range, sort), pagination
- **Property detail page** (`/properties/[slug]`) — server-rendered with `generateMetadata` for real SEO (title, description, Open Graph image) per listing, photo gallery, full spec table, amenities, owner contact card

## How it's organised

```
app/
├── page.tsx                    home page
├── properties/page.tsx         search/browse (reads searchParams)
└── properties/[slug]/page.tsx  detail page (generateMetadata for SEO)
lib/
├── api.ts       fetch wrapper for the Laravel API, with Next.js data-cache revalidation
├── types.ts     shared types matching the API's JSON shape
└── format.ts    price formatting, title-casing
components/
├── Header.tsx, Footer.tsx
└── PropertyCard.tsx
```

**Rendering notes**: property detail pages revalidate every 15s (visitors often arrive from a shared link and should see accurate status quickly); search results revalidate every 30s; the cities list is cached for an hour. All via Next's `fetch(..., { next: { revalidate } })` — no extra caching layer needed.

## Not built yet

- Login/account pages (buyer/owner dashboards) — the site is currently browse-only; deep actions (save, message, post a listing) direct to the mobile app
- Owner/agent/builder web dashboards
- Sitemap.xml / robots.txt generation for search engines
- Image optimization via `next/image` (currently plain `<img>` tags, since property photos come from an arbitrary Laravel storage host not preconfigured in `next.config.ts`)
