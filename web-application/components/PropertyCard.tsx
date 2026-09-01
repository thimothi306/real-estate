import Link from 'next/link';
import type { PropertySummary } from '@/lib/types';
import { formatPrice, titleCase } from '@/lib/format';

export function PropertyCard({ property }: { property: PropertySummary }) {
  const specs = [
    property.bedrooms ? `${property.bedrooms} BHK` : null,
    property.bathrooms ? `${property.bathrooms} Bath` : null,
    property.area_sqft ? `${Math.round(property.area_sqft)} sq ft` : null,
  ].filter(Boolean);

  return (
    <Link
      href={`/properties/${property.slug}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-surface transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_48px_-24px_rgba(31,111,235,0.35)]"
    >
      <div className="relative flex h-48 items-center justify-center overflow-hidden bg-background text-sm font-medium text-muted">
        {property.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={property.cover_image}
            alt={property.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          />
        ) : (
          titleCase(property.property_type)
        )}

        <span className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1 text-sm font-bold text-white backdrop-blur">
          {formatPrice(property.price)}
        </span>

        {property.is_featured && (
          <span className="absolute right-3 top-3 rounded-full bg-warning px-2.5 py-1 text-xs font-bold text-white shadow">
            ★ Featured
          </span>
        )}
      </div>

      <div className="space-y-1.5 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground">{property.title}</h3>

        <p className="text-sm text-muted">📍 {[property.locality, property.city].filter(Boolean).join(', ')}</p>

        {specs.length > 0 && <p className="text-xs text-muted">{specs.join(' · ')}</p>}

        <div className="flex gap-1.5 pt-1">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {titleCase(property.property_type)}
          </span>
          <span className="rounded-full bg-background px-2.5 py-0.5 text-xs text-muted">
            {property.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
        </div>
      </div>
    </Link>
  );
}
