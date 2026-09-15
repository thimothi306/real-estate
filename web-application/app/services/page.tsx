import Link from 'next/link';
import type { Metadata } from 'next';
import { getServiceCategories } from '@/lib/api';
import { PostServiceRequestForm } from '@/components/PostServiceRequestForm';

export const metadata: Metadata = {
  title: 'Kavuri Connect',
  description: 'Verified professionals for every property need — plumbers, electricians, cleaners, legal, loans, and more.',
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
  'plumbing-water': '🚿',
  'electrical-electronics': '⚡',
  'home-renovation-repairs': '🪚',
  'cleaning-housekeeping': '🧹',
  'outdoor-garden': '🌳',
  'security-staffing': '💂',
  'household-staff': '👨‍🍳',
  'construction-civil-works': '🏗️',
  'commercial-property-services': '🏬',
  'utility-services': '📡',
};

export default async function ServicesPage() {
  const categories = await getServiceCategories();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Kavuri Connect</p>
        <h1 className="mt-3 text-3xl font-extrabold text-foreground sm:text-4xl">
          Verified Professionals for Every Property Need
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
          One marketplace. Every property service. Post a request and verified professionals will send you quotes.
        </p>
      </div>

      <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
        <a
          href="#post-request"
          className="card-lift flex flex-col items-center gap-2 p-6 text-center"
        >
          <span className="text-3xl">🙋</span>
          <span className="text-sm font-bold text-foreground">I Need a Service</span>
          <span className="text-xs text-muted">Post a request — verified professionals will quote you</span>
        </a>
        <Link
          href="/dashboard/provider"
          className="card-lift flex flex-col items-center gap-2 p-6 text-center"
        >
          <span className="text-3xl">🛠️</span>
          <span className="text-sm font-bold text-foreground">I Provide a Service</span>
          <span className="text-xs text-muted">Register as a verified professional and get hired</span>
        </Link>
      </div>

      <div className="mt-4 text-center">
        <Link href="/services/providers" className="text-sm font-semibold text-primary hover:underline">
          Or browse verified professionals directly →
        </Link>
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

      <div id="post-request" className="mx-auto mt-14 max-w-xl scroll-mt-24">
        <PostServiceRequestForm categories={categories} />
      </div>
    </div>
  );
}
