import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.errorMessage = page.locator('#error');
  }

  async navigate() {
    await this.page.goto('https://practicetestautomation.com/practice-test-login/');
  }

  async verifyPageLoaded() {
    await expect(this.page).toHaveTitle('Test Login | Practice Test Automation');
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async enterUsername(username: string) {
    await this.usernameInput.fill(username);
  }

  async enterPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async clickSubmit() {
    await this.submitButton.click();
  }

  async verifyUsernameFieldAcceptsInput(expectedValue: string) {
    await expect(this.usernameInput).toHaveValue(expectedValue);
  }

  async verifyPasswordFieldMasked() {
    await expect(this.passwordInput).toHaveAttribute('type', 'password');
  }

  async verifyErrorMessage(expectedMessage: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toHaveText(expectedMessage);
  }
}
