import { BasePage, BASE_URL } from './BasePage';
import { InventoryPage } from './InventoryPage';

export class CheckoutCompletePage extends BasePage {
  readonly heading = this.page.locator('[data-test="title"]');
  readonly completeHeader = this.page.locator('[data-test="complete-header"]');
  readonly completeText = this.page.locator('[data-test="complete-text"]');
  readonly ponyExpressImage = this.page.locator('[data-test="pony-express"]');
  readonly backHomeButton = this.page.locator('[data-test="back-to-products"]');

  async goto(): Promise<void> {
    await this.page.goto(`${BASE_URL}/checkout-complete.html`);
  }

  async backHome(): Promise<InventoryPage> {
    await this.backHomeButton.click();
    return new InventoryPage(this.page);
  }
}
