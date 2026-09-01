import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProperty } from '@/lib/api';
import { formatPrice, titleCase } from '@/lib/format';

type PropertyPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getProperty(slug);

  if (!property) {
    return { title: 'Property Not Found' };
  }

  const description = property.description
    ? property.description.slice(0, 155)
    : `${titleCase(property.property_type)} for ${property.listing_type} in ${property.city} — ${formatPrice(property.price)}.`;

  return {
    title: property.title,
    description,
    openGraph: {
      title: property.title,
      description,
      images: property.media?.[0]?.url ? [property.media[0].url] : [],
    },
  };
}

export default async function PropertyDetailPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  const property = await getProperty(slug);

  if (!property) {
    notFound();
  }

  const images = (property.media ?? []).filter((item) => item.type === 'image');

  const facts: [string, string][] = [
    ['Type', titleCase(property.property_type)],
    ['Listing', property.listing_type === 'rent' ? 'For rent' : 'For sale'],
    ['Bedrooms', property.bedrooms ? String(property.bedrooms) : '—'],
    ['Bathrooms', property.bathrooms ? String(property.bathrooms) : '—'],
    ['Built-up area', property.area_sqft ? `${Math.round(property.area_sqft)} sq ft` : '—'],
    ['Facing', titleCase(property.facing)],
    ['Furnishing', titleCase(property.furnishing_status)],
    ['RERA', property.is_rera_approved ? property.rera_number || 'Approved' : 'Not approved'],
  ];

  const features = [
    property.has_balcony && 'Balcony',
    property.has_swimming_pool && 'Swimming pool',
    property.has_garden && 'Garden',
    property.has_parking && 'Parking',
  ].filter(Boolean) as string[];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {images.length > 0 ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:grid-rows-2">
          {/* eslint-disable @next/next/no-img-element */}
          <img
            src={images[0].url}
            alt={property.title}
            className="col-span-4 h-80 w-full rounded-lg object-cover sm:col-span-3 sm:row-span-2"
          />
          {images.slice(1, 3).map((image) => (
            <img key={image.id} src={image.url} alt="" className="hidden h-[9.5rem] w-full rounded-lg object-cover sm:block" />
          ))}
          {/* eslint-enable @next/next/no-img-element */}
        </div>
      ) : (
        <div className="flex h-80 items-center justify-center rounded-lg bg-background text-muted">No photos yet</div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-3xl font-bold text-foreground">{formatPrice(property.price)}</span>
            {property.listing_type === 'rent' && property.rent_price != null && (
              <span className="text-muted">{formatPrice(property.rent_price)} / month</span>
            )}
          </div>

          <h1 className="mt-2 text-xl font-semibold text-foreground">{property.title}</h1>
          <p className="mt-1 text-muted">
            {[property.address_line, property.locality, property.city, property.state, property.pincode]
              .filter(Boolean)
              .join(', ')}
          </p>

          {(property.verifications ?? []).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {property.verifications!.map((badge) => (
                <span key={badge} className="rounded-full bg-success-bg px-3 py-1 text-xs font-semibold text-success">
                  ✓ {titleCase(badge)}
                </span>
              ))}
            </div>
          )}

          {property.description && (
            <section className="mt-8">
              <h2 className="text-lg font-bold text-foreground">About this property</h2>
              <p className="mt-2 whitespace-pre-line text-muted">{property.description}</p>
            </section>
          )}

          <section className="mt-8">
            <h2 className="text-lg font-bold text-foreground">Property details</h2>
            <dl className="mt-3 divide-y divide-border rounded-lg border border-border bg-surface">
              {facts.map(([label, value]) => (
                <div key={label} className="flex justify-between px-4 py-3 text-sm">
                  <dt className="text-muted">{label}</dt>
                  <dd className="font-medium text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {features.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-bold text-foreground">Features</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {features.map((feature) => (
                  <span key={feature} className="rounded-full bg-background px-3 py-1 text-xs text-muted">
                    {feature}
                  </span>
                ))}
              </div>
            </section>
          )}

          {(property.amenities ?? []).length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-bold text-foreground">Amenities</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {property.amenities!.map((amenity) => (
                  <span key={amenity} className="rounded-full bg-background px-3 py-1 text-xs text-muted">
                    {amenity}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="h-fit rounded-lg border border-border bg-surface p-6">
          <h2 className="text-sm font-semibold text-muted">Listed by</h2>
          <p className="mt-1 text-lg font-bold text-foreground">{property.owner?.name ?? 'Kavuri Estates'}</p>

          {property.owner?.phone && (
            <a
              href={`tel:${property.owner.phone}`}
              className="mt-4 block rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Call {property.owner.name}
            </a>
          )}

          <p className="mt-4 text-xs text-muted">
            Get the Kavuri Estates app to save, compare, and message owners directly.
          </p>

          <p className="mt-4 text-xs text-muted">{property.views_count} views</p>
        </aside>
      </div>
    </div>
  );
}
