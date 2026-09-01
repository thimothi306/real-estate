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
