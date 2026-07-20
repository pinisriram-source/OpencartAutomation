import { Page, Locator } from '@playwright/test';

/** Page Object for SauceDemo Checkout Step Two - "Overview" (/checkout-step-two.html). */
export class CheckoutOverviewPage {
  readonly page: Page;
  readonly url = 'https://www.saucedemo.com/checkout-step-two.html';

  readonly title: Locator;
  readonly cartItems: Locator;
  readonly paymentInfoLabel: Locator;
  readonly paymentInfoValue: Locator;
  readonly shippingInfoLabel: Locator;
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
    this.paymentInfoLabel = page.locator('[data-test="payment-info-label"]');
    this.paymentInfoValue = page.locator('[data-test="payment-info-value"]');
    this.shippingInfoLabel = page.locator('[data-test="shipping-info-label"]');
    this.shippingInfoValue = page.locator('[data-test="shipping-info-value"]');
    this.subtotalLabel = page.locator('[data-test="subtotal-label"]');
    this.taxLabel = page.locator('[data-test="tax-label"]');
    this.totalLabel = page.locator('[data-test="total-label"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.finishButton = page.locator('[data-test="finish"]');
  }

  /** Locates a single overview line item row by the product's visible name. */
  itemRow(productName: string): Locator {
    return this.cartItems.filter({ hasText: productName });
  }

  quantity(row: Locator): Locator {
    return row.locator('[data-test="item-quantity"]');
  }

  name(row: Locator): Locator {
    return row.locator('[data-test="inventory-item-name"]');
  }

  description(row: Locator): Locator {
    return row.locator('[data-test="inventory-item-desc"]');
  }

  price(row: Locator): Locator {
    return row.locator('[data-test="inventory-item-price"]');
  }

  async clickFinish(): Promise<void> {
    await this.finishButton.click();
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
