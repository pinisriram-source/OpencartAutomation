import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  async open(): Promise<void> {
    await this.gotoRoute('account/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.page.getByLabel('E-Mail Address').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Login' }).click();
  }

  // OpenCart's injected alert box carries no role/testid and its message
  // text varies (wrong credentials vs. account disabled etc.), so there's
  // no getBy* alternative -- CSS class is the only way to target it.
  get errorAlert() {
    return this.page.locator('.alert-danger');
  }
}
