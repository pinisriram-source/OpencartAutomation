import { Page, Locator } from '@playwright/test';
import { AppHeader } from './AppHeader';

/** The Checkout: Overview page (/checkout-step-two.html). */
export class CheckoutStepTwoPage {
  readonly page: Page;
  readonly url = 'https://www.saucedemo.com/checkout-step-two.html';
  readonly header: AppHeader;
  readonly pageTitle: Locator;
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
    this.header = new AppHeader(page);
    this.pageTitle = page.locator('[data-test="title"]');
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

  async open(): Promise<void> {
    await this.page.goto(this.url);
  }

  /** Locates an overview row by its visible product name. */
  itemByName(name: string): Locator {
    return this.cartItems.filter({ hasText: name });
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }
}
