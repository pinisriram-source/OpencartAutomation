import { BasePage } from './BasePage';

/**
 * Shared behavior for any page that renders a grid of product tiles
 * (Home featured section, Category listing, Search results).
 */
export abstract class ProductListingBase extends BasePage {
  private tileByName(name: string) {
    return this.page
      .locator('.product-layout')
      .filter({ has: this.page.getByRole('link', { name, exact: true }) });
  }

  async openProduct(name: string): Promise<void> {
    await this.tileByName(name).getByRole('link', { name, exact: true }).first().click();
  }

  async addToCart(name: string): Promise<void> {
    await this.tileByName(name).getByRole('button', { name: /add to cart/i }).click();
  }

  async addToWishlist(name: string): Promise<void> {
    await this.tileByName(name)
      .locator('button[title="Add to Wish List"], button[data-original-title="Add to Wish List"]')
      .click();
  }

  async addToCompare(name: string): Promise<void> {
    await this.tileByName(name)
      .locator('button[title="Compare this Product"], button[data-original-title="Compare this Product"]')
      .click();
  }

  productCount() {
    return this.page.locator('.product-layout').count();
  }
}
