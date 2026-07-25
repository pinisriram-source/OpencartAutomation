import { Page, Locator } from '@playwright/test';

/**
 * Playwright's baseURL for this project includes a path (STOREFRONT_BASE_URL,
 * e.g. https://tutorialsninja.com/demo/). A goto('/some/path') resolves from
 * the domain ROOT per WHATWG URL rules, escaping the app entirely (e.g.
 * https://tutorialsninja.com/some/path instead of .../demo/some/path).
 * Every navigation must therefore be relative WITHOUT a leading slash.
 */
export abstract class BasePage {
  constructor(public readonly page: Page) {}

  async gotoRoute(route: string): Promise<void> {
    await this.page.goto(`index.php?route=${route}`);
  }

  async gotoHome(): Promise<void> {
    await this.page.goto('');
  }

  // OpenCart's injected alert box carries no role/testid and its message
  // text varies per action, so there's no getBy* alternative -- CSS class
  // is the only way to target it.
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
