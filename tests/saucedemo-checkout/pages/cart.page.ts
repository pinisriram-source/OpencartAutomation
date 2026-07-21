import { Page, Locator } from '@playwright/test';
import { productSlug } from './product-slug.util';

export class CartPage {
  readonly page: Page;
  readonly url = 'https://www.saucedemo.com/cart.html';

  readonly title: Locator;
  readonly cartBadge: Locator;
  readonly cartItems: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('[data-test="title"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.cartItems = page.locator('[data-test="inventory-item"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }

  async open(): Promise<void> {
    await this.page.goto(this.url);
  }

  /** Scopes to the cart row for a given product name. */
  lineItem(productName: string): Locator {
    return this.cartItems.filter({ hasText: productName });
  }

  quantity(productName: string): Locator {
    return this.lineItem(productName).locator('[data-test="item-quantity"]');
  }

  name(productName: string): Locator {
    return this.lineItem(productName).locator('[data-test="inventory-item-name"]');
  }

  description(productName: string): Locator {
    return this.lineItem(productName).locator('[data-test="inventory-item-desc"]');
  }

  price(productName: string): Locator {
    return this.lineItem(productName).locator('[data-test="inventory-item-price"]');
  }

  removeButton(productName: string): Locator {
    return this.lineItem(productName).locator(`[data-test="remove-${productSlug(productName)}"]`);
  }

  async removeItem(productName: string): Promise<void> {
    await this.removeButton(productName).click();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
