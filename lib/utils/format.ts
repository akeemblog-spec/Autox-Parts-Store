/**
 * Format a number as Sri Lankan Rupees, e.g. LKR 12,450
 */
export function formatPrice(value: number): string {
  return `LKR ${value.toLocaleString("en-LK")}`;
}

export function formatCompactNumber(value: number): string {
  return value.toLocaleString("en-LK");
}
