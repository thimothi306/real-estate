'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

type Stat = { icon: string; value: number; suffix: string; decimals?: number; label: string };

/**
 * Counts each stat up once when the bar scrolls into view. Reduced-motion
 * users get the final number immediately instead of an animation.
 */
function Counter({ stat }: { stat: Stat }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setDisplay(stat.value);
      return;
    }

    const duration = 1400;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      // easeOutCubic keeps the last digits from crawling
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(stat.value * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, stat.value]);

  return (
    <span ref={ref} className="tabular-nums">
      {stat.decimals ? display.toFixed(stat.decimals) : Math.round(display).toLocaleString('en-IN')}
      {stat.suffix}
    </span>
  );
}

export function StatsBar({ propertyCount, cityCount }: { propertyCount: number; cityCount: number }) {
  const stats: Stat[] = [
    { icon: '🛡', value: propertyCount, suffix: '+', label: 'Verified Properties' },
    { icon: '👥', value: 7200, suffix: '+', label: 'Happy Customers' },
    { icon: '✓', value: 98, suffix: '%', label: 'Verified Listings' },
    { icon: '🏙', value: cityCount, suffix: '+', label: 'Cities Covered' },
    { icon: '⭐', value: 4.8, suffix: '/5', decimals: 1, label: 'User Rating' },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4">
      <div className="relative overflow-hidden rounded-2xl bg-navy shadow-[var(--shadow-navy)]">
        <span className="orb -right-16 -top-24 h-64 w-64 bg-gold/25" aria-hidden />
        <span className="orb -left-20 bottom-0 h-56 w-56 bg-primary/25" aria-hidden />

        <div className="relative grid grid-cols-2 gap-y-8 px-6 py-10 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            className={`flex flex-col items-center gap-1.5 text-center ${
              i > 0 ? 'lg:border-l lg:border-white/10' : ''
            }`}
          >
            <span className="text-xl text-gold">{stat.icon}</span>
            <span className="text-2xl font-extrabold text-white sm:text-3xl">
              <Counter stat={stat} />
            </span>
            <span className="text-xs font-medium text-white/55">{stat.label}</span>
          </motion.div>
        ))}
        </div>
      </div>
    </section>
  );
}
