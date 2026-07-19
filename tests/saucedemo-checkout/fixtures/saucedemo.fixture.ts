import { test as base, expect } from '@playwright/test';
import { LoginPage, BASE_URL } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutStepOnePage } from '../pages/checkout-step-one.page';
import { CheckoutStepTwoPage } from '../pages/checkout-step-two.page';
import { CheckoutCompletePage } from '../pages/checkout-complete.page';
import testData from '../test-data/saucedemo-checkout.json';

type SauceDemoFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutStepOnePage: CheckoutStepOnePage;
  checkoutStepTwoPage: CheckoutStepTwoPage;
  checkoutCompletePage: CheckoutCompletePage;
  /** Logs in as standard_user via the login page (the only persona in scope per the test plan). */
  loginAsStandardUser: () => Promise<void>;
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
  loginAsStandardUser: async ({ loginPage }, use) => {
    await use(async () => {
      await loginPage.open();
      await loginPage.login(testData.credentials.standardUser.username, testData.credentials.standardUser.password);
    });
  },
});

export { expect, BASE_URL, testData };

/** Generates a string of the given length made of repeated alphabetic characters, for boundary-length inputs. */
export function stringOfLength(length: number): string {
  return 'a'.repeat(length);
}
