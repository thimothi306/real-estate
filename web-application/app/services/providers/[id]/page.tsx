import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPartner } from '@/lib/api';
import { titleCase } from '@/lib/format';

type ProviderPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ProviderPageProps): Promise<Metadata> {
  const { id } = await params;
  const provider = await getPartner(Number(id));

  if (!provider) return { title: 'Professional Not Found' };

  return {
    title: `${provider.user?.name ?? provider.business_name} — ${provider.profession ?? 'Verified Professional'}`,
    description: provider.bio ?? `${provider.profession ?? provider.business_name}, verified on Kavuri Connect.`,
  };
}

export default async function ProviderDetailPage({ params }: ProviderPageProps) {
  const { id } = await params;
  const provider = await getPartner(Number(id));

  if (!provider) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="card-lift p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">{provider.user?.name ?? provider.business_name}</h1>
            <p className="mt-1 text-sm font-semibold text-primary">{provider.profession ?? provider.business_name}</p>
          </div>
          {provider.is_verified && (
            <span className="rounded-full bg-gold px-3 py-1.5 text-xs font-bold text-white shadow-[var(--shadow-gold)]">
              ✓ Verified Professional
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
          {provider.rating_avg != null && (
            <span className="font-semibold text-foreground">★ {provider.rating_avg.toFixed(1)} ({provider.rating_count})</span>
          )}
          <span>{provider.total_completed} jobs completed</span>
          {provider.years_experience && <span>{provider.years_experience} years experience</span>}
          {provider.user?.city && <span>📍 {provider.user.city}</span>}
        </div>

        {provider.bio && (
          <section className="mt-6">
            <h2 className="text-sm font-bold text-foreground">About</h2>
            <p className="mt-2 text-sm text-muted">{provider.bio}</p>
          </section>
        )}

        {(provider.categories ?? []).length > 0 && (
          <section className="mt-6">
            <h2 className="text-sm font-bold text-foreground">Services offered</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {provider.categories!.map((category) => (
                <span key={category.id} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {category.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {(provider.cities_served ?? []).length > 0 && (
          <section className="mt-6">
            <h2 className="text-sm font-bold text-foreground">Service area</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {provider.cities_served!.map((city) => (
                <span key={city} className="rounded-full bg-background px-3 py-1 text-xs text-muted">📍 {titleCase(city)}</span>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {provider.user?.phone && (
            <a
              href={`tel:${provider.user.phone}`}
              className="rounded-full bg-gold px-6 py-3 text-sm font-bold text-white shadow-[var(--shadow-gold)] transition hover:-translate-y-0.5 hover:bg-gold-deep"
            >
              Call {provider.user.name}
            </a>
          )}
          <a
            href="/services"
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
          >
            Post a service request instead
          </a>
        </div>
      </div>
    </div>
  );
}
