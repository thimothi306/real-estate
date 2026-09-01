import { Platform } from 'react-native';

/**
 * Kavuri Estates brand palette.
 *
 * Deep navy carries the brand (headers, primary actions, dark surfaces);
 * gold is reserved for the highest-intent CTA on a screen so it never
 * competes with itself. Everything else is a neutral or a semantic state.
 */
export const colors = {
  // Surfaces
  bg: '#f4f6fa',
  surface: '#ffffff',
  surfaceAlt: '#eef1f7',
  border: '#e3e7ef',
  borderStrong: '#d1d8e5',

  // Navy scale
  navy: '#0d1b33',
  navyDeep: '#081224',
  navySoft: '#16305b',
  navyTint: '#e8edf7',

  // Text
  text: '#101828',
  muted: '#667085',
  faint: '#98a2b3',
  onDark: '#ffffff',
  onDarkMuted: 'rgba(255,255,255,0.66)',

  // Brand actions
  primary: '#16305b',
  primaryDark: '#0d1b33',
  primarySoft: '#e8edf7',
  gold: '#c9a961',
  goldDark: '#b0904a',
  goldSoft: '#faf4e6',

  // Semantic
  success: '#17803d',
  successBg: '#e8f5ec',
  danger: '#b42318',
  dangerBg: '#fdeceb',
  warning: '#a15c07',
  warningBg: '#fdf3e3',
  info: '#175cd3',
  infoBg: '#eaf1fe',
};

/** Dark navy surfaces used by the splash, chat header, and insight panels. */
export const darkColors = {
  bg: '#0a1628',
  surface: '#0f2140',
  surfaceAlt: '#16305b',
  border: 'rgba(255,255,255,0.10)',
  text: '#ffffff',
  muted: 'rgba(255,255,255,0.66)',
};

/** Rotating tints for category/service icon chips. */
export const accents = [
  { bg: '#e8edf7', fg: '#16305b' },
  { bg: '#faf4e6', fg: '#b0904a' },
  { bg: '#e8f5ec', fg: '#17803d' },
  { bg: '#fdeceb', fg: '#b42318' },
  { bg: '#f1ecfd', fg: '#6d3fc0' },
  { bg: '#e6f6f8', fg: '#0e7a90' },
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
