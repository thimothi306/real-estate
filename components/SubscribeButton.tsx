'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { authPost, ApiError } from '@/lib/auth-api';

export function SubscribeButton({ planId, eligible }: { planId: number; eligible: boolean }) {
  const { user, token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Creates a Razorpay order server-side; checkout itself isn't wired
      // into the web app yet, so a successful call still can't complete a
      // real payment until keys are configured — but the request/response
      // contract is real, not mocked.
      await authPost(`/subscription-plans/${planId}/subscribe`, token!);
      setMessage('Order created. Checkout is not yet available on the web — try the mobile app.');
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Could not start checkout.');
    } finally {
      setLoading(false);
    }
  }

  if (!eligible) {
    return (
      <button
        disabled
        className="w-full rounded-lg border border-border py-2.5 text-sm font-semibold text-faint"
        title="This plan is for a different account type"
      >
        Not available for your account
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
      >
        {loading ? 'Starting…' : user ? 'Subscribe' : 'Log in to subscribe'}
      </button>
      {!!message && <p className="mt-2 text-xs text-muted">{message}</p>}
    </div>
  );
}
