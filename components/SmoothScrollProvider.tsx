'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Inertia-based smooth scrolling, wired into GSAP so both run off one loop.
 *
 * Why the wiring matters: Lenis intercepts wheel input and drives scroll
 * itself, while ScrollTrigger listens for native scroll events and caches
 * element positions. Left independent, ScrollTrigger's idea of the scroll
 * position drifts from where Lenis actually is — and any pinned section
 * (see HowItWorks) never reaches the scroll offset that releases its pin,
 * which reads to the user as "the page stopped scrolling."
 *
 * The three lines below fix that: forward Lenis's scroll to ScrollTrigger,
 * drive Lenis from GSAP's ticker so there is a single RAF loop, and disable
 * lagSmoothing so a slow frame can't desync the two.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Honour the OS setting rather than forcing inertia on people who
    // asked for less motion; native scrolling still works fine.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });

    const onScroll = () => ScrollTrigger.update();
    lenis.on('scroll', onScroll);

    const tick = (time: number) => lenis.raf(time * 1000); // GSAP ticks in seconds
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Images and async server content change page height after mount;
    // without this, every trigger's start/end is measured against a stale
    // layout.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    const settleTimer = window.setTimeout(refresh, 600);

    return () => {
      window.removeEventListener('load', refresh);
      window.clearTimeout(settleTimer);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33); // restore GSAP's default
      lenis.off('scroll', onScroll);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
