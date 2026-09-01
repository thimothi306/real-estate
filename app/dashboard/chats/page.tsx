'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { authGet, ApiError } from '@/lib/auth-api';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import type { Conversation } from '@/lib/types';

function relativeTime(iso: string | null): string {
  if (!iso) return '';
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function ChatsListPage() {
  const { user, token, initialising } = useAuth();
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      setConversations(await authGet<Conversation[]>('/conversations', token));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load your messages.');
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
      <DashboardSidebar counts={{ Messages: conversations.reduce((sum, c) => sum + c.unread_count, 0) }} />

      <div className="min-w-0 flex-1 bg-background">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <h1 className="text-2xl font-extrabold text-foreground">Messages</h1>
          <p className="mt-1 text-sm text-muted">Conversations with property owners.</p>

          {!!error && (
            <div className="mt-6 rounded-lg bg-danger-bg px-4 py-3 text-sm font-medium text-danger">{error}</div>
          )}

          {loading ? (
            <p className="py-16 text-center text-sm text-muted">Loading…</p>
          ) : conversations.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-border bg-surface py-16 text-center">
              <p className="text-3xl">💬</p>
              <p className="mt-3 text-sm font-semibold text-foreground">No conversations yet</p>
              <p className="mt-1 text-sm text-muted">Tap Contact Owner on any listing to start a chat.</p>
              <Link
                href="/properties"
                className="mt-5 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                Browse properties
              </Link>
            </div>
          ) : (
            <div className="mt-6 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
              {conversations.map((c) => (
                <Link
                  key={c.id}
                  href={`/dashboard/chats/${c.id}`}
                  className="flex items-center gap-3 p-4 transition hover:bg-background"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">
                    {c.counterpart?.name?.charAt(0).toUpperCase() ?? '?'}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-bold text-foreground">
                        {c.counterpart?.name ?? 'Owner'}
                      </span>
                      <span className="shrink-0 text-xs text-faint">{relativeTime(c.last_message_at)}</span>
                    </div>
                    <p className="truncate text-xs text-muted">{c.property?.title}</p>
                    <p className={`truncate text-xs ${c.unread_count > 0 ? 'font-semibold text-foreground' : 'text-muted'}`}>
                      {c.last_message ?? 'Say hello…'}
                    </p>
                  </div>

                  {c.unread_count > 0 && (
                    <span className="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-gold px-1.5 text-[11px] font-bold text-navy">
                      {c.unread_count}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
