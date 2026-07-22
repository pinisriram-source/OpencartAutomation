/**
 * Converts a SauceDemo product name into its data-test slug form, e.g.
 * "Sauce Labs Backpack" -> "sauce-labs-backpack", matching the
 * `add-to-cart-<slug>` / `remove-<slug>` data-test attribute convention used
 * throughout the app.
 *
 * Verified against the live app: it only lowercases the name and replaces
 * whitespace runs with a single dash - other punctuation (periods,
 * parentheses, existing hyphens) is preserved as-is. This matters for
 * products like "Test.allTheThings() T-Shirt (Red)", whose real data-test
 * attribute is `add-to-cart-test.allthethings()-t-shirt-(red)` - stripping
 * all non-alphanumeric characters (an earlier version of this util) would
 * produce the wrong slug for that product.
 */
export function productSlug(productName: string): string {
  return productName.toLowerCase().replace(/\s+/g, '-');
}
