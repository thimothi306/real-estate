import type { Metadata } from 'next';
import { getServiceCategories } from '@/lib/api';
import { PostServiceRequestForm } from '@/components/PostServiceRequestForm';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Interior design, legal verification, home loans, packers & movers, and more — all in one place.',
};

const ICONS: Record<string, string> = {
  'home-loan': '🏦',
  'home-services': '🔧',
  'interior-design': '🛋️',
  'legal-verification': '⚖️',
  'moving-services': '🚚',
  'property-management': '🏢',
  'registration-assistance': '📝',
  'rental-management': '🔑',
  'tenant-verification': '🛡️',
};

export default async function ServicesPage() {
  const categories = await getServiceCategories();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">All Services</p>
        <h1 className="mt-3 text-3xl font-extrabold text-foreground sm:text-4xl">
          Everything your property needs, in one place
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
          Post a request and verified partners will send you quotes — no separate app, no cold calls.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-5 text-center transition hover:-translate-y-1 hover:border-primary hover:shadow-lg"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-xl">
              {ICONS[category.slug] ?? '🛠️'}
            </span>
            <span className="text-sm font-bold text-foreground">{category.name}</span>
            {!!category.description && (
              <span className="text-xs leading-snug text-muted">{category.description}</span>
            )}
          </div>
        ))}
      </div>

      <div className="mx-auto mt-14 max-w-xl">
        <PostServiceRequestForm categories={categories} />
      </div>
    </div>
  );
}
