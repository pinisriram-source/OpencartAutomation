import { Locator } from '@playwright/test';
import { BasePage } from '../../_shared/base-page';

export class SecurePage extends BasePage {
  private readonly url = 'https://the-internet.herokuapp.com/secure';

  get pageHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Secure Area', level: 2 });
  }

  get welcomeMessage(): Locator {
    return this.page.getByRole('heading', { level: 4 });
  }

  get logoutButton(): Locator {
    return this.page.getByRole('link', { name: 'Logout' });
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

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }
}
