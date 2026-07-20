import { Page, Locator } from '@playwright/test';

/**
 * Header controls shared by every authenticated SauceDemo page: cart icon/badge and the
 * hamburger side menu (Logout, Reset App State).
 */
export class AppHeader {
  readonly page: Page;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly openMenuButton: Locator;
  readonly closeMenuButton: Locator;
  readonly logoutLink: Locator;
  readonly resetAppStateLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    // The visible hamburger icon intercepts clicks; the underlying button (#react-burger-menu-btn)
    // must be targeted directly, otherwise Playwright's click resolves to the wrong element.
    this.openMenuButton = page.locator('#react-burger-menu-btn');
    this.closeMenuButton = page.locator('#react-burger-cross-btn');
    this.logoutLink = page.locator('[data-test="logout-sidebar-link"]');
    this.resetAppStateLink = page.locator('[data-test="reset-sidebar-link"]');
  }

  async goToCart(): Promise<void> {
    await this.cartLink.click();
  }

  async logout(): Promise<void> {
    await this.openMenuButton.click();
    await this.logoutLink.click();
  }

  async resetAppState(): Promise<void> {
    await this.openMenuButton.click();
    await this.resetAppStateLink.click();
  }
}
