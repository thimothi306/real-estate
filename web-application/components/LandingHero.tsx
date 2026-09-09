'use client';

import { useState } from 'react';
import { ASSET_BASE_URL } from '@/lib/config';

/**
 * Each tab pre-seeds the two filter controls below it rather than emitting
 * its own hidden field. An earlier version rendered a hidden `property_type`
 * alongside the visible `property_type` select, so the Plots/Commercial/PG
 * tabs submitted the key twice ("?property_type=plot&property_type=") — the
 * API rejected the resulting "plot," value and every search returned nothing.
 */
const TABS = [
  { key: 'buy', label: 'Buy', listingType: 'sale', propertyType: '' },
  { key: 'rent', label: 'Rent', listingType: 'rent', propertyType: '' },
  { key: 'plots', label: 'Plots', listingType: 'sale', propertyType: 'plot' },
  { key: 'commercial', label: 'Commercial', listingType: '', propertyType: 'commercial' },
  { key: 'pg', label: 'PG / Co-living', listingType: 'rent', propertyType: 'pg' },
] as const;

const PROPERTY_TYPES = [
  { value: '', label: 'Any property type' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'villa', label: 'Villa' },
  { value: 'plot', label: 'Plot' },
  { value: 'farmhouse', label: 'Farmhouse' },
  { value: 'pg', label: 'PG / Co-living' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'office_space', label: 'Office Space' },
  { value: 'shop', label: 'Shop' },
  { value: 'warehouse', label: 'Warehouse' },
];

const BUDGETS = [
  { value: '', label: 'Any budget' },
  { value: '5000000', label: 'Under ₹50 L' },
  { value: '10000000', label: 'Under ₹1 Cr' },
  { value: '20000000', label: 'Under ₹2 Cr' },
  { value: '50000000', label: 'Under ₹5 Cr' },
];

const POPULAR = [
  { label: '2 BHK in Hyderabad', href: '/properties?city=Hyderabad&bedrooms=2' },
  { label: 'Gated Community', href: '/properties?q=gated' },
  { label: 'Near Metro', href: '/properties?q=metro' },
  { label: 'Luxury Apartments', href: '/properties?lifestyle_tag=luxury-living' },
  { label: 'Plots in Shankarpally', href: '/properties?property_type=plot' },
];

const TRUST = [
  { icon: '🛡', title: 'Verified Properties', sub: '100% Trusted' },
  { icon: '📄', title: 'Transparent Deals', sub: 'No Hidden Charges' },
  { icon: '🎧', title: 'End to End Support', sub: '24/7 Assistance' },
];

export function LandingHero({ verifiedCount }: { verifiedCount: number }) {
  const [tabKey, setTabKey] = useState<string>(TABS[0].key);
  const [propertyType, setPropertyType] = useState<string>(TABS[0].propertyType);

  const tab = TABS.find((t) => t.key === tabKey) ?? TABS[0];

  function selectTab(next: (typeof TABS)[number]) {
    setTabKey(next.key);
    // Tab and dropdown are the same filter, so switching tabs re-seeds the
    // dropdown. The visitor can still override it afterwards.
    setPropertyType(next.propertyType);
  }

  return (
    <section className="relative overflow-hidden bg-navy">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${ASSET_BASE_URL}/storage/property-images/estate-04.jpg`}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/95 to-navy/55" />

      {/* Floating decorative orbs for depth and motion */}
      <span className="orb pointer-events-none absolute -left-24 top-1/4 h-72 w-72 bg-primary/40" />
      <span className="orb pointer-events-none absolute right-1/4 top-1/2 h-96 w-96 bg-gold/20" />
      <span className="orb pointer-events-none absolute -bottom-10 left-1/3 h-64 w-64 bg-navy-soft/60" />

      <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-16 sm:pt-20">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-extrabold leading-[1.1] text-white sm:text-5xl lg:text-6xl">
            One App for
            <br />
            Every Property Need<span className="text-gold">.</span>
          </h1>
          <p className="mt-5 max-w-md text-base text-white/70 sm:text-lg">
            Buy. Rent. Manage. Everything in one trusted real estate ecosystem.
          </p>

          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
            {TRUST.map((item) => (
              <div key={item.title} className="flex items-center gap-2.5">
                <span className="text-lg text-gold">{item.icon}</span>
                <div>
                  <div className="text-[13px] font-bold text-white">{item.title}</div>
                  <div className="text-[11px] text-white/55">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 max-w-4xl overflow-hidden rounded-2xl bg-surface shadow-2xl ring-1 ring-border/60">
          <div className="scroll-x flex border-b border-border" role="tablist" aria-label="Search type">
            {TABS.map((item) => {
              const active = tab.key === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => selectTab(item)}
                  className={`relative shrink-0 px-6 py-4 text-sm font-semibold transition ${
                    active ? 'text-foreground' : 'text-muted hover:text-foreground'
                  }`}
                >
                  {item.label}
                  {active && <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-primary" />}
                </button>
              );
            })}
          </div>

          <form action="/properties" method="get" className="p-4">
            {/* listing_type has no visible control, so it stays hidden.
                property_type is the select below — never duplicated here. */}
            {tab.listingType && <input type="hidden" name="listing_type" value={tab.listingType} />}

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">📍</span>
                <input
                  type="text"
                  name="q"
                  placeholder="Search location or project"
                  aria-label="Search location or project"
                  className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <select
                name="property_type"
                aria-label="Property type"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {PROPERTY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>

              <select
                name="max_price"
                aria-label="Budget"
                defaultValue=""
                className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {BUDGETS.map((budget) => (
                  <option key={budget.value} value={budget.value}>{budget.label}</option>
                ))}
              </select>

              <button
                type="submit"
                className="group flex items-center justify-center gap-2 rounded-xl bg-navy px-8 py-3 text-sm font-bold text-white transition hover:bg-navy-soft hover:shadow-gold hover:ring-2 hover:ring-gold/40"
              >
                🔍 Search
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted">Popular Searches:</span>
              {POPULAR.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted transition hover:border-primary hover:text-primary hover:shadow-md"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </form>
        </div>
      </div>

      <div className="pointer-events-none absolute right-6 top-16 hidden xl:block">
        <div className="glass-strong flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-xl">
          <span className="text-xl text-primary">🛡</span>
          <div>
            <div className="text-lg font-extrabold leading-none text-foreground">
              {verifiedCount >= 1000 ? `${Math.floor(verifiedCount / 1000)}K+` : verifiedCount}
            </div>
            <div className="text-[11px] font-medium text-muted">Verified Properties</div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-32 right-6 hidden xl:block">
        <div className="glass-strong rounded-2xl px-5 py-3.5 text-center shadow-xl">
          <div className="text-sm tracking-tight text-gold">★★★★★</div>
          <div className="mt-1 text-lg font-extrabold leading-none text-foreground">4.8 / 5</div>
          <div className="text-[11px] font-medium text-muted">From 2.3K+ Reviews</div>
        </div>
      </div>
    </section>
  );
}
