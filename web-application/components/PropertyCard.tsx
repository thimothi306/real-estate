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
      className="card-lift group block overflow-hidden hover:-translate-y-2"
    >
      <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-t-[1.25rem] bg-background text-sm font-medium text-muted">
        {property.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={property.cover_image}
            alt={property.title}
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          titleCase(property.property_type)
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <span className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1 text-sm font-bold text-white backdrop-blur">
          {formatPrice(property.price)}
        </span>

        {property.is_featured && (
          <span className="absolute right-3 top-3 rounded-full bg-gold px-2.5 py-1 text-xs font-bold text-white shadow-[var(--shadow-gold)]">
            ★ Featured
          </span>
        )}
      </div>

      <div className="space-y-1.5 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
          {property.title}
        </h3>

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
