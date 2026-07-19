import { BasePage } from './BasePage';

export class ComparePage extends BasePage {
  async open(): Promise<void> {
    await this.gotoRoute('product/compare');
  }

  get emptyMessage() {
    return this.page.getByText(/you have not chosen any products to compare/i);
  }

  columnFor(productName: string) {
    return this.page.locator('#product-compare table').getByText(productName, { exact: true });
  }

  /**
   * Removes a product from the comparison table. With a single product
   * being compared (this project's test scope) there's exactly one "Remove"
   * link, so no column-matching is needed; multi-product removal would
   * need to match the link's column against the "Product" row instead.
   */
  async removeProduct(productName: string): Promise<void> {
    await this.columnFor(productName).waitFor({ state: 'visible' });
    await this.page.getByRole('link', { name: 'Remove' }).first().click();
  }
}
