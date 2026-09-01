'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ASSET_BASE_URL } from '@/lib/config';

const STEPS = [
  {
    number: '01',
    title: 'Search & discover',
    body: 'Browse verified villas, apartments, plots, farmhouses, and commercial spaces — filter by lifestyle, not just budget.',
    photo: 'estate-02.jpg',
  },
  {
    number: '02',
    title: 'Shortlist & compare',
    body: 'Save favorites and compare up to four properties side by side on price, area, and amenities before you decide.',
    photo: 'estate-05.jpg',
  },
  {
    number: '03',
    title: 'Verify & visit',
    body: 'Every listing carries document, owner, GPS, and government-record checks. Schedule a visit directly with the owner.',
    photo: 'estate-07.jpg',
  },
  {
    number: '04',
    title: 'Book & move in',
    body: 'Confirm your booking, handle payments, and tap into 9 service verticals — legal, loans, movers — all from one app.',
    photo: 'estate-09.jpg',
  },
];

export function HowItWorks() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference) and (min-width: 1024px)', () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const trigger = ScrollTrigger.create({
        trigger: wrapper,
        start: 'top top',
        end: () => `+=${(STEPS.length - 1) * window.innerHeight}`,
        pin: true,
        // anticipatePin avoids a one-frame jump when the pin engages during
        // smooth (momentum) scrolling.
        anticipatePin: 1,
        invalidateOnRefresh: true,
        scrub: 0.6,
        onUpdate: (self) => {
          const index = Math.min(STEPS.length - 1, Math.floor(self.progress * STEPS.length));
          setActive(index);
        },
      });

      return () => trigger.kill();
    });

    return () => mm.revert();
  }, []);

  return (
    // No overflow-hidden on this element: ScrollTrigger pins it, and clipping
    // a pinned element fights the pin-spacer GSAP inserts. Children clip
    // themselves instead.
    <div ref={wrapperRef} className="relative flex min-h-screen items-center bg-foreground py-16 lg:py-0">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/50">How it works</span>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight text-white sm:text-5xl">
            From search to move-in, in four steps.
          </h2>

          <div className="mt-10 space-y-1">
            {STEPS.map((step, i) => (
              <div
                key={step.number}
                className={`border-l-2 py-4 pl-6 transition-all duration-500 ${
                  active === i ? 'border-primary opacity-100' : 'border-white/10 opacity-40'
                }`}
              >
                <div className="flex items-baseline gap-4">
                  <span className={`text-2xl font-black transition-colors duration-500 ${active === i ? 'text-primary' : 'text-white/40'}`}>
                    {step.number}
                  </span>
                  <h3 className="text-lg font-bold text-white">{step.title}</h3>
                </div>
                {active === i && <p className="mt-2 max-w-md text-sm leading-relaxed text-white/70">{step.body}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl shadow-2xl lg:aspect-square">
          {STEPS.map((step, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={step.photo}
              src={`${ASSET_BASE_URL}/storage/property-images/${step.photo}`}
              alt=""
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                active === i ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <span className="absolute bottom-6 left-6 text-6xl font-black text-white/90">{STEPS[active].number}</span>
        </div>
      </div>
    </div>
  );
}
