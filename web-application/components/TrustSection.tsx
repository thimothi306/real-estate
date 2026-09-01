'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const PILLARS = [
  {
    step: '01',
    icon: '🛡',
    title: 'Verified, always',
    body: 'Document, owner, GPS, and government-record checks before a listing ever goes live.',
  },
  {
    step: '02',
    icon: '🛠',
    title: 'Nine services, one place',
    body: 'Interior design, legal, loans, packers & movers — booked from the same app as the listing.',
  },
  {
    step: '03',
    icon: '🤝',
    title: 'Direct to owner',
    body: 'Talk to owners, builders, and agents directly — no anonymous middlemen.',
  },
];

/**
 * Replaces the earlier iris-wipe, which clipped its own heading against the
 * content behind it and left both half-readable mid-scroll. Here the heading
 * is sticky and fully opaque; only the pillars move, so every word stays
 * legible at any scroll position.
 */
export function TrustSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const glowY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);

  return (
    <section ref={ref} className="relative overflow-hidden bg-navy py-24">
      <motion.div
        aria-hidden
        style={{ y: glowY }}
        className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-gold/10 blur-3xl"
      />
      <motion.div
        aria-hidden
        style={{ y: glowY }}
        className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-primary/20 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-gold">Why Kavuri Estates</span>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight text-white sm:text-5xl">
            Built for trust,
            <br />
            not just listings.
          </h2>
          <p className="mt-5 max-w-sm text-base leading-relaxed text-white/60">
            Most portals stop at showing you a photo and a phone number. We verify the property, the
            owner, and the paperwork — then stay with you through the deal.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          {PILLARS.map((pillar, i) => (
            <motion.article
              key={pillar.step}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="flex gap-5 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition hover:border-gold/40 hover:bg-white/[0.07]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-xl">
                {pillar.icon}
              </div>
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-xs font-bold tracking-widest text-gold">{pillar.step}</span>
                  <h3 className="text-lg font-bold text-white">{pillar.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{pillar.body}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
