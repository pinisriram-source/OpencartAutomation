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
    await this.page.getByLabel('Last Name').fill(newLastName);
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }

  async goToPasswordPage(): Promise<void> {
    await this.gotoRoute('account/password');
  }

  async changePassword(newPassword: string): Promise<void> {
    await this.page.getByLabel('Password', { exact: true }).fill(newPassword);
    await this.page.getByLabel('Password Confirm').fill(newPassword);
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }

  async goToNewsletter(): Promise<void> {
    await this.gotoRoute('account/newsletter');
  }

  async setNewsletterSubscription(subscribe: boolean): Promise<void> {
    await this.page.getByRole('radio', { name: subscribe ? 'Yes' : 'No' }).check();
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }
}
