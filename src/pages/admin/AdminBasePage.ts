import { Page } from '@playwright/test';
import { env } from '../../utils/env';

/**
 * OpenCart 3.x admin routes every request through
 * admin/index.php?route=...&user_token=... . The sidebar is a nested
 * hover/accordion menu that's flaky to drive directly, so Page Objects
 * navigate straight to the route (exactly what clicking the corresponding
 * menu item would do) using the token captured at login.
 */
export abstract class AdminBasePage {
  constructor(public readonly page: Page, protected readonly userToken: string) {}

  protected async gotoAdminRoute(route: string): Promise<void> {
    await this.page.goto(`${env.adminBaseUrl}index.php?route=${route}&user_token=${this.userToken}`);
  }

  get successAlert() {
    return this.page.locator('.alert-success');
  }

  get permissionDenied() {
    return this.page.getByRole('heading', { name: /permission denied/i });
  }

  get saveButton() {
    return this.page.locator('button[data-original-title="Save"]').first();
  }

  async waitForSuccessAlert(): Promise<void> {
    await this.successAlert.waitFor({ state: 'visible' });
  }
}
