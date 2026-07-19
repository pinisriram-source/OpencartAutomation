import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  async open(): Promise<void> {
    await this.gotoRoute('account/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.page.locator('#input-email').fill(email);
    await this.page.locator('#input-password').fill(password);
    await this.page.getByRole('button', { name: 'Login' }).click();
  }

  get errorAlert() {
    return this.page.locator('.alert-danger');
  }
}
