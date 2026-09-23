import Link from 'next/link';
import type { Metadata } from 'next';
import { searchProperties } from '@/lib/api';
import { PropertyCard } from '@/components/PropertyCard';
import type { SearchFilters } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Browse Properties',
  description: 'Search verified properties across India — villas, apartments, plots, and more.',
};

type SearchPageProps = {
  // Next hands back an array when a key repeats in the query string
  // (?a=1&a=2), so the value is not simply `string`.
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Collapses a possibly-repeated query param to the last meaningful value. */
function one(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return [...value].reverse().find((v) => v !== '') ?? undefined;
  }
  return value === '' ? undefined : value;
}

// Split for the Rent optgroup — Residential vs. Commercial subtypes.
// Everything else (plots/land/farmhouse/etc.) shows ungrouped, since the
// residential/commercial split only really means something once you're
// renting (buying a plot isn't "residential" or "commercial" the same way).
const RESIDENTIAL_TYPES = ['apartment', 'villa', 'farmhouse', 'pg'];
const COMMERCIAL_TYPES = ['office_space', 'co_working_space', 'shop', 'commercial', 'warehouse'];
const OTHER_TYPES = ['plot', 'land', 'resort', 'wedding_venue', 'hostel'];

export default async function PropertiesPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  const maxPrice = one(params.max_price);
  const minPrice = one(params.min_price);
  const areaMin = one(params.area_min);
  const areaMax = one(params.area_max);
  const bedrooms = one(params.bedrooms);
  const page = one(params.page);

  const filters: SearchFilters = {
    q: one(params.q),
    city: one(params.city),
    state: one(params.state),
    country: one(params.country),
    property_type: one(params.property_type) as SearchFilters['property_type'],
    listing_type: one(params.listing_type) as SearchFilters['listing_type'],
    min_price: minPrice ? Number(minPrice) : undefined,
    max_price: maxPrice ? Number(maxPrice) : undefined,
    area_min: areaMin ? Number(areaMin) : undefined,
    area_max: areaMax ? Number(areaMax) : undefined,
    bedrooms: bedrooms ? Number(bedrooms) : undefined,
    sort: (one(params.sort) as SearchFilters['sort']) ?? 'newest',
    page: page ? Number(page) : 1,
  };

  const isRent = filters.listing_type === 'rent';

  const results = await searchProperties(filters);

  function buildUrl(overrides: Record<string, string | number | undefined>) {
    const search = new URLSearchParams();

    // Normalise incoming params through one() so a repeated key never gets
    // stringified as "plot," and carried into sort/pagination links.
    for (const [key, raw] of Object.entries(params)) {
      const value = one(raw);
      if (value !== undefined) search.set(key, value);
    }

    for (const [key, value] of Object.entries(overrides)) {
      if (value === undefined || value === '') {
        search.delete(key);
      } else {
        search.set(key, String(value));
      }
    }

    return `/properties?${search.toString()}`;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground">
        {results.total} {results.total === 1 ? 'property' : 'properties'} found
      </h1>

      <form action="/properties" method="get" className="mt-6 grid grid-cols-2 gap-3 rounded-lg border border-border bg-surface p-4 sm:grid-cols-4">
        <input
          type="text"
          name="q"
          defaultValue={params.q}
          placeholder="Keyword"
          className="col-span-2 rounded-md border border-border px-3 py-2 text-sm sm:col-span-1"
        />
        <input
          type="text"
          name="city"
          defaultValue={params.city}
          placeholder="City"
          className="rounded-md border border-border px-3 py-2 text-sm"
        />
        <input
          type="text"
          name="state"
          defaultValue={params.state}
          placeholder="State"
          className="rounded-md border border-border px-3 py-2 text-sm"
        />
        <input
          type="text"
          name="country"
          defaultValue={params.country}
          placeholder="Country"
          className="rounded-md border border-border px-3 py-2 text-sm"
        />
        <select name="property_type" defaultValue={params.property_type} className="rounded-md border border-border px-3 py-2 text-sm">
          <option value="">Any type</option>
          {isRent ? (
            <>
              <optgroup label="Residential">
                {RESIDENTIAL_TYPES.map((type) => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                ))}
              </optgroup>
              <optgroup label="Commercial">
                {COMMERCIAL_TYPES.map((type) => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                ))}
              </optgroup>
              <optgroup label="Other">
                {OTHER_TYPES.map((type) => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                ))}
              </optgroup>
            </>
          ) : (
            [...RESIDENTIAL_TYPES, ...COMMERCIAL_TYPES, ...OTHER_TYPES].map((type) => (
              <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
            ))
          )}
        </select>
        <select name="listing_type" defaultValue={params.listing_type} className="rounded-md border border-border px-3 py-2 text-sm">
          <option value="">Buy or rent</option>
          <option value="sale">For sale</option>
          <option value="rent">For rent</option>
        </select>
        <input
          type="number"
          name="min_price"
          defaultValue={params.min_price}
          placeholder="Min price"
          className="rounded-md border border-border px-3 py-2 text-sm"
        />
        <input
          type="number"
          name="max_price"
          defaultValue={params.max_price}
          placeholder="Max price"
          className="rounded-md border border-border px-3 py-2 text-sm"
        />
        <input
          type="number"
          name="area_min"
          defaultValue={params.area_min}
          placeholder="Min area (sqft)"
          className="rounded-md border border-border px-3 py-2 text-sm"
        />
        <input
          type="number"
          name="area_max"
          defaultValue={params.area_max}
          placeholder="Max area (sqft)"
          className="rounded-md border border-border px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
          Apply filters
        </button>
      </form>

      <div className="mt-4 flex gap-2 text-sm">
        <span className="text-muted">Sort:</span>
        <Link href={buildUrl({ sort: 'newest' })} className={filters.sort === 'newest' ? 'font-semibold text-foreground' : 'text-muted'}>
          Newest
        </Link>
        <Link href={buildUrl({ sort: 'price_asc' })} className={filters.sort === 'price_asc' ? 'font-semibold text-foreground' : 'text-muted'}>
          Price: low to high
        </Link>
        <Link href={buildUrl({ sort: 'price_desc' })} className={filters.sort === 'price_desc' ? 'font-semibold text-foreground' : 'text-muted'}>
          Price: high to low
        </Link>
      </div>

      {results.items.length === 0 ? (
        <p className="mt-10 text-center text-muted">No properties match these filters.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.items.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}

      {results.lastPage > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: results.lastPage }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={buildUrl({ page })}
              className={`rounded-md px-3 py-1.5 text-sm ${
                page === results.currentPage ? 'bg-primary text-white' : 'border border-border text-muted'
              }`}
            >
              {page}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
