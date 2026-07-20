import { Page, Locator } from '@playwright/test';

/** Page Object for the SauceDemo order confirmation page (/checkout-complete.html). */
export class CheckoutCompletePage {
  readonly page: Page;
  readonly url = 'https://www.saucedemo.com/checkout-complete.html';

  readonly title: Locator;
  readonly cartBadge: Locator;
  readonly ponyExpressImage: Locator;
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly backHomeButton: Locator;
  readonly generatePdfButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('[data-test="title"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.ponyExpressImage = page.locator('[data-test="pony-express"]');
    this.completeHeader = page.locator('[data-test="complete-header"]');
    this.completeText = page.locator('[data-test="complete-text"]');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
    this.generatePdfButton = page.locator('[data-test="generate-pdf-order"]');
  }

  async open(): Promise<void> {
    await this.page.goto(this.url);
  }

  async clickBackHome(): Promise<void> {
    await this.backHomeButton.click();
  }
}
