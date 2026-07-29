import { Locator } from '@playwright/test';
import { BasePage } from '../../_shared/base-page';

export class SuccessPage extends BasePage {
  private readonly url = 'https://practicetestautomation.com/logged-in-successfully/';

  get pageHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Logged In Successfully', level: 1 });
  }

  get successMessage(): Locator {
    return this.page.locator('strong');
  }

  get logoutLink(): Locator {
    return this.page.getByRole('link', { name: 'Log out' });
  }

  async navigate(): Promise<void> {
    await this.open(this.url);
  }

  async logout(): Promise<void> {
    await this.logoutLink.click();
  }

  async getSuccessMessageText(): Promise<string> {
    return await this.successMessage.textContent() || '';
  }
}
