import { Page, Locator } from '@playwright/test';

/**
 * The Cart page (cart.html) and Checkout Overview page (checkout-step-two.html) render product
 * line items with identical markup/data-test attributes, so this helper is shared by both page
 * objects instead of being duplicated.
 */
export function itemRow(page: Page, productName: string): Locator {
  return page.locator('[data-test="inventory-item"]').filter({ hasText: productName });
}

/** The product name is rendered as the text of an anchor tag (it is a clickable link to the product detail). */
export function itemNameLink(row: Locator): Locator {
  return row.locator('[data-test="inventory-item-name"]').locator('xpath=ancestor::a');
}

export function itemDescription(row: Locator): Locator {
  return row.locator('[data-test="inventory-item-desc"]');
}

export function itemPrice(row: Locator): Locator {
  return row.locator('[data-test="inventory-item-price"]');
}

export function itemQuantity(row: Locator): Locator {
  return row.locator('[data-test="item-quantity"]');
}

/** Only present on the Cart page — the Overview page summary has no per-row Remove action. */
export function itemRemoveButton(row: Locator): Locator {
  return row.locator('button[data-test^="remove-"]');
}
