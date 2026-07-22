import { Page, Locator } from '@playwright/test';
import { productSlug } from './product-slug.util';

export class InventoryPage {
  readonly page: Page;
  readonly url = 'https://www.saucedemo.com/inventory.html';

  readonly title: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly openMenuButton: Locator;
  readonly logoutLink: Locator;
  readonly resetAppStateLink: Locator;
  readonly inventoryItems: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('[data-test="title"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    // The visible hamburger icon (data-test="open-menu") is an <img> that intercepts pointer
    // events; the real clickable control layered underneath it is #react-burger-menu-btn.
    this.openMenuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('[data-test="logout-sidebar-link"]');
    this.resetAppStateLink = page.locator('[data-test="reset-sidebar-link"]');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
  }

  async open(): Promise<void> {
    await this.page.goto(this.url);
  }

  private itemRow(productName: string): Locator {
    return this.inventoryItems.filter({ hasText: productName });
  }

  addToCartButton(productName: string): Locator {
    return this.page.locator(`[data-test="add-to-cart-${productSlug(productName)}"]`);
  }

  removeButton(productName: string): Locator {
    return this.page.locator(`[data-test="remove-${productSlug(productName)}"]`);
  }

  description(productName: string): Locator {
    return this.itemRow(productName).locator('[data-test="inventory-item-desc"]');
  }

  price(productName: string): Locator {
    return this.itemRow(productName).locator('[data-test="inventory-item-price"]');
  }

  /** The clickable product-name link within a listing row; navigates to that product's detail page. */
  nameLink(productName: string): Locator {
    return this.itemRow(productName).locator('[data-test$="-title-link"]');
  }

  async addToCart(productName: string): Promise<void> {
    await this.addToCartButton(productName).click();
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  async openProductDetail(productName: string): Promise<void> {
    await this.nameLink(productName).click();
  }

  async openMenu(): Promise<void> {
    await this.openMenuButton.click();
  }

  async logout(): Promise<void> {
    await this.openMenu();
    await this.logoutLink.click();
  }

  /** Opens the side menu and clicks 'Reset App State', which clears the cart. */
  async resetAppState(): Promise<void> {
    await this.openMenu();
    await this.resetAppStateLink.click();
  }
}
