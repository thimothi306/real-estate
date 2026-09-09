import Link from 'next/link';

export function FinalCta() {
  return (
    <div className="relative overflow-hidden bg-foreground px-4 py-24 text-center">
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto max-w-2xl">
        <h2 className="text-3xl font-extrabold text-white sm:text-5xl">Ready to find your place?</h2>
        <p className="mx-auto mt-4 max-w-lg text-white/60">
          Verified listings, direct owner contact, and every service you need — free to browse, free to post.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="rounded-full bg-gold px-8 py-3.5 text-sm font-bold text-white shadow-[var(--shadow-gold)] transition hover:-translate-y-0.5 hover:bg-gold-deep"
          >
            Create free account
          </Link>
          <Link
            href="/properties"
            className="rounded-full border border-white/20 px-8 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
          >
            Browse listings
          </Link>
        </div>
      </div>
    </div>
  );
}
