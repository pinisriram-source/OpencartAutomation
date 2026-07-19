import { ProductListingBase } from './ProductListingBase';

export class CategoryPage extends ProductListingBase {
  get breadcrumb() {
    return this.page.locator('.breadcrumb');
  }

  get sortSelect() {
    return this.page.locator('#input-sort');
  }

  get limitSelect() {
    return this.page.locator('#input-limit');
  }

  async sortBy(label: string): Promise<void> {
    await this.sortSelect.selectOption({ label });
    await this.page.waitForLoadState('networkidle');
  }

  async setItemsPerPage(label: string): Promise<void> {
    await this.limitSelect.selectOption({ label });
    await this.page.waitForLoadState('networkidle');
  }

  async switchToListView(): Promise<void> {
    await this.page.locator('#list-view').click();
  }

  async switchToGridView(): Promise<void> {
    await this.page.locator('#grid-view').click();
  }
}
