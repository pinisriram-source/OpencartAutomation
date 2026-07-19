/**
 * SauceDemo applies a flat 8% tax rate to the item subtotal, rounded to the nearest cent.
 * Verified live: $29.99 -> tax $2.40; $39.98 -> tax $3.20; $55.97 -> tax $4.48.
 */
export const TAX_RATE = 0.08;

export function calculateTax(itemTotal: number): number {
  return Math.round(itemTotal * TAX_RATE * 100) / 100;
}

export function calculateTotal(itemTotal: number): number {
  return Math.round((itemTotal + calculateTax(itemTotal)) * 100) / 100;
}

export function formatMoney(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
