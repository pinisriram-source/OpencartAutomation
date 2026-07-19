import { Page, Locator } from '@playwright/test';
import { HeaderComponent } from './header.component';
import { BASE_URL } from './login.page';

export class CheckoutCompletePage {
  readonly page: Page;
  readonly header: HeaderComponent;
  readonly url = `${BASE_URL}/checkout-complete.html`;
  readonly pageTitle: Locator;
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new HeaderComponent(page);
    this.pageTitle = page.locator('[data-test="title"]');
    this.completeHeader = page.locator('[data-test="complete-header"]');
    this.completeText = page.locator('[data-test="complete-text"]');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
  }

  async open(): Promise<void> {
    await this.page.goto(this.url);
  }

  async backHome(): Promise<void> {
    await this.backHomeButton.click();
  }
}
