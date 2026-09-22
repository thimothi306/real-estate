'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCities } from '@/lib/api';

export function HeaderCitySelect() {
  const router = useRouter();
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    getCities().then(setCities).catch(() => undefined);
  }, []);

  return (
    <select
      onChange={(e) => {
        if (e.target.value) router.push(`/properties?city=${encodeURIComponent(e.target.value)}`);
      }}
      defaultValue=""
      aria-label="Browse by city"
      className="hidden rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-primary hover:text-foreground focus:border-primary focus:outline-none md:block"
    >
      <option value="">📍 Select city</option>
      {cities.map((city) => (
        <option key={city} value={city}>{city}</option>
      ))}
    </select>
  );
}
