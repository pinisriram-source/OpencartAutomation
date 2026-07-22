import { Page, Locator, expect } from '@playwright/test';

export class SuccessPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly successMessage: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Logged In Successfully' });
    this.successMessage = page.locator('.post-content');
    this.logoutLink = page.getByRole('link', { name: 'Log out' });
  }

  async verifySuccessfulLogin(username: string) {
    await expect(this.page).toHaveURL('https://practicetestautomation.com/logged-in-successfully/');
    await expect(this.page).toHaveTitle('Logged In Successfully | Practice Test Automation');
    await expect(this.heading).toBeVisible();
    await expect(this.successMessage).toContainText(`Congratulations ${username}. You successfully logged in!`);
    await expect(this.logoutLink).toBeVisible();
  }

  async verifyPageTitle() {
    await expect(this.page).toHaveTitle('Logged In Successfully | Practice Test Automation');
  }

  async verifyURL() {
    await expect(this.page).toHaveURL('https://practicetestautomation.com/logged-in-successfully/');
  }

  async verifyHeading() {
    await expect(this.heading).toBeVisible();
    await expect(this.heading).toHaveText('Logged In Successfully');
  }

  async verifySuccessMessage(username: string) {
    const expectedMessage = `Congratulations ${username}. You successfully logged in!`;
    await expect(this.successMessage).toContainText(expectedMessage);
  }

  async verifyLogoutLinkVisible() {
    await expect(this.logoutLink).toBeVisible();
  }

  async clickLogout() {
    await this.logoutLink.click();
  }
}
