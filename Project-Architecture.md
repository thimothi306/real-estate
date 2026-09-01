# Kavuri Estates — Project Architecture & Development Plan

> Companion document to [Mobile-App-Overview.md](Mobile-App-Overview.md).
> This file explains **how to actually build the project** using:
> - **Mobile App:** React Native
> - **Web App:** Next.js (React) — public-facing, SEO-friendly
> - **Backend:** Laravel (PHP)
> - **Database:** MySQL

---

## 1. High-Level Architecture

```
┌───────────────┐   ┌───────────────┐   ┌─────────────────┐
│ React Native  │   │  Next.js Web  │   │  Admin Web Panel │
│ App (iOS/     │   │  App (public, │   │ (Laravel Blade / │
│ Android)      │   │  SEO listings) │   │  React)          │
└───────┬───────┘   └───────┬───────┘   └────────┬─────────┘
        │  REST / JSON (HTTPS)                    │
        └───────────────┬──────────────────────────┘
                         ▼
             ┌───────────────────────┐
             │   Laravel Backend API   │
             │  (Controllers, Services,│
             │   Jobs, Events, Policies)│
             └───────────┬────────────┘
                         │
        ┌─────────┬──────────┼───────────┬─────────────┐
        ▼         ▼          ▼           ▼             ▼
   ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐ ┌────────────┐
   │ MySQL  │ │ Redis  │ │ Queue  │ │  Storage  │ │ 3rd-Party  │
   │(primary│ │(cache/ │ │(Laravel│ │(S3 / Azure│ │  Services  │
   │  DB)   │ │sessions│ │ Horizon│ │   Blob)   │ │(Maps, SMS, │
   │        │ │/ throttl)│ Queues)│ │ images/   │ │ Payments,  │
   │        │ │        │ │        │ │  videos)  │ │ AI, Push)  │
   └────────┘ └────────┘ └────────┘ └──────────┘ └────────────┘
```

**Pattern:** Both the React Native app and the Next.js web app talk to Laravel purely through the same versioned REST API (`/api/v1/...`). Laravel never renders app screens — it only serves JSON, handles business logic, background jobs, and talks to MySQL, Redis, storage, and external services. One API, three consumers (mobile app, public website, admin panel).

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Mobile App | **React Native** (+ TypeScript) | Single codebase for Android & iOS |
| Web App | **Next.js** (+ TypeScript) | Public-facing website — SEO listing pages, desktop browsing |
| State Management | Redux Toolkit / Zustand + React Query | App/web state + server-state caching (shared patterns across RN & Next.js) |
| Navigation | React Navigation (mobile) / Next.js App Router (web) | Screen/page routing per role |
| Backend Framework | **Laravel 11** (PHP 8.3) | REST API, business logic, auth |
| Database | **MySQL 8** | Primary relational data store |
| Cache / Sessions | Redis | Caching, rate limiting, OTP storage |
| Queues / Jobs | Laravel Queues + Horizon | AI processing, notifications, emails |
| Search | MySQL Full-Text **or** Laravel Scout + Meilisearch/Elasticsearch | Property search & ranking |
| File Storage | AWS S3 / Azure Blob (via Laravel Filesystem) | Photos, videos, documents |
| Auth | Laravel Sanctum (token-based API auth) | Mobile app authentication |
| Real-time | Laravel Reverb / Pusher + WebSockets | Chat, live notifications |
| Push Notifications | Firebase Cloud Messaging (FCM) | Mobile push |
| Maps | Google Maps SDK (RN) + Places API | Location, geocoding, nearby search |
| Payments | Razorpay / Stripe (India-friendly: Razorpay) | Subscriptions, featured listings |
| AI Services | OpenAI/GPT API + a vision model (e.g., GPT-4V or a custom CV model) | Listing auto-fill, description generation, chat assistant |
| Admin Panel | Laravel + Filament/Blade, or a small React admin app | Moderation, verification, analytics |
| CI/CD | GitHub Actions | Build, test, deploy |
| Hosting | AWS / DigitalOcean / Azure (EC2 or ECS + RDS for MySQL) | Production infrastructure |

---

## 3. Backend (Laravel) Architecture

### 3.1 Project Structure
```
kavuri-backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/V1/
│   │   │   ├── Auth/
│   │   │   ├── PropertyController.php
│   │   │   ├── SearchController.php
│   │   │   ├── LeadController.php
│   │   │   ├── VerificationController.php
│   │   │   ├── BuilderController.php
│   │   │   ├── AgentController.php
│   │   │   ├── AiAssistantController.php
│   │   │   └── AdminController.php
│   │   ├── Middleware/
│   │   ├── Requests/           # Form Request validation classes
│   │   └── Resources/          # API Resource transformers (JSON shaping)
│   ├── Models/                 # Eloquent models
│   ├── Services/               # Business logic (PricingService, AiListingService...)
│   ├── Jobs/                   # Queued jobs (GenerateAiDescription, ProcessImages...)
│   ├── Events/ & Listeners/    # e.g. PropertyPublished -> NotifyMatchingBuyers
│   ├── Policies/                # Role-based authorization
│   └── Notifications/          # Push/SMS/Email notifications
├── database/
│   ├── migrations/
│   └── seeders/
├── routes/
│   └── api.php
├── config/
└── tests/
```

### 3.2 Key Design Principles
- **Thin controllers, fat services** — controllers only validate + call a `Service` class; business logic (e.g., AI pricing, matching) lives in `app/Services`.
- **API Resources** — every response shaped through Laravel `JsonResource` classes so mobile app gets a stable, versioned contract.
- **Form Requests** — all input validation lives in dedicated `FormRequest` classes, not controllers.
- **Policies** — one per role/action (e.g., `PropertyPolicy::update` checks the user owns the listing or is admin).
- **Jobs/Queues** — anything slow (AI image analysis, description generation, sending notifications) is dispatched to a queue, not run synchronously in the request.

---

## 4. Mobile App (React Native) Architecture

### 4.1 Project Structure
```
kavuri-mobile/
├── src/
│   ├── screens/
│   │   ├── Buyer/
│   │   ├── Owner/
│   │   ├── Agent/
│   │   ├── Builder/
│   │   └── Shared/            # Login, Chat, Profile
│   ├── navigation/
│   │   ├── AuthStack.tsx
│   │   ├── BuyerTabs.tsx
│   │   ├── OwnerTabs.tsx
│   │   └── RootNavigator.tsx  # switches stack based on user role
│   ├── components/            # Reusable UI (PropertyCard, ScoreBadge, etc.)
│   ├── services/
│   │   ├── api.ts             # Axios instance + interceptors (auth token)
│   │   ├── propertyService.ts
│   │   ├── aiService.ts
│   │   └── authService.ts
│   ├── store/                 # Redux Toolkit slices or Zustand stores
│   ├── hooks/                 # useAuth, usePropertySearch, etc.
│   └── utils/
├── android/
├── ios/
└── package.json
```

### 4.2 Role-Based Navigation
On login, the app reads the user's `role` from the JWT/Sanctum token response and mounts a different navigation stack — Buyer, Owner, Agent, Builder, or Admin — reusing shared components (property card, chat, profile) across all of them.

### 4.3 Offline & Performance
- **React Query** caches API responses (property lists, details) so screens load instantly on revisit and refetch in the background.
- **Image optimization**: use `react-native-fast-image` + backend-generated thumbnails (Laravel resizes/uploads multiple sizes to S3 on upload).
- **Pagination**: cursor-based pagination on all list endpoints (`/properties?cursor=...`) to handle large result sets smoothly.

---

## 5. Web App (Next.js) Architecture

### 5.1 Why Next.js
- **SEO:** Server-side rendering (SSR) / static generation (SSG) for property pages so Google can index individual listings — critical for organic traffic, which mobile apps can't capture.
- **Shared skillset:** Same React/TypeScript knowledge as the React Native team; some UI logic and API-calling patterns can be shared via a common package.
- **Speed:** Next.js Image optimization + edge caching for fast property-photo-heavy pages.

### 5.2 Project Structure
```
kavuri-web/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                 # Homepage
│   │   ├── properties/
│   │   │   ├── page.tsx             # Search/listing results (SSR)
│   │   │   └── [slug]/page.tsx      # Property detail page (SSG/ISR, SEO-optimized)
│   │   ├── buy/, rent/, villas/...  # Landing pages per category (SEO entry points)
│   │   └── login/, register/
│   ├── (dashboard)/
│   │   ├── buyer/                   # Buyer dashboard (saved properties, leads, etc.)
│   │   ├── owner/                   # Owner listing management
│   │   ├── agent/
│   │   └── builder/
│   └── api/                          # Next.js route handlers (thin proxy/BFF only if needed)
├── components/                       # Reusable UI (PropertyCard, ScoreBadge, SearchBar)
├── lib/
│   ├── api.ts                        # Fetch wrapper for Laravel REST API
│   └── seo.ts                        # Metadata/OpenGraph helpers per page
├── public/
└── package.json
```

### 5.3 Rendering Strategy
| Page type | Rendering mode | Why |
|---|---|---|
| Property detail page | **ISR** (Incremental Static Regeneration) | Fast, cacheable, but revalidates when price/status changes |
| Search/listing results | **SSR** | Always fresh, query-dependent |
| Category landing pages (Buy, Rent, Villas...) | **SSG** | Rarely changes, maximizes SEO + speed |
| Dashboards (buyer/owner/agent/builder) | **Client-side rendered** behind auth | No SEO need; behaves like a lightweight SPA |

### 5.4 Shared Backend
The web app calls the **exact same Laravel REST API** (`/api/v1/...`) as the mobile app — no separate backend or duplicated business logic. Auth uses Laravel Sanctum with browser cookies (or token-based auth stored in an httpOnly cookie) instead of secure mobile storage.

### 5.5 What the Web App Is For
- Public browsing & SEO acquisition (property detail pages indexed by Google)
- Shareable property links (WhatsApp/social share → opens fast web page, optional "Open in App" banner)
- Desktop-based research and owner/agent/builder dashboard work (easier data entry on a full keyboard/screen)
- Not a replacement for the mobile app — the mobile app remains the primary transactional experience (chat, AI assistant, notifications, on-the-go browsing)

---

## 6. Database Design (MySQL)

### 5.1 Core Tables (starting schema)

```
users
├── id, name, email, phone, password, role (enum), status, created_at

roles: buyer | owner | tenant | landlord | builder | agent | admin

properties
├── id, owner_id (FK users), title, description, type (enum: villa/apartment/plot/...),
├── listing_type (sale/rent), price, area_sqft, bedrooms, bathrooms, floor_no,
├── facing, furnishing_status, latitude, longitude, city, state, status (draft/pending/published),
├── rera_number (nullable), created_at

property_media
├── id, property_id (FK), type (image/video/floorplan/360tour), url, sort_order

property_amenities
├── id, property_id (FK), amenity_id (FK)

amenities
├── id, name (Swimming Pool, Parking, Garden, ...)

property_verifications
├── id, property_id (FK), badge_type (document/owner/video/gps/govt_record), verified_by, verified_at

property_scores
├── id, property_id (FK), investment_score, rental_score, growth_score, risk_percent, demand, liquidity

leads
├── id, property_id (FK), buyer_id (FK), agent_id (nullable FK), type (call/message/visit/callback), status

visits
├── id, property_id (FK), buyer_id (FK), scheduled_at, status

favorites
├── id, user_id (FK), property_id (FK)

reviews (community layer)
├── id, area/city, user_id (FK), category (water/traffic/safety/schools...), rating, comment

subscriptions
├── id, user_id (FK), plan_type, starts_at, ends_at, payment_status

payments
├── id, user_id (FK), amount, purpose (featured_listing/subscription/valuation_report), status, gateway_ref

chats / messages
├── conversations(id, property_id, buyer_id, owner_id)
├── messages(id, conversation_id, sender_id, body, sent_at)

notifications
├── standard Laravel notifications table

builder_projects
├── id, builder_id (FK), project_name, total_units, units_sold, status

agent_clients
├── id, agent_id (FK), client_id (FK), status
```

### 5.2 Notes
- Use **Eloquent relationships** (`hasMany`, `belongsTo`, `morphMany` for media) to keep queries clean.
- Use **soft deletes** on `properties` and `users` (never hard-delete listing history — needed for the "Property Timeline" feature).
- Index `city`, `price`, `type`, `listing_type`, and `latitude/longitude` (or use a spatial index) for fast search filtering.
- For full-text/AI-ranked search at scale, sync MySQL data into Elasticsearch/Meilisearch via **Laravel Scout** rather than relying on MySQL alone once listings grow large.

---

## 7. API Design (REST, versioned)

Example endpoint groups under `/api/v1/`:

```
POST   /auth/register
POST   /auth/login
POST   /auth/otp/verify
GET    /auth/me

GET    /properties                 # search/filter/list
POST   /properties                 # create (owner/builder/agent)
GET    /properties/{id}
PUT    /properties/{id}
DELETE /properties/{id}
POST   /properties/{id}/media
POST   /properties/{id}/publish

POST   /ai/listing/auto-detect     # upload photos -> AI attributes
POST   /ai/listing/description     # generate description
POST   /ai/search                  # natural-language search query
POST   /ai/assistant/ask           # "Is this overpriced?" etc.

POST   /leads
GET    /leads/mine
POST   /visits
GET    /favorites
POST   /favorites/{propertyId}

GET    /reviews/area/{cityOrArea}
POST   /reviews

GET    /builder/projects
GET    /agent/clients
GET    /agent/dashboard

POST   /payments/checkout
POST   /payments/webhook           # gateway callback

GET    /admin/properties/pending
POST   /admin/properties/{id}/approve
```

Each response is wrapped consistently, e.g.:
```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "per_page": 20, "total": 134 }
}
```

---

## 8. AI Feature Implementation Approach

| Feature | How to build it |
|---|---|
| AI Listing Auto-Detect | Owner uploads photos → Laravel job sends images to a vision model (OpenAI GPT-4V / custom CV model) → returns structured JSON (bedrooms, facing, amenities) → stored as a "suggested" draft for owner to confirm |
| AI Description Generation | Laravel job sends structured property data to GPT API with a prompt template → returns marketing copy → shown to owner for edit/approve |
| AI Pricing/Investment Score | A `PricingService` combines: comparable listings in the area (MySQL query), recent price trends, and an ML/GPT-assisted estimate → cached in `property_scores` table, recalculated periodically via scheduled job |
| Conversational Search | React Native sends free-text query to `/ai/search` → Laravel forwards to GPT with function-calling to extract structured filters (city, budget, bedrooms, amenities) → runs the actual query against MySQL/Elasticsearch → GPT explains matches back to the user |
| AI Chat Assistant | Standard chat endpoint backed by GPT with property context injected into the prompt (RAG-style: pull property + nearby amenity data before calling the model) |

**Important:** All AI calls should be **queued and cached** where possible (e.g., don't regenerate a description every time — generate once, store, regenerate on demand) to control API cost and latency.

---

## 9. Authentication & Role-Based Access

- **Laravel Sanctum** issues API tokens on login; React Native stores the token securely (`react-native-keychain` / `EncryptedStorage`).
- **OTP-based phone verification** on registration (via an SMS gateway like MSG91/Twilio) before a user can publish a listing.
- **Role field** on the `users` table drives:
  - Which navigation stack loads in the app.
  - Laravel **Policies** for what each role can do (`PropertyPolicy`, `LeadPolicy`, etc.).
  - Middleware guards on admin-only routes (`role:admin`).

---

## 10. Search Strategy

- **Phase 1 (MVP):** MySQL with proper indexes + full-text search (`FULLTEXT` index on title/description) — sufficient for early scale.
- **Phase 2+:** Migrate to **Laravel Scout + Meilisearch or Elasticsearch** once listing volume grows, enabling:
  - Typo-tolerant, ranked search
  - Geo-distance queries ("within 20 minutes of my office")
  - Faceted filtering (lifestyle tags, amenities)

---

## 11. Notifications & Real-Time

- **Push notifications:** Firebase Cloud Messaging — triggered by Laravel events (new lead, price drop, saved-search match).
- **In-app chat:** Laravel Reverb (or Pusher) broadcasting `MessageSent` events over WebSockets; React Native subscribes via `laravel-echo` + `pusher-js`/`@laravel/echo`.
- **Scheduled jobs (Laravel Task Scheduler):** recalculate investment scores nightly, send visit reminders, expire stale leads.

---

## 12. File & Media Handling

1. Mobile app requests a **pre-signed upload URL** from Laravel.
2. App uploads image/video **directly to S3/Blob storage** (avoids proxying large files through the API server).
3. Laravel job processes the upload: generates thumbnails, runs AI detection, updates `property_media`.

---

## 13. Security Considerations

- HTTPS everywhere; API rate limiting via Laravel's built-in throttle middleware + Redis.
- Sanctum token expiry + refresh flow.
- Input validation via Form Requests on every endpoint.
- File upload validation (type/size) before accepting to storage.
- Duplicate/fraud detection: hash-compare uploaded images, flag suspicious repeat listings for moderation.
- Admin moderation gate: every new listing starts as `pending` and requires approval before `published`.
- Sensitive data (Aadhaar, PAN, property docs) encrypted at rest; access logged.

---

## 14. Development Roadmap (Mapped to Tech Stack)

### Phase 1 — Marketplace MVP (6–9 months)
- [ ] Laravel: Auth (Sanctum + OTP), Property CRUD, Media upload, basic search, Leads, Favorites, Visit scheduling
- [ ] React Native: Auth screens, Home, Property listing/detail, Search, Owner "create listing" flow, Chat (basic)
- [ ] Next.js: Homepage, property search/results, property detail pages (SEO-optimized), login/register
- [ ] MySQL schema for users/properties/media/leads/favorites
- [ ] Admin moderation panel (Laravel Filament or Blade)
- [ ] Google Maps integration
- [ ] Basic AI: description generation + photo auto-detect (v1)

### Phase 2 — Transactions (6 months)
- [ ] Payments (Razorpay) for featured listings/subscriptions
- [ ] Home loan & legal service partner integrations (forms + lead handoff)
- [ ] Digital rental agreements (PDF generation + e-sign integration)
- [ ] Builder & Agent portals/dashboards (available on both mobile and web)
- [ ] Property management module
- [ ] Next.js: Owner/Agent/Builder web dashboards, category landing pages (Villas, Farmhouses, Resorts, etc.) for SEO

### Phase 3 — Real Estate Operating System (12+ months)
- [ ] Migrate search to Elasticsearch/Meilisearch
- [ ] Conversational AI search with GPT function-calling (mobile + web)
- [ ] AI investment advisor + neighbourhood intelligence (community reviews aggregation)
- [ ] AR property viewing (React Native AR modules)
- [ ] Predictive price analytics (scheduled ML jobs)
- [ ] Developer/data-insights API for external partners
- [ ] Next.js: full SEO scale-out (city/area programmatic pages), performance/Core Web Vitals optimization

---

## 15. Suggested Team & Workflow

| Role | Responsibility |
|---|---|
| Backend Dev (Laravel) | API, database, jobs, integrations |
| Mobile Dev (React Native) | App screens, navigation, state management |
| Web Dev (Next.js) | Public website, SEO pages, web dashboards — can be the same dev(s) as mobile given shared React/TypeScript skills |
| DevOps | CI/CD, server provisioning, monitoring |
| QA | Manual + automated testing per phase |
| Product/Design | Wireframes, UX flow, prioritization |

**Suggested workflow:**
1. Design database schema & API contract first (OpenAPI/Postman collection) so mobile, web, and backend teams can work in parallel.
2. Backend builds endpoints behind feature flags; mobile and web build against a mocked/staging API.
3. Use GitHub Actions for automated testing (PHPUnit for Laravel, Jest for React Native and Next.js) and deployment to staging on every merge.
4. Weekly phase-based releases aligned with the roadmap above.

---

## 16. Deployment Overview

```
GitHub Repo
   │
   ▼ (push/PR merge)
GitHub Actions (CI)
   │
   ├── Run PHPUnit tests   → Laravel
   ├── Run Jest tests      → React Native
   ├── Run Jest/RTL tests  → Next.js
   │
   ▼ (on main branch)
Deploy Backend → AWS EC2/ECS + RDS (MySQL) + Redis (ElastiCache)
Deploy Web     → Vercel / AWS Amplify / Nginx+Node server → kavuriestates.com
Build Mobile   → EAS Build / Fastlane → App Store + Play Store
```

- **Backend hosting:** AWS/DigitalOcean, Laravel behind Nginx + PHP-FPM, MySQL on RDS (managed, automated backups), Redis via ElastiCache.
- **Web hosting:** Deploy Next.js to **Vercel** (simplest, built for Next.js, handles ISR/edge caching automatically) or self-host on AWS/DigitalOcean behind Nginx if you need everything in one cloud account.
- **Mobile release:** Use **Expo EAS Build** (if using Expo) or **Fastlane** for native RN builds, distributed via TestFlight (iOS) and Play Console internal testing (Android) before public release.

---

## Summary

This architecture pairs a **React Native** mobile app and a **Next.js** public web app — both consuming the same **Laravel + MySQL** backend API — following standard REST API conventions with Sanctum auth, queued AI processing, S3-based media storage, and a phased rollout matching the product roadmap in [Mobile-App-Overview.md](Mobile-App-Overview.md). The mobile app is the primary transactional experience; the web app exists mainly to capture SEO/organic traffic and support desktop browsing and dashboard work. Start with a lean MVP (Phase 1) focused on listings, search, and trust/verification, then layer in transactions and AI-driven differentiation in later phases.
