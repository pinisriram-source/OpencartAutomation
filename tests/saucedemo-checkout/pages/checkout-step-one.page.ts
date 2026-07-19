import { Page, Locator } from '@playwright/test';
import { HeaderComponent } from './header.component';
import { BASE_URL } from './login.page';

export interface CheckoutInformation {
  firstName?: string;
  lastName?: string;
  zip?: string;
}

export class CheckoutStepOnePage {
  readonly page: Page;
  readonly header: HeaderComponent;
  readonly url = `${BASE_URL}/checkout-step-one.html`;
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
    this.header = new HeaderComponent(page);
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

  async fill(info: CheckoutInformation): Promise<void> {
    if (info.firstName !== undefined) await this.firstNameInput.fill(info.firstName);
    if (info.lastName !== undefined) await this.lastNameInput.fill(info.lastName);
    if (info.zip !== undefined) await this.postalCodeInput.fill(info.zip);
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  /** Fills all three fields and submits in one step — the common happy-path action used by most suites. */
  async fillAndContinue(info: Required<CheckoutInformation>): Promise<void> {
    await this.fill(info);
    await this.continue();
  }
}
