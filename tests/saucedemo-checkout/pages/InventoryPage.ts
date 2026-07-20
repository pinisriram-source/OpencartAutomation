import { Page, Locator } from '@playwright/test';
import { AppHeader } from './AppHeader';

/** The Products / Inventory page (/inventory.html). */
export class InventoryPage {
  readonly page: Page;
  readonly url = 'https://www.saucedemo.com/inventory.html';
  readonly header: AppHeader;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new AppHeader(page);
    this.pageTitle = page.locator('[data-test="title"]');
  }

  async open(): Promise<void> {
    await this.page.goto(this.url);
  }

  addToCartButton(slug: string): Locator {
    return this.page.locator(`[data-test="add-to-cart-${slug}"]`);
  }

  removeButton(slug: string): Locator {
    return this.page.locator(`[data-test="remove-${slug}"]`);
  }

  async addToCart(slug: string): Promise<void> {
    await this.addToCartButton(slug).click();
  }

  async removeFromCart(slug: string): Promise<void> {
    await this.removeButton(slug).click();
  }
}
