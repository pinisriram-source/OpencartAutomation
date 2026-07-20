import { Page, Locator } from '@playwright/test';
import { AppHeader } from './AppHeader';

/** The Checkout: Complete! page (/checkout-complete.html). */
export class CheckoutCompletePage {
  readonly page: Page;
  readonly url = 'https://www.saucedemo.com/checkout-complete.html';
  readonly header: AppHeader;
  readonly pageTitle: Locator;
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly backHomeButton: Locator;
  readonly generatePdfButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new AppHeader(page);
    this.pageTitle = page.locator('[data-test="title"]');
    this.completeHeader = page.locator('[data-test="complete-header"]');
    this.completeText = page.locator('[data-test="complete-text"]');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
    this.generatePdfButton = page.locator('[data-test="generate-pdf-order"]');
  }

  async open(): Promise<void> {
    await this.page.goto(this.url);
  }

  async backHome(): Promise<void> {
    await this.backHomeButton.click();
  }
}
