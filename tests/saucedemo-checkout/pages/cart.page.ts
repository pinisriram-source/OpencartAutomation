import { Page, Locator } from '@playwright/test';
import { HeaderComponent } from './header.component';
import { BASE_URL } from './login.page';
import { itemRow, itemDescription, itemPrice, itemQuantity, itemRemoveButton, itemNameLink } from './item-row.util';

export class CartPage {
  readonly page: Page;
  readonly header: HeaderComponent;
  readonly url = `${BASE_URL}/cart.html`;
  readonly pageTitle: Locator;
  readonly cartItems: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new HeaderComponent(page);
    this.pageTitle = page.locator('[data-test="title"]');
    this.cartItems = page.locator('[data-test="inventory-item"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
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

  itemRemoveButton(productName: string): Locator {
    return itemRemoveButton(this.itemRow(productName));
  }

  async removeItem(productName: string): Promise<void> {
    await this.itemRemoveButton(productName).click();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
