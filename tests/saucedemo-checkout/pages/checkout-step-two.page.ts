import { Page, Locator } from '@playwright/test';

export class CheckoutStepTwoPage {
  readonly page: Page;
  readonly url = 'https://www.saucedemo.com/checkout-step-two.html';

  readonly title: Locator;
  readonly cartItems: Locator;
  readonly paymentInfoValue: Locator;
  readonly shippingInfoValue: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly cancelButton: Locator;
  readonly finishButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('[data-test="title"]');
    this.cartItems = page.locator('[data-test="inventory-item"]');
    this.paymentInfoValue = page.locator('[data-test="payment-info-value"]');
    this.shippingInfoValue = page.locator('[data-test="shipping-info-value"]');
    this.subtotalLabel = page.locator('[data-test="subtotal-label"]');
    this.taxLabel = page.locator('[data-test="tax-label"]');
    this.totalLabel = page.locator('[data-test="total-label"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.finishButton = page.locator('[data-test="finish"]');
  }

  async open(): Promise<void> {
    await this.page.goto(this.url);
  }

  /** Scopes to the order-summary row for a given product name. */
  lineItem(productName: string): Locator {
    return this.cartItems.filter({ hasText: productName });
  }

  quantity(productName: string): Locator {
    return this.lineItem(productName).locator('[data-test="item-quantity"]');
  }

  name(productName: string): Locator {
    return this.lineItem(productName).locator('[data-test="inventory-item-name"]');
  }

  description(productName: string): Locator {
    return this.lineItem(productName).locator('[data-test="inventory-item-desc"]');
  }

  price(productName: string): Locator {
    return this.lineItem(productName).locator('[data-test="inventory-item-price"]');
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }
}
