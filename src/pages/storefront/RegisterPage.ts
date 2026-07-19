import { BasePage } from './BasePage';
import { GuestCustomer } from '../../utils/randomData';

export class RegisterPage extends BasePage {
  async open(): Promise<void> {
    await this.gotoRoute('account/register');
  }

  async register(customer: GuestCustomer, opts: { subscribeNewsletter?: boolean } = {}): Promise<void> {
    await this.page.locator('#input-firstname').fill(customer.firstName);
    await this.page.locator('#input-lastname').fill(customer.lastName);
    await this.page.locator('#input-email').fill(customer.email);
    await this.page.locator('#input-telephone').fill(customer.telephone);
    await this.page.locator('#input-password').fill(customer.password);
    await this.page.locator('#input-confirm').fill(customer.password);
    if (opts.subscribeNewsletter) {
      await this.page.locator('input[name="newsletter"][value="1"]').check();
    }
    await this.page.locator('input[name="agree"]').check();
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }

  get emailError() {
    return this.page.locator('#input-email').locator('xpath=following-sibling::div[contains(@class,"text-danger")]');
  }

  get successHeading() {
    return this.page.getByRole('heading', { name: /your account has been created/i });
  }
}
