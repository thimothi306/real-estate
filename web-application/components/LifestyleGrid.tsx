import Link from 'next/link';

const LIFESTYLES = [
  { label: 'Family Friendly', icon: '👨‍👩‍👧', slug: 'family-friendly', tint: 'bg-success-bg' },
  { label: 'Pet Friendly', icon: '🐾', slug: 'pet-friendly', tint: 'bg-warning-bg' },
  { label: 'Luxury Living', icon: '👑', slug: 'luxury-living', tint: 'bg-primary-soft' },
  { label: 'Weekend Home', icon: '🏖', slug: 'weekend-home', tint: 'bg-info-bg' },
  { label: 'Retirement Home', icon: '🪑', slug: 'retirement-home', tint: 'bg-danger-bg' },
  { label: 'Bachelor Friendly', icon: '🎒', slug: 'bachelor-friendly', tint: 'bg-gold-soft' },
  { label: 'Investment', icon: '📈', slug: 'hotel-investment', tint: 'bg-primary-soft' },
];

export function LifestyleGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">Search by Lifestyle</h2>
        <Link href="/properties" className="text-sm font-semibold text-primary hover:underline">
          View all
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {LIFESTYLES.map((item) => (
          <Link
            key={item.slug}
            href={`/properties?lifestyle_tag=${item.slug}`}
            className="flex flex-col items-center gap-2.5 rounded-2xl border border-border bg-surface px-2 py-5 text-center transition hover:-translate-y-1 hover:border-primary hover:shadow-lg"
          >
            <span className={`flex h-12 w-12 items-center justify-center rounded-full text-xl ${item.tint}`}>
              {item.icon}
            </span>
            <span className="text-xs font-semibold leading-tight text-foreground">{item.label}</span>
          </Link>
        ))}

        <Link
          href="/properties"
          className="flex flex-col items-center gap-2.5 rounded-2xl border border-border bg-surface px-2 py-5 text-center transition hover:-translate-y-1 hover:border-primary hover:shadow-lg"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-alt text-lg text-muted">
            •••
          </span>
          <span className="text-xs font-semibold text-foreground">More</span>
        </Link>
      </div>
    </section>
  );
}
