'use client';

import { motion } from 'framer-motion';

const OFFSETS = {
  up: { y: 28, x: 0 },
  left: { y: 0, x: -60 },
  right: { y: 0, x: 60 },
};

export function Reveal({
  children,
  delay = 0,
  direction = 'up',
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'left' | 'right';
}) {
  const offset = OFFSETS[direction];

  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
