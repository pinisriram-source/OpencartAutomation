import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  async open(): Promise<void> {
    await this.gotoRoute('checkout/cart');
  }

  private rowByProductName(name: string) {
    return this.page.locator('tr').filter({ has: this.page.getByRole('link', { name, exact: true }) });
  }

  async setQuantity(productName: string, qty: number): Promise<void> {
    const row = this.rowByProductName(productName);
    await row.locator('input[name^="quantity["]').fill(String(qty));
    await row.locator('button[data-original-title="Update"]').click();
    await this.page.waitForLoadState('networkidle');
  }

  async removeProduct(productName: string): Promise<void> {
    await this.rowByProductName(productName).locator('button[data-original-title="Remove"]').click();
    await this.page.waitForLoadState('networkidle');
  }

  lineTotal(productName: string) {
    return this.rowByProductName(productName).locator('td').last();
  }

  get emptyCartMessage() {
    return this.page.getByText(/your shopping cart is empty/i);
  }

  get orderTotalTable() {
    return this.page.locator('#content table').last();
  }

  async applyCoupon(code: string): Promise<void> {
    await this.page.getByRole('link', { name: /use coupon code/i }).click();
    await this.page.locator('#input-coupon').fill(code);
    await this.page.locator('#button-coupon').click();
    await this.page.waitForTimeout(1000);
  }

  async applyVoucher(code: string): Promise<void> {
    await this.page.getByRole('link', { name: /gift certificate/i }).click();
    await this.page.locator('#input-voucher').fill(code);
    await this.page.locator('#button-voucher').click();
    await this.page.waitForTimeout(1000);
  }

  async proceedToCheckout(): Promise<void> {
    await this.page.locator('#content').getByRole('link', { name: 'Checkout', exact: true }).click();
  }
}
