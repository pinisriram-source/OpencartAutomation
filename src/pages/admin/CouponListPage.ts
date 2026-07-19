import { AdminBasePage } from './AdminBasePage';

export class CouponListPage extends AdminBasePage {
  async open(): Promise<void> {
    await this.gotoAdminRoute('marketing/coupon');
  }

  async filterByName(name: string): Promise<void> {
    await this.page.locator('#input-name').fill(name);
    await this.page.locator('#button-filter').click();
    await this.page.waitForLoadState('networkidle');
  }

  rowByCode(code: string) {
    return this.page.locator('tr').filter({ hasText: code });
  }

  async hasCoupon(code: string): Promise<boolean> {
    await this.open();
    return (await this.rowByCode(code).count()) > 0;
  }

  async addNew(): Promise<void> {
    await this.page.locator('a[data-original-title="Add New"]').click();
  }
}
