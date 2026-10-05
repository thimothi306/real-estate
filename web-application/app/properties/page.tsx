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
  const foodIncluded = one(params.food_included);
  const pgAmenities = Array.isArray(params.pg_amenities)
    ? params.pg_amenities.filter(Boolean)
    : params.pg_amenities ? [params.pg_amenities] : [];

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
    facing: one(params.facing),
    plot_purpose: one(params.plot_purpose),
    plot_approval: one(params.plot_approval),
    plot_transaction: one(params.plot_transaction),
    plot_feature: one(params.plot_feature),
    pg_occupancy: one(params.pg_occupancy),
    pg_tenant_type: one(params.pg_tenant_type),
    pg_accommodation_type: one(params.pg_accommodation_type),
    pg_tier: one(params.pg_tier),
    pg_rent_model: one(params.pg_rent_model),
    food_included: foodIncluded === undefined ? undefined : foodIncluded === 'true',
    pg_amenities: pgAmenities,
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
      if (key === 'pg_amenities') {
        for (const amenity of pgAmenities) search.append('pg_amenities', amenity);
        continue;
      }
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
        {(filters.property_type === 'plot' || filters.property_type === 'land') && (
          <>
            <select name="plot_purpose" defaultValue={one(params.plot_purpose)} className="rounded-md border border-border px-3 py-2 text-sm">
              <option value="">Any plot purpose</option>
              <option value="residential">Residential</option><option value="commercial">Commercial</option>
              <option value="industrial">Industrial</option><option value="agricultural">Agricultural</option>
              <option value="farmhouse">Farmhouse</option><option value="venture_layout">Venture / layout</option>
            </select>
            <select name="plot_approval" defaultValue={one(params.plot_approval)} className="rounded-md border border-border px-3 py-2 text-sm">
              <option value="">Any approval</option>
              <option value="hmda">HMDA approved</option><option value="dtcp">DTCP approved</option>
              <option value="municipal">Municipal approved</option><option value="gram_panchayat">Gram Panchayat</option>
              <option value="non_approved">Non-approved</option>
            </select>
            <select name="plot_transaction" defaultValue={one(params.plot_transaction)} className="rounded-md border border-border px-3 py-2 text-sm">
              <option value="">Any transaction</option><option value="direct_sale">Direct owner sale</option><option value="joint_development">Joint development</option>
              <option value="investment_prelaunch">Investment / pre-launch</option>
            </select>
            <select name="plot_feature" defaultValue={one(params.plot_feature)} className="rounded-md border border-border px-3 py-2 text-sm">
              <option value="">Any plot location</option><option value="gated_community">Gated community</option>
              <option value="corner">Corner plot</option><option value="highway_facing">Highway facing</option>
              <option value="villa_plot">Villa plot</option><option value="land_parcel">Land parcel (1+ acre)</option>
            </select>
            <select name="facing" defaultValue={one(params.facing)} className="rounded-md border border-border px-3 py-2 text-sm">
              <option value="">Any facing</option><option value="east">East</option><option value="west">West</option>
              <option value="north">North</option><option value="south">South</option>
            </select>
          </>
        )}
        {(filters.property_type === 'pg' || filters.property_type === 'hostel') && (
          <>
            <select name="pg_tenant_type" defaultValue={one(params.pg_tenant_type)} className="rounded-md border border-border px-3 py-2 text-sm">
              <option value="">Any tenant type</option><option value="gents">Boys / gents</option><option value="ladies">Girls / ladies</option>
              <option value="students">Students</option><option value="professionals">Working professionals</option>
              <option value="unisex">Co-living / unisex</option><option value="couples">Couple friendly</option>
            </select>
            <select name="pg_occupancy" defaultValue={one(params.pg_occupancy)} className="rounded-md border border-border px-3 py-2 text-sm">
              <option value="">Any occupancy</option><option value="single">Single</option><option value="double">Double sharing</option>
              <option value="triple">Triple sharing</option><option value="four_plus">4+ sharing</option>
            </select>
            <select name="pg_accommodation_type" defaultValue={one(params.pg_accommodation_type)} className="rounded-md border border-border px-3 py-2 text-sm">
              <option value="">Any accommodation</option><option value="pg_rooms">PG rooms</option>
              <option value="coliving_apartment">Co-living apartment</option><option value="hostel">Hostel</option>
              <option value="private_room">Private room</option><option value="studio_apartment">Studio apartment</option>
            </select>
            <select name="pg_tier" defaultValue={one(params.pg_tier)} className="rounded-md border border-border px-3 py-2 text-sm">
              <option value="">Any standard</option><option value="standard">Standard</option><option value="premium_luxury">Premium / luxury co-living</option>
            </select>
            <select name="pg_rent_model" defaultValue={one(params.pg_rent_model)} className="rounded-md border border-border px-3 py-2 text-sm">
              <option value="">Any duration</option><option value="monthly">Monthly</option>
              <option value="daily_weekly">Daily / weekly</option><option value="long_term_lease">Long-term lease</option>
            </select>
            <select name="food_included" defaultValue={foodIncluded} className="rounded-md border border-border px-3 py-2 text-sm">
              <option value="">Food: any</option><option value="true">Food included</option><option value="false">Food not included</option>
            </select>
            <fieldset className="col-span-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
              <legend className="sr-only">PG amenities</legend>
              {[
                ['ac', 'AC'], ['attached_washroom', 'Attached washroom'], ['washing_machine', 'Washing machine'],
                ['wifi', 'Wi-Fi'], ['food', 'Food'], ['housekeeping', 'Housekeeping'], ['gaming_zone', 'Gaming zone'],
              ].map(([value, label]) => (
                <label key={value} className="flex items-center gap-1.5">
                  <input type="checkbox" name="pg_amenities" value={value} defaultChecked={pgAmenities.includes(value)} />
                  {label}
                </label>
              ))}
            </fieldset>
            <select name="furnishing_status" defaultValue={one(params.furnishing_status)} className="rounded-md border border-border px-3 py-2 text-sm">
              <option value="">Any furnishing</option><option value="fully_furnished">Fully furnished</option>
              <option value="semi_furnished">Semi furnished</option><option value="unfurnished">Unfurnished</option>
            </select>
          </>
        )}
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
