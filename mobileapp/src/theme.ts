import { Platform } from 'react-native';

/**
 * Kavuri Estates brand palette — deep emerald + wine burgundy.
 *
 * Mirrors web-application/app/globals.css: blue-navy read as generic
 * finance/corporate, so emerald carries the brand now (it has real meaning
 * for real estate — land, growth, an appreciating asset) and burgundy is
 * the single highest-intent accent. Token *names* (navy/gold/primary) are
 * kept as-is to match the web app's own choice, and because renaming them
 * would mean touching every screen for no visible benefit — only the
 * values changed.
 */
export const colors = {
  // Surfaces — warm ivory, no blue cast
  bg: '#faf8f2',
  surface: '#ffffff',
  surfaceAlt: '#f1ece0',
  border: '#e6e0cf',
  borderStrong: '#d4cbb0',

  // Navy scale (now emerald)
  navy: '#0d3b2e',
  navyDeep: '#082720',
  navySoft: '#175a46',
  navyTint: '#e8f6f0',

  // Text
  text: '#16241d',
  muted: '#6b6f63',
  faint: '#9a9d8e',
  onDark: '#ffffff',
  onDarkMuted: 'rgba(255,255,255,0.66)',

  // Brand actions
  primary: '#1f8f6c',
  primaryDark: '#146b52',
  primarySoft: '#e8f6f0',
  gold: '#7c2436',
  goldDark: '#591a27',
  goldSoft: '#f8e9eb',

  // Semantic
  success: '#3d7a4a',
  successBg: '#eaf3ec',
  danger: '#b42318',
  dangerBg: '#fdeceb',
  warning: '#a15c07',
  warningBg: '#fdf3e3',
  info: '#0e7490',
  infoBg: '#e6f4f7',
};

/** Dark emerald surfaces used by the splash, chat header, and insight panels. */
export const darkColors = {
  bg: '#051813',
  surface: '#082821',
  surfaceAlt: '#1c4a3a',
  border: 'rgba(255,255,255,0.10)',
  text: '#ffffff',
  muted: 'rgba(255,255,255,0.66)',
  /** Burgundy accent text readable on these dark surfaces — colors.gold is
   * too dark for that now that gold means burgundy, not light tan. */
  accent: '#d97e91',
};

/** Rotating tints for category/service icon chips. */
export const accents = [
  { bg: '#e8f6f0', fg: '#0d3b2e' },
  { bg: '#f8e9eb', fg: '#591a27' },
  { bg: '#eaf3ec', fg: '#3d7a4a' },
  { bg: '#fdeceb', fg: '#b42318' },
  { bg: '#f1ecfd', fg: '#6d3fc0' },
  { bg: '#e6f4f7', fg: '#0e7490' },
];

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 26,
  pill: 999,
};

export const type = {
  display: { fontSize: 26, fontWeight: '800' as const, letterSpacing: -0.4 },
  h1: { fontSize: 21, fontWeight: '800' as const, letterSpacing: -0.3 },
  h2: { fontSize: 17.5, fontWeight: '700' as const, letterSpacing: -0.2 },
  body: { fontSize: 14.5, fontWeight: '400' as const },
  bodyStrong: { fontSize: 14.5, fontWeight: '600' as const },
  caption: { fontSize: 12.5, fontWeight: '500' as const },
  label: { fontSize: 11.5, fontWeight: '700' as const, letterSpacing: 0.4, textTransform: 'uppercase' as const },
};

/** Soft elevation tokens — cross-platform (iOS shadow*, Android elevation). */
export const shadow = {
  sm: Platform.select({
    ios: { shadowColor: '#0b1220', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
    android: { elevation: 2 },
    default: {},
  }),
  md: Platform.select({
    ios: { shadowColor: '#0b1220', shadowOpacity: 0.09, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
    android: { elevation: 5 },
    default: {},
  }),
  lg: Platform.select({
    ios: { shadowColor: '#0b1220', shadowOpacity: 0.14, shadowRadius: 24, shadowOffset: { width: 0, height: 12 } },
    android: { elevation: 10 },
    default: {},
  }),
};

/** Formats a rupee amount the way Indian real estate listings read: 1.5 Cr, 80 L, 45,000. */
export function formatPrice(value: number | null | undefined): string {
  if (value == null) return '—';
  if (value >= 10000000) {
    const cr = value / 10000000;
    return `₹${cr % 1 === 0 ? cr : cr.toFixed(2).replace(/\.?0+$/, '')} Cr`;
  }
  if (value >= 100000) {
    const lakh = value / 100000;
    return `₹${lakh % 1 === 0 ? lakh : lakh.toFixed(2).replace(/\.?0+$/, '')} L`;
  }
  return `₹${value.toLocaleString('en-IN')}`;
}

export function titleCase(value: string | null | undefined): string {
  if (!value) return '—';
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
