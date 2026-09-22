'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { ASSET_BASE_URL } from '@/lib/config';
import type { PropertySummary } from '@/lib/types';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/v1';

type Insight = {
  sunlight_rating: string | null;
  noise_level: string | null;
  commute_minutes: number | null;
  commute_landmark: string | null;
  investment_score: number | null;
  rental_yield_percent: number | null;
  future_infrastructure: string | null;
};

function formatPrice(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2).replace(/\.?0+$/, '')} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2).replace(/\.?0+$/, '')} L`;
  return `₹${value.toLocaleString('en-IN')}`;
}

const HIGHLIGHTS = [
  { icon: '🛡', label: 'Verified Properties', tint: 'bg-success-bg' },
  { icon: '👥', label: 'Happy Customers', tint: 'bg-info-bg' },
  { icon: '📈', label: 'Investment Deals', tint: 'bg-primary-soft' },
  { icon: '⭐', label: 'User Rating', tint: 'bg-warning-bg' },
  { icon: '🎧', label: 'Support', tint: 'bg-danger-bg' },
];

export default function DashboardPage() {
  const { user, token, initialising } = useAuth();
  const router = useRouter();

  const [recommended, setRecommended] = useState<PropertySummary[]>([]);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [savedCount, setSavedCount] = useState(0);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!initialising && !user) router.replace('/login');
  }, [initialising, user, router]);

  useEffect(() => {
    if (!token) return;

    const authHeaders = { Accept: 'application/json', Authorization: `Bearer ${token}` };

    // Each panel loads independently — one slow or failing endpoint should
    // never blank out the whole dashboard.
    fetch(`${API}/properties?per_page=4&sort=newest`, { headers: { Accept: 'application/json' } })
      .then((r) => r.json())
      .then((p) => {
        const items: PropertySummary[] = p.data ?? [];
        setRecommended(items);
        if (items[0]) {
          fetch(`${API}/properties/${items[0].id}/insights`, { headers: { Accept: 'application/json' } })
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => d?.data && setInsight(d.data))
            .catch(() => undefined);
        }
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));

    fetch(`${API}/favorites`, { headers: authHeaders })
      .then((r) => r.json())
      .then((p) => setSavedCount(p.meta?.total ?? 0))
      .catch(() => undefined);

    fetch(`${API}/conversations/unread-count`, { headers: authHeaders })
      .then((r) => r.json())
      .then((p) => setUnread(p.data?.unread_count ?? 0))
      .catch(() => undefined);
  }, [token]);

  if (initialising || !user) {
    return <div className="px-4 py-24 text-center text-muted">Loading your dashboard…</div>;
  }

  const insightTiles = insight
    ? [
        { icon: '☀️', label: 'Sunlight Analysis', value: insight.sunlight_rating ?? '—', tone: 'text-success' },
        { icon: '🔊', label: 'Noise Analysis', value: insight.noise_level ?? '—', tone: 'text-info' },
        {
          icon: '📍',
          label: 'Travel Time',
          value: insight.commute_minutes ? `${insight.commute_minutes} min` : '—',
          tone: 'text-muted',
          sub: insight.commute_landmark ? `to ${insight.commute_landmark}` : undefined,
        },
        {
          icon: '📊',
          label: 'Investment Score',
          value: insight.investment_score != null ? `${insight.investment_score}/10` : '—',
          tone: 'text-success',
        },
        {
          icon: '💰',
          label: 'Rental Yield',
          value: insight.rental_yield_percent != null ? `${insight.rental_yield_percent}%` : '—',
          tone: 'text-gold',
        },
        { icon: '🏗', label: 'Future Infra', value: insight.future_infrastructure ?? '—', tone: 'text-muted' },
      ]
    : [];

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar counts={{ 'Saved Properties': savedCount, Messages: unread }} />

      <div className="min-w-0 flex-1 bg-background">
        <div className="mx-auto max-w-6xl px-4 py-8">
          {/* Welcome banner */}
          <section className="relative overflow-hidden rounded-2xl bg-navy">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${ASSET_BASE_URL}/storage/property-images/estate-04.jpg`}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/95 to-navy/50" />

            <div className="relative p-8 sm:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
                Find. Verify. Buy. Your Way.
              </p>
              <h1 className="mt-3 max-w-lg text-2xl font-extrabold leading-tight text-white sm:text-4xl">
                Welcome back, {user.name.split(' ')[0]}.
              </h1>
              <p className="mt-2 max-w-md text-sm text-white/65">
                Everything real estate, in one trusted ecosystem.
              </p>

              <form action="/properties" method="get" className="mt-6 flex max-w-xl gap-2">
                <input
                  name="q"
                  placeholder="Search by location, project, lifestyle or keyword"
                  className="flex-1 rounded-xl border-0 bg-surface px-4 py-3 text-sm text-foreground placeholder:text-faint focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-gold px-6 py-3 text-sm font-bold text-white transition hover:bg-gold-deep"
                >
                  Search
                </button>
              </form>
            </div>
          </section>

          {/* Highlight strip */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {HIGHLIGHTS.map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3.5">
                <span className={`flex h-10 w-10 items-center justify-center rounded-full text-base ${item.tint}`}>
                  {item.icon}
                </span>
                <span className="text-xs font-semibold leading-tight text-foreground">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="min-w-0 space-y-6">
              {/* Recommended */}
              <section className="rounded-2xl border border-border bg-surface p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-bold text-foreground">Recommended Properties</h2>
                  <Link href="/properties" className="text-sm font-semibold text-primary hover:underline">
                    View All
                  </Link>
                </div>

                {loading ? (
                  <p className="py-8 text-center text-sm text-muted">Loading listings…</p>
                ) : recommended.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted">No listings available right now.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {recommended.map((property) => (
                      <Link
                        key={property.id}
                        href={`/properties/${property.slug}`}
                        className="group overflow-hidden rounded-xl border border-border transition hover:-translate-y-1 hover:shadow-lg"
                      >
                        <div className="relative h-36 overflow-hidden bg-surface-alt">
                          {property.cover_image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={property.cover_image}
                              alt=""
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          )}
                          <span className="absolute left-2.5 top-2.5 rounded-md bg-success px-2 py-0.5 text-[10px] font-bold text-white">
                            {property.is_featured ? 'Featured' : 'Verified'}
                          </span>
                        </div>
                        <div className="p-3.5">
                          <h3 className="truncate text-sm font-bold text-foreground">{property.title}</h3>
                          <p className="mt-0.5 truncate text-xs text-muted">
                            {[property.locality, property.city].filter(Boolean).join(', ')}
                          </p>
                          <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-base font-extrabold text-foreground">
                              {formatPrice(property.price)}
                            </span>
                            {!!property.area_sqft && (
                              <span className="text-[11px] text-muted">{Math.round(property.area_sqft)} sq.ft</span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              {/* Property insights */}
              {insightTiles.length > 0 && (
                <section className="rounded-2xl border border-border bg-surface p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-bold text-foreground">Property Insights</h2>
                    {recommended[0] && (
                      <Link
                        href={`/properties/${recommended[0].slug}`}
                        className="text-sm font-semibold text-primary hover:underline"
                      >
                        View Full Report
                      </Link>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {insightTiles.map((tile) => (
                      <div key={tile.label} className="rounded-xl border border-border p-3.5">
                        <span className="text-lg">{tile.icon}</span>
                        <div className="mt-1.5 text-[11px] font-semibold text-muted">{tile.label}</div>
                        <div className={`mt-0.5 text-sm font-bold capitalize ${tile.tone}`}>{tile.value}</div>
                        {'sub' in tile && tile.sub && (
                          <div className="text-[10px] text-faint">{tile.sub}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right rail */}
            <aside className="space-y-6">
              <section className="rounded-2xl border border-border bg-surface p-5">
                <h2 className="text-base font-bold text-foreground">My Activities</h2>
                <div className="mt-4 space-y-1">
                  {[
                    { icon: '♡', label: 'Saved Properties', sub: `${savedCount} saved`, href: '/dashboard/saved', tint: 'bg-danger-bg' },
                    { icon: '💬', label: 'Messages', sub: unread > 0 ? `${unread} unread` : 'All caught up', href: '/dashboard/chats', tint: 'bg-info-bg' },
                    { icon: '🏦', label: 'Home Loan', sub: 'Check your eligibility', href: '/home-loan', tint: 'bg-success-bg' },
                    { icon: '🛠', label: 'Services', sub: 'Legal, interiors, movers', href: '/services', tint: 'bg-warning-bg' },
                  ].map((row) => (
                    <Link
                      key={row.label}
                      href={row.href}
                      className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition hover:bg-background"
                    >
                      <span className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm ${row.tint}`}>
                        {row.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-foreground">{row.label}</span>
                        <span className="block truncate text-xs text-muted">{row.sub}</span>
                      </span>
                      <span className="text-muted">›</span>
                    </Link>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-border bg-surface p-5">
                <h2 className="text-base font-bold text-foreground">Your account</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Name</dt>
                    <dd className="truncate font-semibold text-foreground">{user.name}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Role</dt>
                    <dd className="font-semibold capitalize text-foreground">{user.role.replace(/_/g, ' ')}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Phone</dt>
                    <dd className="truncate font-semibold text-foreground">{user.phone}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Status</dt>
                    <dd className="font-semibold capitalize text-success">{user.status}</dd>
                  </div>
                </dl>
                <Link
                  href="/account"
                  className="mt-4 block rounded-lg border border-border py-2 text-center text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
                >
                  Manage account
                </Link>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
