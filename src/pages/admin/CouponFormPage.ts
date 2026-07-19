import { AdminBasePage } from './AdminBasePage';

export interface CouponInput {
  name: string;
  code: string;
  type: 'Percentage' | 'Fixed Amount';
  discount: string;
  total?: string;
  usesTotal?: string;
  usesCustomer?: string;
  dateEnd?: string;
}

export class CouponFormPage extends AdminBasePage {
  async openForAdd(): Promise<void> {
    await this.gotoAdminRoute('marketing/coupon/add');
  }

  async fill(coupon: CouponInput): Promise<void> {
    await this.page.locator('#input-name').fill(coupon.name);
    await this.page.locator('#input-code').fill(coupon.code);
    await this.page.locator('#input-type').selectOption({ label: coupon.type });
    await this.page.locator('#input-discount').fill(coupon.discount);
    if (coupon.total) {
      await this.page.locator('#input-total').fill(coupon.total);
    }
    if (coupon.usesTotal) {
      await this.page.locator('#input-uses-total').fill(coupon.usesTotal);
    }
    if (coupon.usesCustomer) {
      await this.page.locator('#input-uses-customer').fill(coupon.usesCustomer);
    }
    if (coupon.dateEnd) {
      await this.page.locator('#input-date-end').fill(coupon.dateEnd);
    }
    await this.page.locator('#input-status').selectOption({ label: 'Enabled' });
  }

  async save(): Promise<void> {
    await this.saveButton.click();
    await this.waitForSuccessAlert();
  }
}
