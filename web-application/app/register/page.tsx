'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/AuthLayout';
import { register, ApiError } from '@/lib/auth-api';
import type { Role } from '@/lib/types';

const ROLES: { value: Role; label: string }[] = [
  { value: 'buyer', label: 'Buyer' },
  { value: 'owner', label: 'Owner' },
  { value: 'tenant', label: 'Tenant' },
  { value: 'landlord', label: 'Landlord' },
  { value: 'builder', label: 'Builder' },
  { value: 'agent', label: 'Agent' },
  { value: 'interior_designer', label: 'Interior Designer' },
  { value: 'loan_partner', label: 'Loan Partner' },
  { value: 'legal_consultant', label: 'Legal Consultant' },
  { value: 'property_manager', label: 'Property Manager' },
  { value: 'rental_manager', label: 'Rental Manager' },
  { value: 'packers_movers', label: 'Packers & Movers' },
  { value: 'govt_registration_partner', label: 'Govt. Registration Partner' },
];

const inputClass =
  'w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none';
const labelClass = 'mb-1.5 block text-sm font-semibold text-foreground';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [role, setRole] = useState<Role>('buyer');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    try {
      const user = await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        password_confirmation: passwordConfirmation,
        role,
      });
      router.push(`/verify-otp?phone=${encodeURIComponent(user.phone)}`);
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        const mapped: Record<string, string> = {};
        for (const [field, messages] of Object.entries(err.errors)) mapped[field] = messages[0];
        setFieldErrors(mapped);
        setError('Please fix the highlighted fields.');
      } else {
        setError(err instanceof ApiError ? err.message : 'Could not create your account.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Join Kavuri Estates to buy, rent, sell, or offer services." image="estate-09.jpg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {!!error && <div className="rounded-lg bg-danger-bg px-4 py-3 text-sm font-medium text-danger">{error}</div>}

        <div>
          <label className={labelClass}>Full name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} placeholder="Priya Sharma" />
          {!!fieldErrors.name && <p className="mt-1 text-xs text-danger">{fieldErrors.name}</p>}
        </div>

        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClass}
            placeholder="you@example.com"
          />
          {!!fieldErrors.email && <p className="mt-1 text-xs text-danger">{fieldErrors.email}</p>}
        </div>

        <div>
          <label className={labelClass}>Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className={inputClass}
            placeholder="+919876543210"
          />
          {!!fieldErrors.phone && <p className="mt-1 text-xs text-danger">{fieldErrors.phone}</p>}
        </div>

        <div>
          <label className={labelClass}>I am a…</label>
          <select value={role} onChange={(e) => setRole(e.target.value as Role)} className={inputClass}>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={inputClass}
            placeholder="At least 8 characters"
          />
          {!!fieldErrors.password && <p className="mt-1 text-xs text-danger">{fieldErrors.password}</p>}
        </div>

        <div>
          <label className={labelClass}>Confirm password</label>
          <input
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <p className="text-center text-sm text-muted">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
