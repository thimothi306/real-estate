'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { authGet, authPatch, ApiError } from '@/lib/auth-api';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import type { Visit } from '@/lib/types';

const STATUS_STYLE: Record<Visit['status'], string> = {
  pending: 'bg-warning-bg text-warning',
  confirmed: 'bg-success-bg text-success',
  completed: 'bg-surface-alt text-muted',
  cancelled: 'bg-danger-bg text-danger',
  no_show: 'bg-danger-bg text-danger',
};

export default function VisitRequestsPage() {
  const { user, token, initialising } = useAuth();
  const router = useRouter();

  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      const result = await authGet<Visit[]>('/my/visits', token);
      setVisits(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load your visit requests.');
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

  async function cancelVisit(visit: Visit) {
    if (!token) return;
    if (!window.confirm('Cancel this visit? The owner will be notified.')) return;

    setBusyId(visit.id);
    try {
      await authPatch(`/visits/${visit.id}/status`, token, { status: 'cancelled' });
      setVisits((current) => current.map((v) => (v.id === visit.id ? { ...v, status: 'cancelled' } : v)));
    } catch {
      setError('Could not cancel that visit. Try again.');
    } finally {
      setBusyId(null);
    }
  }

  if (initialising || !user) {
    return <div className="px-4 py-24 text-center text-muted">Loading…</div>;
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />

      <div className="min-w-0 flex-1 bg-background">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <h1 className="text-2xl font-extrabold text-foreground">Visit Requests</h1>
          <p className="mt-1 text-sm text-muted">Site visits you've scheduled with property owners.</p>

          {!!error && (
            <div className="mt-6 rounded-lg bg-danger-bg px-4 py-3 text-sm font-medium text-danger">{error}</div>
          )}

          {loading ? (
            <p className="py-16 text-center text-sm text-muted">Loading…</p>
          ) : visits.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-border bg-surface py-16 text-center">
              <p className="text-3xl">📅</p>
              <p className="mt-3 text-sm font-semibold text-foreground">No visit requests yet</p>
              <p className="mt-1 text-sm text-muted">Schedule a visit from any property's page.</p>
              <Link
                href="/properties"
                className="mt-5 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                Browse properties
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {visits.map((visit) => {
                const when = new Date(visit.scheduled_at);
                const upcoming = when.getTime() > Date.now();
                const canCancel = upcoming && (visit.status === 'pending' || visit.status === 'confirmed');

                return (
                  <div key={visit.id} className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
                    <div className="flex w-14 shrink-0 flex-col items-center rounded-lg bg-primary-soft py-2">
                      <span className="text-lg font-extrabold text-primary">{when.getDate()}</span>
                      <span className="text-[10px] font-bold uppercase text-primary">
                        {when.toLocaleDateString('en-IN', { month: 'short' })}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {visit.property ? (
                          <Link
                            href={`/properties/${visit.property.slug}`}
                            className="truncate text-sm font-bold text-foreground hover:text-primary"
                          >
                            {visit.property.title}
                          </Link>
                        ) : (
                          <span className="text-sm font-bold text-foreground">Property</span>
                        )}
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ${STATUS_STYLE[visit.status]}`}>
                          {visit.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs font-semibold text-muted">
                        {when.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} ·{' '}
                        {when.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
                      </p>
                      {!!visit.note && <p className="mt-1 text-xs italic text-muted">"{visit.note}"</p>}
                    </div>

                    {canCancel && (
                      <button
                        onClick={() => cancelVisit(visit)}
                        disabled={busyId === visit.id}
                        className="shrink-0 text-xs font-semibold text-danger hover:underline disabled:opacity-50"
                      >
                        {busyId === visit.id ? 'Cancelling…' : 'Cancel'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
