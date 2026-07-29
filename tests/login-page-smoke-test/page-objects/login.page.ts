import { Locator } from '@playwright/test';
import { BasePage } from '../../_shared/base-page';

export class LoginPage extends BasePage {
  private readonly url = 'https://practicetestautomation.com/practice-test-login/';

  get pageHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Test login', level: 2 });
  }

  get usernameField(): Locator {
    return this.page.getByRole('textbox', { name: 'Username' });
  }

  get passwordField(): Locator {
    return this.page.getByRole('textbox', { name: 'Password' });
  }

  get submitButton(): Locator {
    return this.page.getByRole('button', { name: 'Submit' });
  }

  get errorMessage(): Locator {
    return this.page.locator('#error');
  }

  async navigate(): Promise<void> {
    await this.open(this.url);
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameField.fill(username);
    await this.passwordField.fill(password);
    await this.submitButton.click();
  }

  async loginWithEnter(username: string, password: string): Promise<void> {
    await this.usernameField.fill(username);
    await this.passwordField.fill(password);
    await this.submitButton.press('Enter');
  }

  async getPasswordFieldType(): Promise<string | null> {
    return await this.passwordField.getAttribute('type');
  }
}
