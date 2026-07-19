import { Locator } from '@playwright/test';
import { BasePage, BASE_URL } from './BasePage';
import { InventoryPage } from './InventoryPage';
import { CheckoutCompletePage } from './CheckoutCompletePage';

export class CheckoutStepTwoPage extends BasePage {
  readonly heading = this.page.locator('[data-test="title"]');
  readonly cartItems = this.page.locator('[data-test="inventory-item"]');
  readonly paymentInfoLabel = this.page.locator('[data-test="payment-info-label"]');
  readonly paymentInfoValue = this.page.locator('[data-test="payment-info-value"]');
  readonly shippingInfoLabel = this.page.locator('[data-test="shipping-info-label"]');
  readonly shippingInfoValue = this.page.locator('[data-test="shipping-info-value"]');
  readonly subtotalLabel = this.page.locator('[data-test="subtotal-label"]');
  readonly taxLabel = this.page.locator('[data-test="tax-label"]');
  readonly totalLabel = this.page.locator('[data-test="total-label"]');
  readonly cancelButton = this.page.locator('[data-test="cancel"]');
  readonly finishButton = this.page.locator('[data-test="finish"]');

  async goto(): Promise<void> {
    await this.page.goto(`${BASE_URL}/checkout-step-two.html`);
  }

  private itemRow(productName: string): Locator {
    return this.cartItems.filter({ has: this.page.getByRole('link', { name: productName, exact: true }) });
  }

  itemQty(productName: string): Locator {
    return this.itemRow(productName).locator('[data-test="item-quantity"]');
  }

  itemNameLink(productName: string): Locator {
    return this.itemRow(productName).getByRole('link', { name: productName, exact: true });
  }

  itemDescription(productName: string): Locator {
    return this.itemRow(productName).locator('[data-test="inventory-item-desc"]');
  }

  itemPrice(productName: string): Locator {
    return this.itemRow(productName).locator('[data-test="inventory-item-price"]');
  }

  async cancel(): Promise<InventoryPage> {
    await this.cancelButton.click();
    return new InventoryPage(this.page);
  }

  async finish(): Promise<CheckoutCompletePage> {
    await this.finishButton.click();
    return new CheckoutCompletePage(this.page);
  }
}
