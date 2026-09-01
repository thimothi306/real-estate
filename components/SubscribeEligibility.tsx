'use client';

import { useAuth } from '@/lib/auth-context';
import { SubscribeButton } from './SubscribeButton';

/** Resolves plan eligibility against the signed-in user's role — that's only known client-side. */
export function SubscribeEligibility({ planId, targetRole }: { planId: number; targetRole: string }) {
  const { user, initialising } = useAuth();

  if (initialising) {
    return <div className="h-10 w-full animate-pulse rounded-lg bg-surface-alt" />;
  }

  const eligible = !user || user.role === targetRole;

  return <SubscribeButton planId={planId} eligible={eligible} />;
}
