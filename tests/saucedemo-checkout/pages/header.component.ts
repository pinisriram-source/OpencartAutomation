import { Page, Locator } from '@playwright/test';

/**
 * Header controls (cart icon/badge, hamburger side menu) that are present on every logged-in
 * SauceDemo page (inventory, cart, checkout-step-one/two, checkout-complete).
 */
export class HeaderComponent {
  readonly page: Page;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly menuButton: Locator;
  readonly logoutLink: Locator;
  readonly resetAppStateLink: Locator;
  readonly allItemsLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    // The clickable control is the <button id="react-burger-menu-btn"> that wraps the
    // data-test="open-menu" icon; clicking the icon itself is intercepted by the button.
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('[data-test="logout-sidebar-link"]');
    this.resetAppStateLink = page.locator('[data-test="reset-sidebar-link"]');
    this.allItemsLink = page.locator('[data-test="inventory-sidebar-link"]');
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  async logout(): Promise<void> {
    await this.menuButton.click();
    await this.logoutLink.click();
  }
}
