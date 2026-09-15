'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { authGet, authPost, ApiError } from '@/lib/auth-api';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { formatPrice, titleCase } from '@/lib/format';
import type { ServiceRequestSummary } from '@/lib/types';

function QuoteForm({ requestId, onSubmitted }: { requestId: number; onSubmitted: () => void }) {
  const { token } = useAuth();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !amount) return;
    setSaving(true);
    setError(null);
    try {
      await authPost(`/service-requests/${requestId}/quotes`, token, {
        amount: Number(amount),
        message: message.trim() || undefined,
      });
      onSubmitted();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit your quote.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2 border-t border-border pt-3">
      {!!error && <p className="text-xs font-medium text-danger">{error}</p>}
      <div className="flex gap-2">
        <input
          type="number"
          min={0}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          placeholder="Your price (₹)"
          className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
        />
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={1000}
          placeholder="Message (optional)"
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          disabled={saving || !amount}
          className="shrink-0 rounded-full bg-gold px-4 py-2 text-xs font-bold text-white shadow-[var(--shadow-gold)] hover:bg-gold-deep disabled:opacity-50"
        >
          {saving ? 'Sending…' : "I'm available"}
        </button>
      </div>
    </form>
  );
}

export default function ProviderQueuePage() {
  const { user, token, initialising } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<ServiceRequestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openFormId, setOpenFormId] = useState<number | null>(null);
  const [quotedIds, setQuotedIds] = useState<number[]>([]);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      const result = await authGet<ServiceRequestSummary[]>('/my/service-queue', token);
      setItems(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load your request queue.');
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
      <DashboardSidebar counts={{ 'Open Requests': items.length }} />

      <div className="min-w-0 flex-1 bg-background">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">Open Requests Near You</h1>
              <p className="mt-1 text-sm text-muted">Requests in the categories you serve — tap "I'm available" to quote.</p>
            </div>
            <Link href="/dashboard/provider" className="text-sm font-semibold text-primary hover:underline">
              Edit my profile →
            </Link>
          </div>

          {!!error && (
            <div className="mb-6 rounded-lg bg-danger-bg px-4 py-3 text-sm font-medium text-danger">{error}</div>
          )}

          {loading ? (
            <p className="py-16 text-center text-sm text-muted">Loading…</p>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface py-16 text-center">
              <p className="text-3xl">📭</p>
              <p className="mt-3 text-sm font-semibold text-foreground">No open requests right now</p>
              <p className="mt-1 text-sm text-muted">Check back soon, or make sure your profile lists the right categories.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((request) => (
                <div key={request.id} className="card-lift p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground">{request.title}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {request.category?.name}
                        {request.budget_min && ` · Budget ${formatPrice(request.budget_min)}–${formatPrice(request.budget_max)}`}
                        {request.urgency && ` · ${titleCase(request.urgency)}`}
                      </p>
                      {request.location && <p className="mt-1 text-xs text-muted">📍 {request.location}</p>}
                    </div>
                    {!quotedIds.includes(request.id) && (
                      <button
                        onClick={() => setOpenFormId(openFormId === request.id ? null : request.id)}
                        className="shrink-0 rounded-full border border-primary px-4 py-2 text-xs font-bold text-primary hover:bg-primary hover:text-white"
                      >
                        I'm available
                      </button>
                    )}
                    {quotedIds.includes(request.id) && (
                      <span className="shrink-0 text-xs font-semibold text-success">✓ Quote sent</span>
                    )}
                  </div>

                  {openFormId === request.id && (
                    <QuoteForm
                      requestId={request.id}
                      onSubmitted={() => {
                        setQuotedIds((current) => [...current, request.id]);
                        setOpenFormId(null);
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
