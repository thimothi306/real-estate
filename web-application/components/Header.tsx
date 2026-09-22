import Link from 'next/link';
import { AuthNav } from './AuthNav';
import { HeaderCitySelect } from './HeaderCitySelect';
import { StickyHeaderShell } from './StickyHeaderShell';

const NAV = [
  { href: '/properties?listing_type=sale', label: 'Buy' },
  { href: '/properties?listing_type=rent', label: 'Rent' },
  { href: '/properties?property_type=plot', label: 'Plots' },
  { href: '/properties?property_type=commercial', label: 'Commercial' },
  { href: '/services', label: 'Kavuri Connect' },
];

export function Header() {
  return (
    <StickyHeaderShell>
      <header className="flex items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold text-base transition-shadow duration-300 group-hover:shadow-[var(--shadow-gold)]">
            🏛
          </span>
          <span className="hidden sm:block">
            <span className="block text-sm font-extrabold leading-none tracking-[2px] text-foreground">KAVURI</span>
            <span className="mt-0.5 block text-[8px] font-bold tracking-[3px] text-gold">ESTATES</span>
          </span>
        </Link>

        <HeaderCitySelect />

        <nav className="hidden items-center gap-1 text-sm font-semibold text-muted md:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-full px-3.5 py-1.5 transition hover:bg-primary-soft hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/properties/new"
            className="hidden rounded-full bg-gold px-4 py-2 text-xs font-bold text-white shadow-[var(--shadow-gold)] transition hover:bg-gold-deep sm:block"
          >
            Post Property Free
          </Link>
          <AuthNav />
        </div>
      </header>
    </StickyHeaderShell>
  );
}
