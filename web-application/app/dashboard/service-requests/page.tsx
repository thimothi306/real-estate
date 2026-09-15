'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { authGet, ApiError } from '@/lib/auth-api';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { formatPrice, titleCase } from '@/lib/format';
import type { ServiceRequestSummary } from '@/lib/types';

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-info-bg text-info',
  quoted: 'bg-warning-bg text-warning',
  accepted: 'bg-primary/10 text-primary',
  in_progress: 'bg-primary/10 text-primary',
  completed: 'bg-success-bg text-success',
  cancelled: 'bg-danger-bg text-danger',
};

export default function ServiceRequestsPage() {
  const { user, token, initialising } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<ServiceRequestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      const result = await authGet<ServiceRequestSummary[]>('/my/service-requests', token);
      setItems(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load your service requests.');
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

  if (initialising || !user) {
    return <div className="px-4 py-24 text-center text-muted">Loading…</div>;
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar counts={{ 'My Service Requests': items.length }} />

      <div className="min-w-0 flex-1 bg-background">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">My Service Requests</h1>
              <p className="mt-1 text-sm text-muted">Every request you've posted, and the quotes it received.</p>
            </div>
            <Link href="/services" className="text-sm font-semibold text-primary hover:underline">
              Post a new request →
            </Link>
          </div>

          {!!error && (
            <div className="mb-6 rounded-lg bg-danger-bg px-4 py-3 text-sm font-medium text-danger">{error}</div>
          )}

          {loading ? (
            <p className="py-16 text-center text-sm text-muted">Loading your requests…</p>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface py-16 text-center">
              <p className="text-3xl">🛠</p>
              <p className="mt-3 text-sm font-semibold text-foreground">No service requests yet</p>
              <p className="mt-1 text-sm text-muted">Need a plumber, electrician, or cleaner? Post a request.</p>
              <Link
                href="/services"
                className="mt-5 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                Post a service request
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((request) => (
                <Link
                  key={request.id}
                  href={`/dashboard/service-requests/${request.id}`}
                  className="card-lift flex items-center justify-between gap-4 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">{request.title}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {request.category?.name}
                      {request.budget_min && ` · ${formatPrice(request.budget_min)}–${formatPrice(request.budget_max)}`}
                      {!!request.quotes_count && ` · ${request.quotes_count} quote${request.quotes_count === 1 ? '' : 's'}`}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLES[request.status] ?? 'bg-background text-muted'}`}>
                    {titleCase(request.status)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
