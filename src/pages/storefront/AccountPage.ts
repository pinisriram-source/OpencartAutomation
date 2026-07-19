import { BasePage } from './BasePage';

export class AccountPage extends BasePage {
  async open(): Promise<void> {
    await this.gotoRoute('account/account');
  }

  async logout(): Promise<void> {
    await this.gotoRoute('account/logout');
  }

  async goToEditAccount(): Promise<void> {
    await this.gotoRoute('account/edit');
  }

  async editLastName(newLastName: string): Promise<void> {
    await this.page.locator('#input-lastname').fill(newLastName);
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }

  async goToPasswordPage(): Promise<void> {
    await this.gotoRoute('account/password');
  }

  async changePassword(newPassword: string): Promise<void> {
    await this.page.locator('#input-password').fill(newPassword);
    await this.page.locator('#input-confirm').fill(newPassword);
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }

  async goToNewsletter(): Promise<void> {
    await this.gotoRoute('account/newsletter');
  }

  async setNewsletterSubscription(subscribe: boolean): Promise<void> {
    await this.page.locator(`input[name="newsletter"][value="${subscribe ? 1 : 0}"]`).check();
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }
}
