import { AdminBasePage } from './AdminBasePage';

export class ReturnListPage extends AdminBasePage {
  async open(): Promise<void> {
    await this.gotoAdminRoute('sale/returns');
  }

  rowByOrderId(orderId: string) {
    return this.page.locator('tr').filter({ hasText: orderId });
  }

  async openReturnByOrderId(orderId: string): Promise<void> {
    await this.rowByOrderId(orderId).locator('a[data-original-title="Edit"]').click();
  }
}
