'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getCities, getCountries, getStates } from '@/lib/api';

/**
 * Cascading Country -> State -> City. Only India has a real states list
 * (see backend App\Support\Geo) since that's the only country with actual
 * listings behind it — other countries just skip the state/city cascade
 * rather than faking data with nothing to back it.
 *
 * Selecting anything merges into the *current* page's query string (works
 * the same on "/" and "/properties") so it acts as a persistent location
 * context other components (e.g. the hero's search form) can read via
 * useSearchParams() without any shared state/context of their own.
 */
export function HeaderLocationSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [countries, setCountries] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const country = searchParams.get('country') ?? '';
  const state = searchParams.get('state') ?? '';
  const city = searchParams.get('city') ?? '';

  useEffect(() => {
    getCountries().then(setCountries).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!country) {
      setStates([]);
      return;
    }
    getStates(country).then(setStates).catch(() => undefined);
  }, [country]);

  useEffect(() => {
    getCities(undefined, state || undefined).then(setCities).catch(() => undefined);
  }, [state]);

  function navigate(next: { country?: string; state?: string; city?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    const merged = { country, state, city, ...next };

    (['country', 'state', 'city'] as const).forEach((key) => {
      if (merged[key]) params.set(key, merged[key] as string);
      else params.delete(key);
    });

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="hidden items-center gap-1.5 md:flex">
      <select
        value={country}
        onChange={(e) => navigate({ country: e.target.value, state: '', city: '' })}
        aria-label="Country"
        className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-primary hover:text-foreground focus:border-primary focus:outline-none"
      >
        <option value="">🌍 Country</option>
        {countries.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {!!country && (
        <select
          value={state}
          onChange={(e) => navigate({ state: e.target.value, city: '' })}
          aria-label="State"
          disabled={states.length === 0}
          className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-primary hover:text-foreground focus:border-primary focus:outline-none disabled:opacity-50"
        >
          <option value="">{states.length === 0 ? 'No states yet' : 'State'}</option>
          {states.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      )}

      <select
        value={city}
        onChange={(e) => navigate({ city: e.target.value })}
        aria-label="City"
        className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-primary hover:text-foreground focus:border-primary focus:outline-none"
      >
        <option value="">📍 City</option>
        {cities.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}
