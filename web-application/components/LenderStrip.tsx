import { getLoanOffers } from '@/lib/api';

/**
 * Lists the lenders whose published rates we compare. Rendered as names, not
 * logos — we surface their public rates, which is not the same as a branding
 * partnership, and the copy says exactly that.
 */
export async function LenderStrip() {
  const offers = await getLoanOffers();

  if (offers.length === 0) return null;

  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-4 px-4 py-6">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          Compare home loans from
        </span>

        {offers.slice(0, 6).map((offer) => (
          <div key={offer.id} className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-foreground">{offer.lender_name}</span>
            <span className="text-xs font-semibold text-success">{offer.interest_rate_from}%</span>
          </div>
        ))}

        <a href="/home-loan" className="ml-auto text-sm font-semibold text-primary hover:underline">
          Compare all →
        </a>
      </div>
    </section>
  );
}
