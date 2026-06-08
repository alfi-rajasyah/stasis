export function formatIDR(amount: number): string {
  if (amount === 0) return 'Rp 0';
  if (amount < 0) return `-Rp ${formatIDR(Math.abs(amount)).slice(3)}`;
  const formatted = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `Rp ${formatted}`;
}
