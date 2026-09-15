import Link from 'next/link';
import type { PartnerProfile } from '@/lib/types';
import { titleCase } from '@/lib/format';

export function ProviderCard({ provider }: { provider: PartnerProfile }) {
  return (
    <Link
      href={`/services/providers/${provider.user_id}`}
      className="card-lift group block p-5 hover:-translate-y-2"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-foreground group-hover:text-primary">
            {provider.user?.name ?? provider.business_name}
          </h3>
          <p className="mt-0.5 truncate text-xs font-semibold text-primary">
            {provider.profession ?? titleCase(provider.categories?.[0]?.name)}
          </p>
        </div>
        {provider.is_verified && (
          <span className="shrink-0 rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold text-white shadow-[var(--shadow-gold)]">
            ✓ Verified
          </span>
        )}
      </div>

      <p className="mt-2 line-clamp-2 text-xs text-muted">{provider.bio ?? provider.business_name}</p>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        {provider.rating_avg != null && (
          <span className="font-semibold text-foreground">★ {provider.rating_avg.toFixed(1)}</span>
        )}
        <span>{provider.total_completed} jobs completed</span>
        {provider.years_experience && <span>{provider.years_experience} yrs experience</span>}
      </div>

      {provider.user?.city && <p className="mt-2 text-xs text-muted">📍 {provider.user.city}</p>}
    </Link>
  );
}
