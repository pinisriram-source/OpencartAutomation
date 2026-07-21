/**
 * Converts a SauceDemo product name into its data-test slug form, e.g.
 * "Sauce Labs Backpack" -> "sauce-labs-backpack", matching the
 * `add-to-cart-<slug>` / `remove-<slug>` data-test attribute convention used
 * throughout the app.
 */
export function productSlug(productName: string): string {
  return productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
