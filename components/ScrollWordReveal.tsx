'use client';

import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { useRef } from 'react';

/**
 * Splits text into words and fades/brightens each one in as the section
 * scrolls through the viewport — each word's opacity is tied to scroll
 * progress, not a timer, so it reads as "the page responding to you."
 */
export function ScrollWordReveal({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'start 0.15'] });
  const words = text.split(' ');

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {word}
        </Word>
      ))}
    </p>
  );
}

function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.12, 1]);

  return (
    <motion.span style={{ opacity }} className="mr-[0.3em] inline-block">
      {children}
    </motion.span>
  );
}
