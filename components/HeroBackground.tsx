'use client';

import { motion } from 'framer-motion';

/**
 * Ambient floating color washes behind the hero — built entirely from the
 * existing brand tokens (primary/success/warning), just at low opacity and
 * heavily blurred, rather than introducing new colors into the palette.
 */
export function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute -left-24 -top-24 h-96 w-96 rounded-full blur-3xl"
        style={{ background: 'var(--primary)', opacity: 0.16 }}
        animate={{ y: [0, 24, 0], x: [0, 16, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-16 top-10 h-80 w-80 rounded-full blur-3xl"
        style={{ background: 'var(--warning)', opacity: 0.14 }}
        animate={{ y: [0, -20, 0], x: [0, -12, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full blur-3xl"
        style={{ background: 'var(--success)', opacity: 0.12 }}
        animate={{ y: [0, 18, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />
    </div>
  );
}
