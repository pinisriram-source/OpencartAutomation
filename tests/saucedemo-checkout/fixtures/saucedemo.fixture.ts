import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutStepOnePage } from '../pages/CheckoutStepOnePage';
import { CheckoutStepTwoPage } from '../pages/CheckoutStepTwoPage';
import { CheckoutCompletePage } from '../pages/CheckoutCompletePage';

type SauceDemoFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutStepOnePage: CheckoutStepOnePage;
  checkoutStepTwoPage: CheckoutStepTwoPage;
  checkoutCompletePage: CheckoutCompletePage;
};

export const test = base.extend<SauceDemoFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutStepOnePage: async ({ page }, use) => {
    await use(new CheckoutStepOnePage(page));
  },
  checkoutStepTwoPage: async ({ page }, use) => {
    await use(new CheckoutStepTwoPage(page));
  },
  checkoutCompletePage: async ({ page }, use) => {
    await use(new CheckoutCompletePage(page));
  },
});

export { expect };

export const SAUCEDEMO_BASE_URL = 'https://www.saucedemo.com';

/** Only account exercised by this suite; the same credentials are used across all 33 test cases. */
export const CREDENTIALS = { username: 'standard_user', password: 'secret_sauce' };

/** Generates a repeated-character string of the given length, for boundary-length input test cases. */
export function stringOfLength(length: number, char = 'a'): string {
  return char.repeat(length);
}

/** Builds the exact "Epic sadface" access-control error text SauceDemo shows for a given guarded path. */
export function unauthenticatedErrorMessage(path: string): string {
  return `Epic sadface: You can only access '${path}' when you are logged in.`;
}

/** Logs in as standard_user and waits for the redirect to the Products (inventory) page. */
export async function loginAsStandardUser(loginPage: LoginPage): Promise<void> {
  await loginPage.open();
  await loginPage.login(CREDENTIALS.username, CREDENTIALS.password);
  await loginPage.page.waitForURL(/inventory\.html/);
}
