import { Suspense } from 'react';
import Link from 'next/link';
import { getCategoryCounts, getCities, searchProperties } from '@/lib/api';
import { PropertyCard } from '@/components/PropertyCard';
import { LandingHero } from '@/components/LandingHero';
import { LifestyleGrid } from '@/components/LifestyleGrid';
import { StatsBar } from '@/components/StatsBar';
import { LenderStrip } from '@/components/LenderStrip';
import { HowItWorksStrip } from '@/components/HowItWorksStrip';
import { TrustSection } from '@/components/TrustSection';
import { CategoryTiles } from '@/components/CategoryTiles';
import { HowItWorks } from '@/components/HowItWorks';
import { FaqSection } from '@/components/FaqSection';
import { FinalCta } from '@/components/FinalCta';
import { Reveal } from '@/components/Reveal';

export default async function HomePage() {
  const [featured, latest, counts, cities] = await Promise.all([
    searchProperties({ sort: 'newest', per_page: 8 }),
    searchProperties({ sort: 'price_desc', per_page: 6 }),
    getCategoryCounts(),
    getCities(),
  ]);

  const totalProperties = Object.values(counts.by_listing_type).reduce((sum, n) => sum + n, 0);

  return (
    // No clipping wrapper here — ScrollTrigger pins HowItWorks with
    // position:fixed, and a clipping ancestor clips the pinned element out of
    // view. Sections with horizontal motion clip themselves instead.
    <div>
      <Suspense fallback={null}>
        <LandingHero verifiedCount={totalProperties} />
      </Suspense>

      <LifestyleGrid />

      <StatsBar propertyCount={totalProperties} cityCount={cities.length} />

      <div className="mt-14">
        <LenderStrip />
      </div>

      <HowItWorksStrip />

      <section className="mx-auto max-w-6xl px-4 pb-4">
        <Reveal>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">Browse by category</h2>
            <Link href="/properties" className="text-sm font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>
          <CategoryTiles />
        </Reveal>
      </section>

      <TrustSection />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">Recommended Properties</h2>
              <p className="mt-1 text-sm text-muted">Freshly listed and verified this week.</p>
            </div>
            <Link href="/properties" className="text-sm font-semibold text-primary hover:underline">
              View All
            </Link>
          </div>
        </Reveal>

        {featured.items.length === 0 ? (
          <p className="mt-6 text-muted">No published listings yet.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.items.slice(0, 8).map((property, i) => (
              <Reveal key={property.id} delay={(i % 4) * 0.07}>
                <PropertyCard property={property} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <HowItWorks />

      {/* Clipped locally: the cards slide in horizontally, which would
          otherwise push the page wider than the viewport mid-animation. */}
      <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-16">
        <Reveal>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">Premium Listings</h2>
            <Link href="/properties?sort=price_desc" className="text-sm font-semibold text-primary hover:underline">
              View All
            </Link>
          </div>
        </Reveal>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {latest.items.slice(0, 6).map((property, i) => (
            <Reveal key={property.id} delay={(i % 3) * 0.07} direction={i % 2 === 0 ? 'left' : 'right'}>
              <PropertyCard property={property} />
            </Reveal>
          ))}
        </div>
      </section>

      <FaqSection />

      <FinalCta />
    </div>
  );
}
