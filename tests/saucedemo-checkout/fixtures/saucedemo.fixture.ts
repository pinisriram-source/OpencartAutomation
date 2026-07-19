import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutStepOnePage } from '../pages/CheckoutStepOnePage';
import { CheckoutStepTwoPage } from '../pages/CheckoutStepTwoPage';
import { CheckoutCompletePage } from '../pages/CheckoutCompletePage';
import users from '../test-data/users.json';

type SauceDemoFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutStepOnePage: CheckoutStepOnePage;
  checkoutStepTwoPage: CheckoutStepTwoPage;
  checkoutCompletePage: CheckoutCompletePage;
  /** Logs in as the standard user (fresh, cart-less session) and lands on the Products page. */
  loggedInPage: InventoryPage;
};

export const test = base.extend<SauceDemoFixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutStepOnePage: async ({ page }, use) => use(new CheckoutStepOnePage(page)),
  checkoutStepTwoPage: async ({ page }, use) => use(new CheckoutStepTwoPage(page)),
  checkoutCompletePage: async ({ page }, use) => use(new CheckoutCompletePage(page)),

  loggedInPage: async ({ page }, use) => {
    const login = new LoginPage(page);
    await login.goto();
    const inventory = await login.login(users.standard.username, users.standard.password);
    await use(inventory);
  },
});

export { expect };

/** Generates a string of the given length made of a repeated character, for boundary-length inputs. */
export function stringOfLength(length: number, char = 'a'): string {
  return char.repeat(length);
}

/** Generates a deterministic alphanumeric string of the given length, for boundary-length inputs. */
export function alphaNumericStringOfLength(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[i % chars.length];
  }
  return result;
}
