import { BasePage } from './BasePage';
import { GuestCustomer } from '../../utils/randomData';

export class RegisterPage extends BasePage {
  async open(): Promise<void> {
    await this.gotoRoute('account/register');
  }

  async register(customer: GuestCustomer, opts: { subscribeNewsletter?: boolean } = {}): Promise<void> {
    await this.page.getByLabel('First Name').fill(customer.firstName);
    await this.page.getByLabel('Last Name').fill(customer.lastName);
    await this.page.getByLabel('E-Mail').fill(customer.email);
    await this.page.getByLabel('Telephone').fill(customer.telephone);
    await this.page.getByLabel('Password', { exact: true }).fill(customer.password);
    await this.page.getByLabel('Password Confirm').fill(customer.password);
    if (opts.subscribeNewsletter) {
      await this.page.getByRole('radio', { name: 'Yes' }).check();
    }
    // The "I have read and agree..." checkbox isn't wrapped in a <label>
    // (the surrounding text is loose, with an embedded Privacy Policy link),
    // so it has no accessible name -- getByRole('checkbox') with no name
    // filter is safe since it's the only checkbox on this form.
    await this.page.getByRole('checkbox').check();
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }

  get emailError() {
    return this.page.getByText(/e-mail address does not appear to be valid/i);
  }

  get successHeading() {
    return this.page.getByRole('heading', { name: /your account has been created/i });
  }
}
