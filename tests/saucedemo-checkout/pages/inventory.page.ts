import { Page, Locator } from '@playwright/test';

/** Page Object for the SauceDemo Products/Inventory page (/inventory.html). */
export class InventoryPage {
  readonly page: Page;
  readonly url = 'https://www.saucedemo.com/inventory.html';

  readonly title: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly inventoryItems: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('[data-test="title"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
  }

  async open(): Promise<void> {
    await this.page.goto(this.url);
  }

  /** The "Add to cart"/"Remove" button for a product, identified by its data-test slug (e.g. "sauce-labs-backpack"). */
  addToCartButton(slug: string): Locator {
    return this.page.locator(`[data-test="add-to-cart-${slug}"]`);
  }

  removeButton(slug: string): Locator {
    return this.page.locator(`[data-test="remove-${slug}"]`);
  }

  async addProductToCart(slug: string): Promise<void> {
    await this.addToCartButton(slug).click();
  }

  async addProductsToCart(slugs: string[]): Promise<void> {
    for (const slug of slugs) {
      await this.addProductToCart(slug);
    }
  }

  async goToCart(): Promise<void> {
    await this.cartLink.click();
  }
}
