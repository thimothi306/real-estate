'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function StickyHeaderShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const trigger = ScrollTrigger.create({
      trigger: sentinelRef.current,
      start: 'top -1px',
      onEnter: () => setScrolled(true),
      onLeaveBack: () => setScrolled(false),
    });

    return () => trigger.kill();
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="absolute top-0 h-px w-full" aria-hidden />
      <div
        className={`sticky top-0 z-50 px-3 transition-all duration-300 sm:px-6 ${
          scrolled ? 'pt-2' : 'pt-3 sm:pt-5'
        }`}
      >
        <div
          className={`mx-auto max-w-6xl rounded-full border transition-all duration-300 ${
            scrolled
              ? 'border-border/70 bg-surface/90 shadow-[0_8px_30px_-14px_rgba(31,111,235,0.35)] backdrop-blur-md'
              : 'border-transparent bg-surface/60 shadow-none backdrop-blur-sm'
          }`}
        >
          {children}
        </div>
      </div>
    </>
  );
}
