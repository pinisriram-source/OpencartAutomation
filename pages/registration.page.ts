import { Page, Locator } from '@playwright/test';

export interface RegistrationDetails {
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  password: string;
  confirmPassword?: string;
  subscribeNewsletter?: boolean;
  agreeToPolicy?: boolean;
}

export class RegistrationPage {
  readonly page: Page;
  readonly url = 'https://tutorialsninja.com/demo/index.php?route=account/register';
  readonly logoutUrl = 'https://tutorialsninja.com/demo/index.php?route=account/logout';

  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly telephoneInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly newsletterYesRadio: Locator;
  readonly newsletterNoRadio: Locator;
  readonly agreeCheckbox: Locator;
  readonly continueButton: Locator;
  readonly alertBanner: Locator;
  readonly successHeading: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.locator('#input-firstname');
    this.lastNameInput = page.locator('#input-lastname');
    this.emailInput = page.locator('#input-email');
    this.telephoneInput = page.locator('#input-telephone');
    this.passwordInput = page.locator('#input-password');
    this.confirmPasswordInput = page.locator('#input-confirm');
    this.newsletterYesRadio = page.locator('input[name="newsletter"][value="1"]');
    this.newsletterNoRadio = page.locator('input[name="newsletter"][value="0"]');
    this.agreeCheckbox = page.locator('input[name="agree"]');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.alertBanner = page.locator('.alert-danger');
    this.successHeading = page.getByRole('heading', { name: 'Your Account Has Been Created!' });
    this.successMessage = page.getByText('Congratulations! Your new account has been successfully created!');
  }

  private fieldError(input: Locator): Locator {
    return input.locator('xpath=following-sibling::div[contains(@class,"text-danger")]');
  }

  get firstNameError(): Locator {
    return this.fieldError(this.firstNameInput);
  }

  get lastNameError(): Locator {
    return this.fieldError(this.lastNameInput);
  }

  get emailError(): Locator {
    return this.fieldError(this.emailInput);
  }

  get telephoneError(): Locator {
    return this.fieldError(this.telephoneInput);
  }

  get passwordError(): Locator {
    return this.fieldError(this.passwordInput);
  }

  get confirmPasswordError(): Locator {
    return this.fieldError(this.confirmPasswordInput);
  }

  async open(): Promise<void> {
    await this.page.goto(this.url);
  }

  async fillForm(details: Partial<RegistrationDetails>): Promise<void> {
    if (details.firstName !== undefined) await this.firstNameInput.fill(details.firstName);
    if (details.lastName !== undefined) await this.lastNameInput.fill(details.lastName);
    if (details.email !== undefined) await this.emailInput.fill(details.email);
    if (details.telephone !== undefined) await this.telephoneInput.fill(details.telephone);
    if (details.password !== undefined) await this.passwordInput.fill(details.password);
    if (details.confirmPassword !== undefined) await this.confirmPasswordInput.fill(details.confirmPassword);
    if (details.subscribeNewsletter) await this.newsletterYesRadio.check();
    if (details.agreeToPolicy) await this.agreeCheckbox.check();
  }

  async submit(): Promise<void> {
    await this.continueButton.click();
  }

  /** Fills the form (defaulting confirmPassword to password and agreeing to the policy) and submits. */
  async register(details: RegistrationDetails): Promise<void> {
    await this.fillForm({
      ...details,
      confirmPassword: details.confirmPassword ?? details.password,
      agreeToPolicy: details.agreeToPolicy ?? true,
    });
    await this.submit();
  }

  async logout(): Promise<void> {
    await this.page.goto(this.logoutUrl);
  }
}
