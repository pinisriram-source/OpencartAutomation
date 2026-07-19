import { BasePage } from './BasePage';

export class OrderHistoryPage extends BasePage {
  async open(): Promise<void> {
    await this.gotoRoute('account/order');
  }

  orderRow(orderId: string) {
    return this.page.locator('tr').filter({ hasText: orderId });
  }

  async viewOrder(orderId: string): Promise<void> {
    await this.orderRow(orderId).getByRole('link').first().click();
  }

  get latestOrderRow() {
    return this.page.locator('table tbody tr').first();
  }
}
