import { Page, Locator } from '@playwright/test';

export interface CheckoutInformationDetails {
  firstName?: string;
  lastName?: string;
  postalCode?: string;
}

/** Page Object for SauceDemo Checkout Step One - "Your Information" (/checkout-step-one.html). */
export class CheckoutInformationPage {
  readonly page: Page;
  readonly url = 'https://www.saucedemo.com/checkout-step-one.html';

  readonly title: Locator;
  readonly cartBadge: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly cancelButton: Locator;
  readonly continueButton: Locator;
  readonly errorBanner: Locator;
  readonly errorCloseButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('[data-test="title"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
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

  async fillInformation(details: CheckoutInformationDetails): Promise<void> {
    if (details.firstName !== undefined) await this.firstNameInput.fill(details.firstName);
    if (details.lastName !== undefined) await this.lastNameInput.fill(details.lastName);
    if (details.postalCode !== undefined) await this.postalCodeInput.fill(details.postalCode);
  }

  async clickContinue(): Promise<void> {
    await this.continueButton.click();
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }

  /** Fills the three fields (skipping any left undefined) and clicks Continue. */
  async submitInformation(details: CheckoutInformationDetails): Promise<void> {
    await this.fillInformation(details);
    await this.clickContinue();
  }

  async dismissError(): Promise<void> {
    await this.errorCloseButton.click();
  }

  /** True when the given field input carries the app's "error" CSS class (red outline/icon). */
  async isFieldMarkedInvalid(input: Locator): Promise<boolean> {
    const classes = (await input.getAttribute('class')) ?? '';
    return classes.split(/\s+/).includes('error');
  }
}
