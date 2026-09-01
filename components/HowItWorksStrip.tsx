'use client';

import { motion } from 'framer-motion';

const STEPS = [
  { n: '1', icon: '🔍', title: 'Search', body: 'Find properties that match your lifestyle' },
  { n: '2', icon: '🛡', title: 'Verify', body: 'We verify every property for your safety' },
  { n: '3', icon: '📅', title: 'Visit', body: 'Schedule visits and explore properties' },
  { n: '4', icon: '🤝', title: 'Deal', body: 'Close the deal with complete transparency' },
  { n: '5', icon: '🎧', title: 'Support', body: 'Get support even after the deal' },
];

export function HowItWorksStrip() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center">
        <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">How Kavuri Estates Works</h2>
        <span className="mx-auto mt-3 block h-1 w-14 rounded-full bg-gold" />
      </div>

      <ol className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3 lg:grid-cols-5">
        {STEPS.map((step, i) => (
          <motion.li
            key={step.n}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex flex-col items-center text-center"
          >
            {/* Connector line — decorative, hidden on the last item and on small screens */}
            {i < STEPS.length - 1 && (
              <span
                aria-hidden
                className="absolute left-1/2 top-9 hidden h-px w-full border-t border-dashed border-border lg:block"
              />
            )}

            <span className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full border border-border bg-surface text-2xl shadow-sm">
              {step.icon}
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-navy text-[11px] font-bold text-white">
                {step.n}
              </span>
            </span>

            <h3 className="mt-4 text-base font-bold text-foreground">{step.title}</h3>
            <p className="mt-1.5 max-w-[190px] text-xs leading-relaxed text-muted">{step.body}</p>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
