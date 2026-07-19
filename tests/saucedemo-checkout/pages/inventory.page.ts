import { Page, Locator } from '@playwright/test';
import { HeaderComponent } from './header.component';
import { BASE_URL } from './login.page';

export class InventoryPage {
  readonly page: Page;
  readonly header: HeaderComponent;
  readonly url = `${BASE_URL}/inventory.html`;
  readonly pageTitle: Locator;
  readonly inventoryItems: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new HeaderComponent(page);
    this.pageTitle = page.locator('[data-test="title"]');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
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

  /** Adds every slug in order; every add-to-cart action always adds exactly qty = 1 (no quantity control exists). */
  async addMultipleToCart(slugs: string[]): Promise<void> {
    for (const slug of slugs) {
      await this.addToCart(slug);
    }
  }
}
