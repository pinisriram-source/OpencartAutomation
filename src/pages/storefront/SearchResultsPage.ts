import { ProductListingBase } from './ProductListingBase';

export class SearchResultsPage extends ProductListingBase {
  async search(keyword: string, options: { description?: boolean; category?: string } = {}): Promise<void> {
    await this.gotoRoute('product/search');
    await this.page.getByPlaceholder('Search Criteria').fill(keyword);
    if (options.description) {
      await this.page.getByLabel(/search in product descriptions/i).check();
    }
    if (options.category) {
      await this.page.locator('select[name="category_id"]').selectOption({ label: options.category });
    }
    await this.page.getByRole('button', { name: /search/i }).click();
    await this.page.waitForLoadState('networkidle');
  }

  get noResultsMessage() {
    return this.page.getByText(/no product\(s\) which match/i);
  }
}
