'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { authGet, authPost, ApiError } from '@/lib/auth-api';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { formatPrice, titleCase } from '@/lib/format';
import type { ServiceRequestDetail } from '@/lib/types';

export default function ServiceRequestDetailPage() {
  const { user, token, initialising } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [request, setRequest] = useState<ServiceRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyQuoteId, setBusyQuoteId] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      const result = await authGet<ServiceRequestDetail>(`/service-requests/${params.id}`, token);
      setRequest(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load this request.');
    } finally {
      setLoading(false);
    }
  }, [token, params.id]);

  useEffect(() => {
    if (!initialising && !user) router.replace('/login');
  }, [initialising, user, router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleAccept(quoteId: number) {
    if (!token) return;
    setBusyQuoteId(quoteId);
    try {
      await authPost(`/quotes/${quoteId}/accept`, token);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not accept that quote.');
    } finally {
      setBusyQuoteId(null);
    }
  }

  async function handleReview(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !request) return;
    try {
      await authPost(`/service-requests/${request.id}/review`, token, { rating, comment: comment.trim() || undefined });
      setReviewSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit your review.');
    }
  }

  if (initialising || !user) {
    return <div className="px-4 py-24 text-center text-muted">Loading…</div>;
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar counts={{}} />

      <div className="min-w-0 flex-1 bg-background">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <Link href="/dashboard/service-requests" className="text-sm font-semibold text-primary hover:underline">
            ← My service requests
          </Link>

          {!!error && (
            <div className="mt-4 rounded-lg bg-danger-bg px-4 py-3 text-sm font-medium text-danger">{error}</div>
          )}

          {loading || !request ? (
            <p className="py-16 text-center text-sm text-muted">Loading…</p>
          ) : (
            <div className="mt-4 space-y-6">
              <div className="card-lift p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h1 className="text-xl font-extrabold text-foreground">{request.title}</h1>
                    <p className="mt-1 text-sm text-muted">{request.category?.name}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    {titleCase(request.status)}
                  </span>
                </div>

                {request.description && <p className="mt-4 text-sm text-muted">{request.description}</p>}

                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
                  {request.budget_min && <span>Budget: {formatPrice(request.budget_min)}–{formatPrice(request.budget_max)}</span>}
                  {request.urgency && <span>Urgency: {titleCase(request.urgency)}</span>}
                  {request.location && <span>📍 {request.location}</span>}
                </div>

                {request.assigned_partner && (
                  <div className="mt-4 rounded-lg bg-success-bg px-4 py-3 text-sm text-success">
                    Assigned to <strong>{request.assigned_partner.name}</strong> — {request.assigned_partner.phone}
                  </div>
                )}
              </div>

              {request.status === 'open' || request.status === 'quoted' ? (
                <div className="card-lift p-6">
                  <h2 className="text-sm font-bold text-foreground">Quotes received</h2>
                  {(request.quotes ?? []).length === 0 ? (
                    <p className="mt-3 text-sm text-muted">No quotes yet — verified partners will start responding shortly.</p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {(request.quotes ?? []).map((quote) => (
                        <div key={quote.id} className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-foreground">{quote.partner?.name}</p>
                            <p className="mt-0.5 text-sm font-semibold text-primary">{formatPrice(quote.amount)}</p>
                            {quote.message && <p className="mt-1 text-xs text-muted">{quote.message}</p>}
                          </div>
                          {quote.status === 'pending' ? (
                            <button
                              onClick={() => handleAccept(quote.id)}
                              disabled={busyQuoteId === quote.id}
                              className="shrink-0 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-dark disabled:opacity-50"
                            >
                              {busyQuoteId === quote.id ? 'Accepting…' : 'Accept'}
                            </button>
                          ) : (
                            <span className="shrink-0 text-xs font-semibold capitalize text-muted">{quote.status}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              {request.status === 'completed' && (
                <div className="card-lift p-6">
                  <h2 className="text-sm font-bold text-foreground">Rate this professional</h2>
                  {reviewSubmitted ? (
                    <p className="mt-3 text-sm font-semibold text-success">✓ Thanks — your review has been posted.</p>
                  ) : (
                    <form onSubmit={handleReview} className="mt-4 space-y-3">
                      <div className="flex gap-1 text-2xl">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setRating(n)}
                            className={n <= rating ? 'text-gold' : 'text-border'}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                        maxLength={1000}
                        placeholder="How was the work? (optional)"
                        className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
                      >
                        Submit review
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
