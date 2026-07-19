import { Locator } from '@playwright/test';
import { BasePage, BASE_URL } from './BasePage';
import { CartPage } from './CartPage';

export class InventoryPage extends BasePage {
  /** Rendered as a <span data-test="title">, not a semantic heading element, in the current build. */
  readonly heading = this.page.locator('[data-test="title"]');
  readonly inventoryItems = this.page.locator('[data-test="inventory-item"]');

  async goto(): Promise<void> {
    await this.page.goto(`${BASE_URL}/inventory.html`);
  }

  /**
   * Product "Add to cart"/"Remove" buttons carry a per-product data-test slug
   * (e.g. "add-to-cart-sauce-labs-backpack"), which is unique on the page even with many
   * products listed, unlike the shared "Add to cart"/"Remove" accessible name.
   */
  addToCartButton(productId: string): Locator {
    return this.page.locator(`[data-test="add-to-cart-${productId}"]`);
  }

  removeButton(productId: string): Locator {
    return this.page.locator(`[data-test="remove-${productId}"]`);
  }

  async addProductToCart(productId: string): Promise<void> {
    await this.addToCartButton(productId).click();
  }

  async removeProductFromCart(productId: string): Promise<void> {
    await this.removeButton(productId).click();
  }

  async goToCart(): Promise<CartPage> {
    await this.cartLink.click();
    return new CartPage(this.page);
  }
}
