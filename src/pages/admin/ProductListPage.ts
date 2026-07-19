import { AdminBasePage } from './AdminBasePage';

export class ProductListPage extends AdminBasePage {
  async open(): Promise<void> {
    await this.gotoAdminRoute('catalog/product');
  }

  async filterByName(name: string): Promise<void> {
    await this.page.locator('#input-name').fill(name);
    await this.page.locator('#button-filter').click();
    await this.page.waitForLoadState('networkidle');
  }

  rowByName(name: string) {
    // Product names in this list are plain text (not links), so match the
    // exact cell text to avoid "MacBook" also matching "MacBook Air/Pro".
    return this.page.locator('tr').filter({ has: this.page.locator('td.text-left', { hasText: new RegExp(`^${name}$`) }) });
  }

  async editByName(name: string): Promise<void> {
    await this.rowByName(name).locator('a[data-original-title="Edit"]').click();
  }

  async deleteByName(name: string): Promise<void> {
    await this.rowByName(name).locator('input[type="checkbox"]').check();
    this.page.once('dialog', (d) => d.accept());
    await this.page.locator('button[data-original-title="Delete"]').click();
    await this.waitForSuccessAlert();
  }

  async addNew(): Promise<void> {
    await this.page.locator('a[data-original-title="Add New"]').click();
  }
}
