'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SECTIONS: {
  label: string | null;
  items: { href: string; icon: string; label: string; badge?: number }[];
}[] = [
  { label: null, items: [{ href: '/dashboard', icon: '⌂', label: 'Dashboard' }] },
  {
    label: 'Discover',
    items: [
      { href: '/properties', icon: '🔍', label: 'Explore Properties' },
      { href: '/properties?lifestyle_tag=family-friendly', icon: '✨', label: 'Lifestyle Search' },
      { href: '/properties?sort=newest', icon: '🏗', label: 'New Listings' },
      { href: '/properties?sort=price_desc', icon: '📈', label: 'Premium Homes' },
    ],
  },
  {
    label: 'My Activities',
    items: [
      { href: '/dashboard/saved', icon: '♡', label: 'Saved Properties' },
      { href: '/dashboard/visits', icon: '📅', label: 'Visit Requests' },
      { href: '/dashboard/chats', icon: '💬', label: 'Messages' },
    ],
  },
  {
    label: 'Services',
    items: [
      { href: '/home-loan', icon: '🏦', label: 'Home Loan' },
      { href: '/services', icon: '🛠', label: 'All Services' },
    ],
  },
];

export function DashboardSidebar({ counts }: { counts?: Record<string, number> }) {
  const pathname = usePathname();

  return (
    // Sticky and viewport-tall so it stays visible while the content column
    // scrolls, rather than stretching to the full page height.
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col overflow-y-auto border-r border-border bg-navy lg:flex">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold text-base">🏛</span>
        <div>
          <div className="text-sm font-extrabold leading-none tracking-[2px] text-white">KAVURI</div>
          <div className="mt-0.5 text-[8px] font-bold tracking-[3px] text-gold">ESTATES</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto pb-4">
        {SECTIONS.map((section, i) => (
          <div key={section.label ?? i} className="pb-1">
            {section.label && (
              <div className="px-5 pb-1.5 pt-4 text-[10px] font-bold uppercase tracking-wider text-white/35">
                {section.label}
              </div>
            )}
            {section.items.map((item) => {
              const active = pathname === item.href.split('?')[0];
              const badge = counts?.[item.label];

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-5 py-2.5 text-sm transition ${
                    active
                      ? 'bg-navy-soft font-semibold text-white'
                      : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <span className="w-4 text-center text-[13px]">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {!!badge && (
                    <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-navy">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-4">
        <div className="rounded-xl bg-gradient-to-b from-navy-soft to-[#1e3f76] p-4 text-center">
          <div className="text-lg">👑</div>
          <h4 className="mt-1.5 text-[13px] font-bold text-white">Go Premium</h4>
          <p className="mt-1 text-[11px] leading-snug text-white/60">
            Priority support, featured listings, and zero ads.
          </p>
          <Link
            href="/pricing"
            className="mt-3 block rounded-lg bg-gold py-2 text-xs font-bold text-navy transition hover:bg-gold-dark"
          >
            Upgrade Now
          </Link>
        </div>
      </div>
    </aside>
  );
}
