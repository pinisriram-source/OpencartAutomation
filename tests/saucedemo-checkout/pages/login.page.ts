import { Page, Locator } from '@playwright/test';

/** SauceDemo is a standalone app unrelated to the OpenCart baseURL configured in playwright.config.ts. */
export const BASE_URL = 'https://www.saucedemo.com';

export class LoginPage {
  readonly page: Page;
  readonly url = `${BASE_URL}/`;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorBanner: Locator;
  readonly errorCloseButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorBanner = page.locator('[data-test="error"]');
    this.errorCloseButton = page.locator('[data-test="error-button"]');
  }

  async open(): Promise<void> {
    await this.page.goto(this.url);
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
