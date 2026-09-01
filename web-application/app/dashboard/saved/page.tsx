'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { authDelete, authGet, ApiError } from '@/lib/auth-api';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { PropertyCard } from '@/components/PropertyCard';
import type { PropertySummary } from '@/lib/types';

export default function SavedPropertiesPage() {
  const { user, token, initialising } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      // authGet unwraps to `.data`, but favorites also carries a `meta.total`
      // we don't need here — the array itself is enough for this list.
      const result = await authGet<PropertySummary[]>('/favorites', token);
      setItems(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load your saved properties.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!initialising && !user) router.replace('/login');
  }, [initialising, user, router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleRemove(propertyId: number) {
    if (!token) return;
    setRemovingId(propertyId);
    try {
      await authDelete(`/properties/${propertyId}/favorite`, token);
      setItems((current) => current.filter((p) => p.id !== propertyId));
    } catch {
      setError('Could not remove that property. Try again.');
    } finally {
      setRemovingId(null);
    }
  }

  if (initialising || !user) {
    return <div className="px-4 py-24 text-center text-muted">Loading…</div>;
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar counts={{ 'Saved Properties': items.length }} />

      <div className="min-w-0 flex-1 bg-background">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">Saved Properties</h1>
              <p className="mt-1 text-sm text-muted">Everything you've favorited, in one place.</p>
            </div>
            <Link href="/properties" className="text-sm font-semibold text-primary hover:underline">
              Browse more →
            </Link>
          </div>

          {!!error && (
            <div className="mb-6 rounded-lg bg-danger-bg px-4 py-3 text-sm font-medium text-danger">{error}</div>
          )}

          {loading ? (
            <p className="py-16 text-center text-sm text-muted">Loading your saved properties…</p>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface py-16 text-center">
              <p className="text-3xl">♡</p>
              <p className="mt-3 text-sm font-semibold text-foreground">No saved properties yet</p>
              <p className="mt-1 text-sm text-muted">Tap the heart icon on any listing to save it here.</p>
              <Link
                href="/properties"
                className="mt-5 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                Explore properties
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((property) => (
                <div key={property.id} className="relative">
                  <PropertyCard property={property} />
                  <button
                    onClick={() => handleRemove(property.id)}
                    disabled={removingId === property.id}
                    className="absolute right-3 top-3 z-10 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-danger disabled:opacity-50"
                  >
                    {removingId === property.id ? 'Removing…' : '♥ Saved'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
