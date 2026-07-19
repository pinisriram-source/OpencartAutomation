import { Locator } from '@playwright/test';
import { BasePage, BASE_URL } from './BasePage';
import { InventoryPage } from './InventoryPage';
import { CheckoutStepOnePage } from './CheckoutStepOnePage';

export class CartPage extends BasePage {
  readonly heading = this.page.locator('[data-test="title"]');
  readonly qtyHeader = this.page.locator('[data-test="cart-quantity-label"]');
  readonly descHeader = this.page.locator('[data-test="cart-desc-label"]');
  readonly continueShoppingButton = this.page.locator('[data-test="continue-shopping"]');
  readonly checkoutButton = this.page.locator('[data-test="checkout"]');
  readonly cartItems = this.page.locator('[data-test="inventory-item"]');

  async goto(): Promise<void> {
    await this.page.goto(`${BASE_URL}/cart.html`);
  }

  /** Scopes a cart row by its product title link, the one reliably unique accessible-name element per row. */
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

  removeButton(productName: string): Locator {
    return this.itemRow(productName).getByRole('button', { name: 'Remove' });
  }

  async removeItem(productName: string): Promise<void> {
    await this.removeButton(productName).click();
  }

  async continueShopping(): Promise<InventoryPage> {
    await this.continueShoppingButton.click();
    return new InventoryPage(this.page);
  }

  async proceedToCheckout(): Promise<CheckoutStepOnePage> {
    await this.checkoutButton.click();
    return new CheckoutStepOnePage(this.page);
  }
}
