import { Page, Locator } from '@playwright/test';

/**
 * playwright.config.ts's baseURL points at the OpenCart install used by the rest of this
 * repo's suites. SauceDemo is a fully separate app, so every page object here navigates with
 * this absolute URL instead of relying on baseURL.
 */
export const BASE_URL = 'https://www.saucedemo.com';

export abstract class BasePage {
  constructor(public readonly page: Page) {}

  get errorBanner(): Locator {
    return this.page.locator('[data-test="error"]');
  }

  get errorDismissButton(): Locator {
    return this.page.locator('[data-test="error-button"]');
  }

  async dismissError(): Promise<void> {
    await this.errorDismissButton.click();
  }

  get cartBadge(): Locator {
    return this.page.locator('[data-test="shopping-cart-badge"]');
  }

  get cartLink(): Locator {
    return this.page.locator('[data-test="shopping-cart-link"]');
  }

  /**
   * The hamburger menu's visible icon (img) intercepts pointer events over the actual button
   * element, so clicks must target the underlying #react-burger-menu-btn / #react-burger-cross-btn
   * buttons directly rather than the data-test="open-menu"/"close-menu" images.
   */
  async openMenu(): Promise<void> {
    await this.page.locator('#react-burger-menu-btn').click();
  }

  async closeMenu(): Promise<void> {
    await this.page.locator('#react-burger-cross-btn').click();
  }

  get logoutSidebarLink(): Locator {
    return this.page.locator('[data-test="logout-sidebar-link"]');
  }

  get resetAppStateSidebarLink(): Locator {
    return this.page.locator('[data-test="reset-sidebar-link"]');
  }

  /** Clears the cart/app state in place (via the burger menu) to guarantee an empty-cart precondition. */
  async resetAppState(): Promise<void> {
    await this.openMenu();
    await this.resetAppStateSidebarLink.click();
    await this.closeMenu();
  }
}
