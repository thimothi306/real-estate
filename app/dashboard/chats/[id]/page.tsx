'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { authGet, authPost, ApiError } from '@/lib/auth-api';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import type { Conversation, Message } from '@/lib/types';

function formatPrice(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2).replace(/\.?0+$/, '')} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2).replace(/\.?0+$/, '')} L`;
  return `₹${value.toLocaleString('en-IN')}`;
}

export default function ChatThreadPage() {
  const { user, token, initialising } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const conversationId = params.id;

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      const data = await authGet<Conversation>(`/conversations/${conversationId}`, token);
      setConversation(data);
      setMessages(data.messages ?? []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not open this conversation.');
    } finally {
      setLoading(false);
    }
  }, [token, conversationId]);

  useEffect(() => {
    if (!initialising && !user) router.replace('/login');
  }, [initialising, user, router]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  async function handleSend() {
    const body = draft.trim();
    if (!body || !token || sending) return;

    setSending(true);
    setError(null);
    try {
      const message = await authPost<Message>(`/conversations/${conversationId}/messages`, token, { body });
      setMessages((current) => [...current, message]);
      setDraft('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Message could not be sent.');
    } finally {
      setSending(false);
    }
  }

  if (initialising || !user) {
    return <div className="px-4 py-24 text-center text-muted">Loading…</div>;
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />

      <div className="flex min-w-0 flex-1 flex-col bg-background">
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8">
          <Link href="/dashboard/chats" className="mb-4 text-sm font-semibold text-primary hover:underline">
            ← All conversations
          </Link>

          {loading ? (
            <p className="py-16 text-center text-sm text-muted">Loading…</p>
          ) : !conversation ? (
            <div className="rounded-lg bg-danger-bg px-4 py-3 text-sm font-medium text-danger">
              {error ?? 'Conversation not found.'}
            </div>
          ) : (
            <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-surface">
              {!!conversation.property && (
                <Link
                  href={`/properties/${conversation.property.slug}`}
                  className="flex items-center gap-3 border-b border-border p-4 transition hover:bg-background"
                >
                  {conversation.property.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={conversation.property.cover_image}
                      alt=""
                      className="h-11 w-11 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-surface-alt text-lg">
                      🏠
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-foreground">{conversation.property.title}</p>
                    <p className="text-xs font-semibold text-muted">{formatPrice(conversation.property.price)}</p>
                  </div>
                  <span className="text-muted">›</span>
                </Link>
              )}

              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted">No messages yet — say hello.</p>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className={`flex ${message.is_mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                          message.is_mine
                            ? 'rounded-br-sm bg-primary text-white'
                            : 'rounded-bl-sm border border-border bg-background text-foreground'
                        }`}
                      >
                        {message.body}
                        <div className={`mt-1 text-[10px] ${message.is_mine ? 'text-white/70' : 'text-faint'}`}>
                          {new Date(message.created_at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {!!error && (
                <div className="mx-4 mb-2 rounded-lg bg-danger-bg px-3 py-2 text-xs font-medium text-danger">
                  {error}
                </div>
              )}

              <div className="flex items-end gap-2 border-t border-border p-3">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                  placeholder="Type a message…"
                  rows={1}
                  maxLength={2000}
                  className="max-h-28 flex-1 resize-none rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-faint focus:border-primary focus:outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!draft.trim() || sending}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary-dark disabled:opacity-40"
                >
                  ➤
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
