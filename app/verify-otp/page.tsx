'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/AuthLayout';
import { verifyRegistrationOtp, sendOtp, ApiError } from '@/lib/auth-api';
import { useAuth } from '@/lib/auth-context';

function VerifyOtpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { setSession } = useAuth();
  const phone = params.get('phone') ?? '';

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await verifyRegistrationOtp(phone, code.trim());
      setSession(result.user, result.token);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not verify that code.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError(null);
    setNotice(null);
    try {
      await sendOtp(phone, 'registration');
      setNotice('A new code has been sent.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not resend the code.');
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthLayout title="Verify your phone" subtitle={`Enter the code sent to ${phone || 'your phone'}.`} image="estate-10.jpg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {!!error && <div className="rounded-lg bg-danger-bg px-4 py-3 text-sm font-medium text-danger">{error}</div>}
        {!!notice && <div className="rounded-lg bg-success-bg px-4 py-3 text-sm font-medium text-success">{notice}</div>}

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-foreground">Verification code</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            inputMode="numeric"
            maxLength={6}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-center text-lg font-semibold tracking-[0.5em] text-foreground focus:border-primary focus:outline-none"
            placeholder="------"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
        >
          {loading ? 'Verifying…' : 'Verify and continue'}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="w-full text-center text-sm font-semibold text-primary hover:underline disabled:opacity-60"
        >
          {resending ? 'Resending…' : "Didn't get a code? Resend"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={null}>
      <VerifyOtpForm />
    </Suspense>
  );
}
