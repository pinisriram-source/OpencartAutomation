import { BasePage } from './BasePage';

export class VoucherPage extends BasePage {
  async open(): Promise<void> {
    await this.gotoRoute('account/voucher');
  }

  async fill(toName: string, toEmail: string, fromName: string, fromEmail: string, amount: string, message = ''): Promise<void> {
    await this.page.locator('#input-to-name').fill(toName);
    await this.page.locator('#input-to-email').fill(toEmail);
    await this.page.locator('#input-from-name').fill(fromName);
    await this.page.locator('#input-from-email').fill(fromEmail);
    await this.page.locator('#input-amount').fill(amount);
    if (message) {
      await this.page.locator('#input-message').fill(message);
    }
  }

  async addToCart(): Promise<void> {
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }
}
