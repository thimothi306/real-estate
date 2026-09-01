'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const STATS = [
  { value: 500, suffix: '+', label: 'Verified listings' },
  { value: 40, suffix: '+', label: 'Cities covered' },
  { value: 9, suffix: '', label: 'Service verticals' },
  { value: 4.8, suffix: '', label: 'Average rating', decimals: 1 },
];

export function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const valueRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      valueRefs.current.forEach((el, i) => {
        if (!el) return;
        const stat = STATS[i];
        const counter = { value: 0 };

        gsap.to(counter, {
          value: stat.value,
          duration: 1.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
          onUpdate: () => {
            el.textContent = stat.decimals ? counter.value.toFixed(stat.decimals) : Math.round(counter.value).toString();
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="bg-primary py-20">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 sm:grid-cols-4">
        {STATS.map((stat, i) => (
          <div key={stat.label} className="text-center">
            <div className="text-4xl font-black text-white sm:text-6xl">
              <span ref={(el) => { valueRefs.current[i] = el; }}>0</span>
              {stat.suffix}
            </div>
            <p className="mt-2 text-sm font-semibold text-white/70">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
