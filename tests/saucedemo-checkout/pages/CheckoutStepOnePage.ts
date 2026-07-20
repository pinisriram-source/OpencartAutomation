import { Page, Locator } from '@playwright/test';
import { AppHeader } from './AppHeader';

export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

/** The Checkout: Your Information page (/checkout-step-one.html). */
export class CheckoutStepOnePage {
  readonly page: Page;
  readonly url = 'https://www.saucedemo.com/checkout-step-one.html';
  readonly header: AppHeader;
  readonly pageTitle: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly cancelButton: Locator;
  readonly continueButton: Locator;
  readonly errorBanner: Locator;
  readonly errorCloseButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new AppHeader(page);
    this.pageTitle = page.locator('[data-test="title"]');
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.errorBanner = page.locator('[data-test="error"]');
    this.errorCloseButton = page.locator('[data-test="error-button"]');
  }

  async open(): Promise<void> {
    await this.page.goto(this.url);
  }

  /** Fills only the fields provided, leaving the others untouched (useful for partial-field negative cases). */
  async fill(info: Partial<CheckoutInfo>): Promise<void> {
    if (info.firstName !== undefined) await this.firstNameInput.fill(info.firstName);
    if (info.lastName !== undefined) await this.lastNameInput.fill(info.lastName);
    if (info.postalCode !== undefined) await this.postalCodeInput.fill(info.postalCode);
  }

  async continueCheckout(): Promise<void> {
    await this.continueButton.click();
  }

  /** Fills all three fields and submits in a single step. */
  async submit(info: CheckoutInfo): Promise<void> {
    await this.fill(info);
    await this.continueCheckout();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
