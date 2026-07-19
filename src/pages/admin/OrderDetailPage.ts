import { AdminBasePage } from './AdminBasePage';

export class OrderDetailPage extends AdminBasePage {
  async openById(orderId: string): Promise<void> {
    await this.gotoAdminRoute(`sale/order/info&order_id=${orderId}`);
  }

  get productLinesTable() {
    return this.page.locator('#order-product, .table').filter({ hasText: /product|model|quantity/i }).first();
  }

  get historyTable() {
    return this.page.locator('table').filter({ hasText: /date added|comment/i }).last();
  }

  async addHistory(status: string, comment: string): Promise<void> {
    await this.page.locator('select[name="order_status_id"]').selectOption({ label: status });
    await this.page.locator('textarea[name="comment"]').fill(comment);
    await this.page.getByRole('button', { name: /add history/i }).click();
    await this.page.waitForTimeout(1000);
  }

  get currentStatus() {
    return this.page.locator('select[name="order_status_id"]');
  }
}
