'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const ROLE_LABELS: Record<string, string> = {
  buyer: 'Buyer',
  owner: 'Owner',
  tenant: 'Tenant',
  landlord: 'Landlord',
  builder: 'Builder',
  agent: 'Agent',
  interior_designer: 'Interior Designer',
  loan_partner: 'Loan Partner',
  legal_consultant: 'Legal Consultant',
  property_manager: 'Property Manager',
  rental_manager: 'Rental Manager',
  packers_movers: 'Packers & Movers',
  govt_registration_partner: 'Govt. Registration Partner',
  admin: 'Admin',
};

export default function AccountPage() {
  const { user, initialising, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initialising && !user) router.replace('/login');
  }, [initialising, user, router]);

  if (initialising || !user) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted">Loading your account…</div>;
  }

  async function handleSignOut() {
    await signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
          <p className="text-sm text-muted">{ROLE_LABELS[user.role] ?? user.role}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 rounded-xl border border-border bg-surface p-6 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Email</p>
          <p className="mt-1 text-sm text-foreground">{user.email}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Phone</p>
          <p className="mt-1 text-sm text-foreground">{user.phone}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">City</p>
          <p className="mt-1 text-sm text-foreground">{user.city ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Account status</p>
          <p className="mt-1 text-sm capitalize text-foreground">{user.status}</p>
        </div>
      </div>

      <p className="mt-6 text-sm text-muted">
        Full listing management, bookings, and messaging live in the Kavuri Estates mobile app for now — this web
        account gives you browsing, favorites, and identity across devices.
      </p>

      <button
        onClick={handleSignOut}
        className="mt-8 rounded-lg border border-danger px-5 py-2.5 text-sm font-semibold text-danger hover:bg-danger-bg"
      >
        Log out
      </button>
    </div>
  );
}
