import { BasePage } from './BasePage';

export class WishlistPage extends BasePage {
  async open(): Promise<void> {
    await this.gotoRoute('account/wishlist');
  }

  private rowByProductName(name: string) {
    return this.page.locator('tr').filter({ has: this.page.getByRole('link', { name, exact: true }) });
  }

  async addToCart(productName: string): Promise<void> {
    await this.rowByProductName(productName)
      .locator('button[title="Add to Cart"], button[data-original-title="Add to Cart"]')
      .click();
    await this.successAlert.waitFor({ state: 'visible' });
  }

  async remove(productName: string): Promise<void> {
    await this.rowByProductName(productName)
      .locator('a[title="Remove"], a[data-original-title="Remove"]')
      .click();
  }

  hasProduct(productName: string) {
    return this.rowByProductName(productName);
  }
}
