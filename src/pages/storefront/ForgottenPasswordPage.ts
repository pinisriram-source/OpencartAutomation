import { BasePage } from './BasePage';

export class ForgottenPasswordPage extends BasePage {
  async open(): Promise<void> {
    await this.gotoRoute('account/forgotten');
  }

  async requestReset(email: string): Promise<void> {
    await this.page.locator('#input-email').fill(email);
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }

  get backLink() {
    return this.page.getByRole('link', { name: 'Back' });
  }
}
