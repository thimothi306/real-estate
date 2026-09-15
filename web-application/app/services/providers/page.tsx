import Link from 'next/link';
import type { Metadata } from 'next';
import { getPartnerDirectory, getServiceCategories } from '@/lib/api';
import { ProviderCard } from '@/components/ProviderCard';

export const metadata: Metadata = {
  title: 'Verified Professionals',
  description: 'Browse verified plumbers, electricians, cleaners, and every other property professional near you.',
};

type ProvidersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value || undefined;
}

export default async function ProvidersPage({ searchParams }: ProvidersPageProps) {
  const params = await searchParams;
  const category = one(params.category);
  const city = one(params.city);

  const [categories, results] = await Promise.all([
    getServiceCategories(),
    getPartnerDirectory({ category, city }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Kavuri Connect</p>
        <h1 className="mt-3 text-3xl font-extrabold text-foreground sm:text-4xl">Verified professionals</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
          {results.total} verified {results.total === 1 ? 'professional' : 'professionals'} ready to help.
        </p>
      </div>

      <form action="/services/providers" method="get" className="mx-auto mt-8 flex max-w-xl flex-wrap gap-3">
        <select
          name="category"
          defaultValue={category ?? ''}
          className="flex-1 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
        >
          <option value="">Any category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <input
          type="text"
          name="city"
          defaultValue={city ?? ''}
          placeholder="City"
          className="w-40 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
        />
        <button type="submit" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">
          Filter
        </button>
      </form>

      {results.items.length === 0 ? (
        <div className="mx-auto mt-14 max-w-sm text-center">
          <p className="text-sm font-semibold text-foreground">No verified professionals match yet</p>
          <p className="mt-1 text-sm text-muted">Try a different category or city, or post a request instead.</p>
          <Link href="/services" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
            Post a service request →
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.items.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      )}
    </div>
  );
}
