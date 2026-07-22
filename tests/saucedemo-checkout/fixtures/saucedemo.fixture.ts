import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutStepOnePage } from '../pages/checkout-step-one.page';
import { CheckoutStepTwoPage } from '../pages/checkout-step-two.page';
import { CheckoutCompletePage } from '../pages/checkout-complete.page';
import { ProductDetailPage } from '../pages/product-detail.page';

type SauceDemoFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutStepOnePage: CheckoutStepOnePage;
  checkoutStepTwoPage: CheckoutStepTwoPage;
  checkoutCompletePage: CheckoutCompletePage;
  productDetailPage: ProductDetailPage;
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
  productDetailPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page));
  },
});

export { expect };

/** Generates a string of the given length made of repeated alphabetic characters, for boundary-length inputs. */
export function stringOfLength(length: number): string {
  return 'a'.repeat(length);
}

/** Generates a string of the given length made of repeated digit characters, for numeric boundary inputs. */
export function digitsOfLength(length: number): string {
  return '1'.repeat(length);
}
