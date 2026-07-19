import { Page } from '@playwright/test';
import { env } from '../../utils/env';

export class AdminLoginPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto(env.adminBaseUrl);
  }

  /** Logs in and returns the user_token parsed from the post-login URL. */
  async login(username = env.adminUsername, password = env.adminPassword): Promise<string> {
    await this.page.locator('#input-username').fill(username);
    await this.page.locator('#input-password').fill(password);
    await this.page.locator('button[type="submit"]').click();
    await this.page.waitForURL(/route=common\/dashboard/);
    const url = new URL(this.page.url());
    const token = url.searchParams.get('user_token');
    if (!token) {
      throw new Error('Admin login succeeded but no user_token was found in the redirected URL');
    }
    return token;
  }

  get errorAlert() {
    return this.page.locator('.alert-danger, .text-danger');
  }
}
