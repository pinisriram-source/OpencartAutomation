import { Page, Locator } from '@playwright/test';

/** Page object for the individual product detail page, e.g. /inventory-item.html?id=4. */
export class ProductDetailPage {
  readonly page: Page;

  readonly backToProductsButton: Locator;
  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;
  readonly addToCartButton: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.backToProductsButton = page.locator('[data-test="back-to-products"]');
    this.name = page.locator('[data-test="inventory-item-name"]');
    this.description = page.locator('[data-test="inventory-item-desc"]');
    this.price = page.locator('[data-test="inventory-item-price"]');
    // Unlike the listing page, the detail page's Add to cart button uses the generic
    // data-test="add-to-cart" (no product slug suffix), since only one product is shown.
    this.addToCartButton = page.locator('[data-test="add-to-cart"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
  }

  async backToProducts(): Promise<void> {
    await this.backToProductsButton.click();
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }
}
