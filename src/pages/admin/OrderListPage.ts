import { AdminBasePage } from './AdminBasePage';

export class OrderListPage extends AdminBasePage {
  async open(): Promise<void> {
    await this.gotoAdminRoute('sale/order');
  }

  async filterByCustomer(name: string): Promise<void> {
    await this.page.locator('#input-customer').fill(name);
    await this.page.locator('#button-filter').click();
    await this.page.waitForLoadState('networkidle');
  }

  rowByCustomer(name: string) {
    return this.page.locator('tr').filter({ hasText: name });
  }

  async openOrderByCustomer(name: string): Promise<void> {
    await this.rowByCustomer(name).locator('a[data-original-title="View"]').click();
  }
}
