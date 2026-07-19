import { Page } from '@playwright/test';

export class HeaderNav {
  constructor(private readonly page: Page) {}

  async search(keyword: string): Promise<void> {
    await this.page.getByPlaceholder('Search').fill(keyword);
    await this.page.locator('#search button').click();
  }

  async switchCurrency(code: 'EUR' | 'GBP' | 'USD'): Promise<void> {
    await this.page.locator('#form-currency button.dropdown-toggle').click();
    await this.page.locator(`#form-currency button[name="${code}"]`).click();
    await this.page.waitForLoadState('networkidle');
  }

  get cartTotalText() {
    return this.page.locator('#cart-total');
  }

  get wishlistTotalLink() {
    return this.page.locator('#wishlist-total');
  }

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
