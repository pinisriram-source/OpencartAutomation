import { Page, Locator } from '@playwright/test';
import { HeaderComponent } from './header.component';
import { BASE_URL } from './login.page';
import { itemRow, itemDescription, itemPrice, itemQuantity, itemNameLink } from './item-row.util';

export class CheckoutStepTwoPage {
  readonly page: Page;
  readonly header: HeaderComponent;
  readonly url = `${BASE_URL}/checkout-step-two.html`;
  readonly pageTitle: Locator;
  readonly cartItems: Locator;
  readonly paymentInfoLabel: Locator;
  readonly paymentInfoValue: Locator;
  readonly shippingInfoLabel: Locator;
  readonly shippingInfoValue: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly cancelButton: Locator;
  readonly finishButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new HeaderComponent(page);
    this.pageTitle = page.locator('[data-test="title"]');
    this.cartItems = page.locator('[data-test="inventory-item"]');
    this.paymentInfoLabel = page.locator('[data-test="payment-info-label"]');
    this.paymentInfoValue = page.locator('[data-test="payment-info-value"]');
    this.shippingInfoLabel = page.locator('[data-test="shipping-info-label"]');
    this.shippingInfoValue = page.locator('[data-test="shipping-info-value"]');
    this.subtotalLabel = page.locator('[data-test="subtotal-label"]');
    this.taxLabel = page.locator('[data-test="tax-label"]');
    this.totalLabel = page.locator('[data-test="total-label"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.finishButton = page.locator('[data-test="finish"]');
  }

  async open(): Promise<void> {
    await this.page.goto(this.url);
  }

  itemRow(productName: string): Locator {
    return itemRow(this.page, productName);
  }

  itemNameLink(productName: string): Locator {
    return itemNameLink(this.itemRow(productName));
  }

  itemDescription(productName: string): Locator {
    return itemDescription(this.itemRow(productName));
  }

  itemPrice(productName: string): Locator {
    return itemPrice(this.itemRow(productName));
  }

  itemQuantity(productName: string): Locator {
    return itemQuantity(this.itemRow(productName));
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }
}
