import type { Metadata } from 'next';
import { getSubscriptionPlans } from '@/lib/api';
import { SubscribeEligibility } from '@/components/SubscribeEligibility';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Subscription plans for owners, agents, and builders on Kavuri Estates.',
};

function formatPrice(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`;
}

export default async function PricingPage() {
  const plans = await getSubscriptionPlans();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Go Premium</p>
        <h1 className="mt-3 text-3xl font-extrabold text-foreground sm:text-4xl">Plans built for how you sell</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">
          Owners, agents, and builders each get tools matched to how they actually work.
        </p>
      </div>

      {plans.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted">No plans are available right now.</p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.id} className="flex flex-col rounded-2xl border border-border bg-surface p-6">
              <span className="w-fit rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">
                {plan.target_role.replace(/_/g, ' ')}
              </span>
              <h2 className="mt-3 text-lg font-bold text-foreground">{plan.name}</h2>
              <div className="mt-2">
                <span className="text-3xl font-extrabold text-foreground">{formatPrice(plan.price)}</span>
                <span className="text-sm text-muted"> / {plan.duration_days} days</span>
              </div>

              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="mt-0.5 text-success">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <SubscribeEligibility planId={plan.id} targetRole={plan.target_role} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
