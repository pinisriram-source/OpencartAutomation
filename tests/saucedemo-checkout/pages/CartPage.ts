import { Page, Locator } from '@playwright/test';
import { AppHeader } from './AppHeader';

/** The Cart page (/cart.html). */
export class CartPage {
  readonly page: Page;
  readonly url = 'https://www.saucedemo.com/cart.html';
  readonly header: AppHeader;
  readonly pageTitle: Locator;
  readonly cartItems: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new AppHeader(page);
    this.pageTitle = page.locator('[data-test="title"]');
    this.cartItems = page.locator('[data-test="inventory-item"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }

  async open(): Promise<void> {
    await this.page.goto(this.url);
  }

  removeButton(slug: string): Locator {
    return this.page.locator(`[data-test="remove-${slug}"]`);
  }

  /** Locates a cart row by its visible product name. */
  itemByName(name: string): Locator {
    return this.cartItems.filter({ hasText: name });
  }

  async removeItem(slug: string): Promise<void> {
    await this.removeButton(slug).click();
  }
}
