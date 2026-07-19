import { Page, Locator } from '@playwright/test';

/**
 * Playwright's baseURL for this project includes a path
 * (http://localhost/opencart/upload/). A goto('/some/path') resolves from
 * the domain ROOT per WHATWG URL rules, escaping the app entirely (lands on
 * XAMPP's welcome page). Every navigation must therefore be relative
 * WITHOUT a leading slash.
 */
export abstract class BasePage {
  constructor(public readonly page: Page) {}

  async gotoRoute(route: string): Promise<void> {
    await this.page.goto(`index.php?route=${route}`);
  }

  async gotoHome(): Promise<void> {
    await this.page.goto('');
  }

  get successAlert(): Locator {
    return this.page.locator('.alert-success');
  }

  get dangerAlert(): Locator {
    return this.page.locator('.alert-danger');
  }

  async waitForSuccessAlert(): Promise<string> {
    await this.successAlert.waitFor({ state: 'visible' });
    return (await this.successAlert.textContent()) ?? '';
  }
}
