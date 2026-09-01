'use client';

import { useState } from 'react';

const FAQS = [
  {
    q: 'Is every listing on Kavuri Estates verified?',
    a: 'Every published listing goes through document, owner, and GPS verification before it appears in search — some also carry video and government-record checks, shown as badges on the listing.',
  },
  {
    q: 'Can I contact the owner directly?',
    a: 'Yes. There are no anonymous middlemen — you message or call the owner, builder, or agent directly through the app.',
  },
  {
    q: 'What services besides buying/renting are available?',
    a: 'Nine service verticals run through the same app: interior design, legal consulting, home loans, packers & movers, property management, and more — post a request and get quotes from verified partners.',
  },
  {
    q: 'Is posting a property free?',
    a: 'Yes, posting a listing is free. Optional paid add-ons (like featuring a listing for 30 days) are available if you want extra visibility.',
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-20">
      <h2 className="text-center text-3xl font-extrabold text-foreground sm:text-4xl">Frequently asked questions</h2>

      <div className="mt-10 divide-y divide-border">
        {FAQS.map((faq, i) => {
          const isOpen = open === i;
          return (
            <div key={faq.q} className="py-2">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
                aria-expanded={isOpen}
              >
                <span className="text-base font-semibold text-foreground sm:text-lg">{faq.q}</span>
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary transition-transform duration-300 ${
                    isOpen ? 'rotate-45' : ''
                  }`}
                >
                  +
                </span>
              </button>

              <div
                className="grid overflow-hidden transition-all duration-300 ease-out"
                style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <p className="pb-5 pr-12 text-sm leading-relaxed text-muted">{faq.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
