import { AdminBasePage } from './AdminBasePage';

export class CustomerListPage extends AdminBasePage {
  async open(): Promise<void> {
    await this.gotoAdminRoute('customer/customer');
  }

  async filterByEmail(email: string): Promise<void> {
    await this.page.locator('#input-email').fill(email);
    await this.page.locator('#button-filter').click();
    await this.page.waitForLoadState('networkidle');
  }

  rowByEmail(email: string) {
    return this.page.locator('tr').filter({ hasText: email });
  }

  async setStatusByEmail(email: string, enabled: boolean): Promise<void> {
    await this.rowByEmail(email).locator('a[data-original-title="Edit"]').click();
    await this.page.locator('#input-status').selectOption(enabled ? 'Enabled' : 'Disabled');
    await this.saveButton.click();
    await this.waitForSuccessAlert();
  }
}
