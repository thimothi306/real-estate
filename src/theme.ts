export const colors = {
  bg: '#f6f7f9',
  surface: '#ffffff',
  border: '#e2e5ea',
  text: '#1a1d23',
  muted: '#6b7280',
  primary: '#1f6feb',
  primaryDark: '#1a5bc4',
  success: '#17803d',
  successBg: '#e8f5ec',
  danger: '#b42318',
  dangerBg: '#fdeceb',
  warning: '#a15c07',
  warningBg: '#fdf3e3',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
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
