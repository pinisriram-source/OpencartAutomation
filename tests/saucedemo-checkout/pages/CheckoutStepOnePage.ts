import { BasePage, BASE_URL } from './BasePage';
import { CartPage } from './CartPage';
import { CheckoutStepTwoPage } from './CheckoutStepTwoPage';

export class CheckoutStepOnePage extends BasePage {
  readonly heading = this.page.locator('[data-test="title"]');
  readonly firstNameInput = this.page.locator('[data-test="firstName"]');
  readonly lastNameInput = this.page.locator('[data-test="lastName"]');
  readonly postalCodeInput = this.page.locator('[data-test="postalCode"]');
  readonly cancelButton = this.page.locator('[data-test="cancel"]');
  readonly continueButton = this.page.locator('[data-test="continue"]');

  async goto(): Promise<void> {
    await this.page.goto(`${BASE_URL}/checkout-step-one.html`);
  }

  async fillInfo(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  /** Clicks Continue only; stays on this page object since validation may keep the user here. */
  async continueCheckout(): Promise<void> {
    await this.continueButton.click();
  }

  /** Fills all three fields and clicks Continue, returning the Overview page object for the happy path. */
  async continueToOverview(): Promise<CheckoutStepTwoPage> {
    await this.continueButton.click();
    return new CheckoutStepTwoPage(this.page);
  }

  async cancel(): Promise<CartPage> {
    await this.cancelButton.click();
    return new CartPage(this.page);
  }
}
