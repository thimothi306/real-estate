'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export function AuthNav() {
  const { user, initialising, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  if (initialising) {
    return <div className="h-9 w-20 animate-pulse rounded-full bg-border/60" />;
  }

  if (!user) {
    return (
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href="/login"
          className="shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold text-foreground hover:bg-background"
        >
          Log in
        </Link>
        <Link
          href="/register"
          className="shrink-0 whitespace-nowrap rounded-full bg-gold px-4 py-2 text-sm font-bold text-white hover:bg-gold-deep"
        >
          Sign up
        </Link>
      </div>
    );
  }

  async function handleSignOut() {
    setOpen(false);
    await signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground hover:border-primary"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
          {user.name.charAt(0).toUpperCase()}
        </span>
        {user.name.split(' ')[0]}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
            <Link
              href="/dashboard"
              className="block px-4 py-2.5 text-sm text-foreground hover:bg-background"
              onClick={() => setOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/account"
              className="block px-4 py-2.5 text-sm text-foreground hover:bg-background"
              onClick={() => setOpen(false)}
            >
              My account
            </Link>
            <button
              onClick={handleSignOut}
              className="block w-full px-4 py-2.5 text-left text-sm text-danger hover:bg-danger-bg"
            >
              Log out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
