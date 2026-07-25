import { Page } from '@playwright/test';

export class HeaderNav {
  constructor(private readonly page: Page) {}

  async search(keyword: string): Promise<void> {
    await this.page.getByPlaceholder('Search').fill(keyword);
    // The search button is icon-only with no accessible name, but it's the
    // only button inside #search, so scoping there makes a role-only,
    // unnamed match safe.
    await this.page.locator('#search').getByRole('button').click();
  }

  async switchCurrency(code: 'EUR' | 'GBP' | 'USD'): Promise<void> {
    const currencyName = { EUR: 'Euro', GBP: 'Pound Sterling', USD: 'US Dollar' }[code];
    await this.page.getByRole('button', { name: /currency/i }).click();
    await this.page.getByRole('button', { name: currencyName }).click();
    await this.page.waitForLoadState('networkidle');
  }

  // Both totals render dynamic text ("0 item(s) - $0.00", "Wish List (0)")
  // that changes with cart/wishlist contents, so a stable name-based
  // getByRole match isn't practical -- these stable element IDs are what's
  // actually being asserted against (the current total), not a styling hook.
  get cartTotalText() {
    return this.page.locator('#cart-total');
  }

  get wishlistTotalLink() {
    return this.page.locator('#wishlist-total');
  }

  // getByRole('link', { name: /my account/i }) matches 2 elements page-wide
  // (this dropdown toggle plus another nav link) -- title is the only
  // attribute that uniquely identifies this one.
  async openMyAccountMenu(): Promise<void> {
    await this.page.locator('a[title="My Account"]').click();
  }

  async goToRegister(): Promise<void> {
    await this.openMyAccountMenu();
    await this.page.getByRole('link', { name: 'Register' }).click();
  }

  async goToLogin(): Promise<void> {
    await this.openMyAccountMenu();
    await this.page.getByRole('link', { name: 'Login', exact: true }).click();
  }

  async goToCartPage(): Promise<void> {
    await this.page.getByRole('link', { name: 'Shopping Cart' }).first().click();
  }

  async goToCheckout(): Promise<void> {
    await this.page.getByRole('link', { name: 'Checkout', exact: true }).click();
  }
}
