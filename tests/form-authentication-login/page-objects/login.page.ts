import { Locator } from '@playwright/test';
import { BasePage } from '../../_shared/base-page';

export class LoginPage extends BasePage {
  private readonly url = 'https://the-internet.herokuapp.com/login';

  get pageHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Login Page', level: 2 });
  }

  get instructionText(): Locator {
    return this.page.getByRole('heading', { level: 4 });
  }

  get usernameField(): Locator {
    return this.page.getByRole('textbox', { name: 'Username' });
  }

  get passwordField(): Locator {
    return this.page.getByRole('textbox', { name: 'Password' });
  }

  get loginButton(): Locator {
    return this.page.getByRole('button', { name: 'Login' });
  }

  // Flash message uses #flash with no accessible role — CSS is the only
  // reliable locator since it must be asserted both visible and hidden.
  get flashMessage(): Locator {
    return this.page.locator('#flash');
  }

  get flashCloseButton(): Locator {
    return this.page.locator('#flash a.close');
  }

  async navigate(): Promise<void> {
    await this.open(this.url);
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameField.fill(username);
    await this.passwordField.fill(password);
    await this.loginButton.click();
  }
}
