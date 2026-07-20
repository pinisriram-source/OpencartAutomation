import { Page, Locator } from '@playwright/test';

/** Page Object for the SauceDemo Cart page (/cart.html). */
export class CartPage {
  readonly page: Page;
  readonly url = 'https://www.saucedemo.com/cart.html';

  readonly title: Locator;
  readonly cartBadge: Locator;
  readonly cartQuantityLabel: Locator;
  readonly cartDescLabel: Locator;
  readonly cartItems: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('[data-test="title"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.cartQuantityLabel = page.locator('[data-test="cart-quantity-label"]');
    this.cartDescLabel = page.locator('[data-test="cart-desc-label"]');
    this.cartItems = page.locator('[data-test="inventory-item"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }

  async open(): Promise<void> {
    await this.page.goto(this.url);
  }

  /** Locates a single cart line item row by the product's visible name. */
  itemRow(productName: string): Locator {
    return this.cartItems.filter({ hasText: productName });
  }

  quantity(row: Locator): Locator {
    return row.locator('[data-test="item-quantity"]');
  }

  name(row: Locator): Locator {
    return row.locator('[data-test="inventory-item-name"]');
  }

  description(row: Locator): Locator {
    return row.locator('[data-test="inventory-item-desc"]');
  }

  price(row: Locator): Locator {
    return row.locator('[data-test="inventory-item-price"]');
  }

  removeButtonInRow(row: Locator): Locator {
    return row.getByRole('button', { name: 'Remove' });
  }

  /** Removes a line item using its stable data-test slug (e.g. "sauce-labs-backpack"). */
  async removeProductBySlug(slug: string): Promise<void> {
    await this.page.locator(`[data-test="remove-${slug}"]`).click();
  }

  async goToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }
}
