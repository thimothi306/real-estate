import type { Metadata } from 'next';
import { getLoanOffers } from '@/lib/api';
import { EmiCalculator } from '@/components/EmiCalculator';

export const metadata: Metadata = {
  title: 'Home Loan',
  description: 'Compare home loan interest rates from leading lenders and calculate your EMI.',
};

function formatPrice(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2).replace(/\.?0+$/, '')} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2).replace(/\.?0+$/, '')} L`;
  return `₹${value.toLocaleString('en-IN')}`;
}

export default async function HomeLoanPage() {
  const offers = await getLoanOffers();
  const lowestRate = offers.length ? Math.min(...offers.map((o) => o.interest_rate_from)) : 8.5;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="rounded-2xl bg-navy p-8 text-center sm:p-10">
        <p className="text-xs font-bold uppercase tracking-widest text-gold">Home Loans</p>
        <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
          Your dream home is closer than you think
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-white/65">
          Compare real rates from {offers.length} lenders — starting from {lowestRate}% p.a.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <h2 className="text-lg font-bold text-foreground">Recommended for you</h2>

          {offers.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Loan offers aren't available right now.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-lg font-extrabold text-primary">
                    {offer.lender_name.charAt(0)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-foreground">{offer.lender_name}</p>
                    <p className="text-sm font-semibold text-success">{offer.interest_rate_from}% p.a.</p>
                    <p className="text-xs text-muted">
                      Up to {formatPrice(offer.max_amount)} · {offer.max_tenure_years} yr tenure
                    </p>
                    {!!offer.highlight && <p className="mt-0.5 text-xs font-semibold text-gold-dark">{offer.highlight}</p>}
                  </div>

                  {offer.apply_url ? (
                    <a
                      href={offer.apply_url}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary-soft"
                    >
                      Apply Now
                    </a>
                  ) : (
                    <span className="shrink-0 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-faint">
                      Coming soon
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          <p className="mt-6 text-xs leading-relaxed text-faint">
            Rates shown are indicative starting rates published by each lender and may vary based on your
            credit profile, income, and the property being financed.
          </p>
        </div>

        <div>
          <EmiCalculator defaultRate={lowestRate} />
        </div>
      </div>
    </div>
  );
}
