import Link from 'next/link';
import { ASSET_BASE_URL } from '@/lib/config';
import { getCategoryCounts } from '@/lib/api';
import type { PropertyType } from '@/lib/types';

const CATEGORIES: { label: string; type?: PropertyType; listing?: 'sale' | 'rent'; photo: string }[] = [
  { label: 'Buy', listing: 'sale', photo: 'estate-01.jpg' },
  { label: 'Rent', listing: 'rent', photo: 'estate-02.jpg' },
  { label: 'Villas', type: 'villa', photo: 'estate-03.jpg' },
  { label: 'Plots', type: 'plot', photo: 'estate-04.jpg' },
  { label: 'Farm Houses', type: 'farmhouse', photo: 'estate-05.jpg' },
  { label: 'Resorts', type: 'resort', photo: 'estate-06.jpg' },
  { label: 'PG', type: 'pg', photo: 'estate-07.jpg' },
  { label: 'Commercial', type: 'commercial', photo: 'estate-08.jpg' },
];

export async function CategoryTiles() {
  const counts = await getCategoryCounts();

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {CATEGORIES.map((category) => {
        const params = new URLSearchParams();
        if (category.type) params.set('property_type', category.type);
        if (category.listing) params.set('listing_type', category.listing);

        const count = category.type
          ? counts.by_property_type[category.type] ?? 0
          : counts.by_listing_type[category.listing!] ?? 0;

        return (
          <Link
            key={category.label}
            href={`/properties?${params.toString()}`}
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${ASSET_BASE_URL}/storage/property-images/${category.photo}`}
              alt=""
              className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

            <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-foreground shadow">
              {count}
            </span>

            <span className="absolute bottom-3 left-4 text-base font-bold text-white">{category.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
