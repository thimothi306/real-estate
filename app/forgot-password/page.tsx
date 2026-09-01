'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/AuthLayout';
import { forgotPassword, resetPassword, ApiError } from '@/lib/auth-api';

function ForgotPasswordForm() {
  const router = useRouter();

  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await forgotPassword(phone.trim());
      setStep('reset');
      setNotice('A verification code has been sent to your phone.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send a reset code.');
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await resetPassword(phone.trim(), code.trim(), password);
      router.push('/login');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reset your password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title={step === 'request' ? 'Reset your password' : 'Enter the code'}
      subtitle={
        step === 'request'
          ? "We'll send a verification code to your registered phone number."
          : `Enter the code sent to ${phone} and choose a new password.`
      }
      image="estate-06.jpg"
    >
      {step === 'request' ? (
        <form onSubmit={handleRequest} className="space-y-4">
          {!!error && <div className="rounded-lg bg-danger-bg px-4 py-3 text-sm font-medium text-danger">{error}</div>}

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">Phone number</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+919876543210"
              className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
          >
            {loading ? 'Sending…' : 'Send reset code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
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

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">New password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
          >
            {loading ? 'Resetting…' : 'Reset password'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
