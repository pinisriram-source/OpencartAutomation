import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  async open(): Promise<void> {
    await this.gotoRoute('checkout/cart');
  }

  rowByProductName(name: string) {
    return this.page.getByRole('row').filter({ has: this.page.getByRole('link', { name, exact: true }) });
  }

  async setQuantity(productName: string, qty: number): Promise<void> {
    const row = this.rowByProductName(productName);
    // The quantity input is a plain type="text" field (not type="number"),
    // so it gets the "textbox" role rather than "spinbutton", and it has no
    // <label> -- scoping to the row (already unique per product) makes a
    // role-only, unnamed match safe.
    await row.getByRole('textbox').fill(String(qty));
    // Update/Remove are icon-only buttons whose accessible name comes from
    // Bootstrap's tooltip() moving `title` into `data-original-title` at
    // runtime (see ProductPage's wishlist/compare buttons for the same
    // issue) -- no getBy* alternative reaches them reliably.
    await row.locator('button[data-original-title="Update"]').click();
    await this.page.waitForLoadState('networkidle');
  }

  async removeProduct(productName: string): Promise<void> {
    await this.rowByProductName(productName).locator('button[data-original-title="Remove"]').click();
    await this.page.waitForLoadState('networkidle');
  }

  lineTotal(productName: string) {
    return this.rowByProductName(productName).getByRole('cell').last();
  }

  get emptyCartMessage() {
    // The header's mini-cart dropdown (#cart) renders the same "empty"
    // message alongside the main #content area -- scope to #content to
    // avoid a strict-mode violation matching both.
    return this.page.locator('#content').getByText(/your shopping cart is empty/i);
  }

  get orderTotalTable() {
    return this.page.locator('#content').getByRole('table').last();
  }

  async applyCoupon(code: string): Promise<void> {
    await this.page.getByRole('link', { name: /use coupon code/i }).click();
    await this.page.getByLabel('Enter your coupon here').fill(code);
    await Promise.all([
      this.page.waitForResponse((r) => /route=extension\/total\/coupon\/coupon/.test(r.url())),
      this.page.getByRole('button', { name: 'Apply Coupon' }).click(),
    ]);
  }

  async applyVoucher(code: string): Promise<void> {
    // "Gift Certificate" also matches the footer's "Gift Certificates" nav
    // link under a loose /gift certificate/i match -- anchor to the start
    // of the accordion toggle's accessible name ("Use Gift Certificate ")
    // to keep this a single, unambiguous match.
    await this.page.getByRole('link', { name: /^use gift certificate/i }).click();
    await this.page.getByLabel('Enter your gift certificate code here').fill(code);
    await Promise.all([
      this.page.waitForResponse((r) => /route=extension\/total\/voucher\/voucher/.test(r.url())),
      this.page.getByRole('button', { name: 'Apply Gift Certificate' }).click(),
    ]);
  }

  async proceedToCheckout(): Promise<void> {
    await this.page.getByRole('link', { name: 'Checkout', exact: true }).click();
  }
}
