// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect, testData, stringOfLength } from './fixtures/saucedemo.fixture';
import type { InventoryPage } from './pages/inventory.page';
import type { CartPage } from './pages/cart.page';

const { products, edgeCaseInputs } = testData;

/** Logs in, adds the Sauce Labs Backpack and clicks through to Checkout Information. */
async function goToCheckoutInfo(
  loginAsStandardUser: () => Promise<void>,
  inventoryPage: InventoryPage,
  cartPage: CartPage,
): Promise<void> {
  await loginAsStandardUser();
  await inventoryPage.addToCart(products.backpack.slug);
  await inventoryPage.header.openCart();
  await cartPage.checkout();
}

test.describe('Error Handling & Boundary Validation (AC5)', () => {
  // TC-CHECKOUT-EDGE-001: Special characters in First Name / Last Name are accepted without a validation error
  test('TC-CHECKOUT-EDGE-001 Special characters in First Name / Last Name are accepted without a validation error', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
  }) => {
    // 1. Enter the special-character test data into First Name and Last Name, valid Zip, click Continue
    await goToCheckoutInfo(loginAsStandardUser, inventoryPage, cartPage);
    await checkoutStepOnePage.fillAndContinue({
      firstName: edgeCaseInputs.specialCharsFirstName,
      lastName: edgeCaseInputs.specialCharsLastName,
      zip: '12345',
    });

    // Per current app behavior: no alphabetic-only validation is enforced; record as a behavior
    // confirmation and raise as a product gap if stricter validation is a desired business rule.
    await expect(checkoutStepOnePage.errorBanner).toHaveCount(0);
    await expect(checkoutStepTwoPage.page).toHaveURL(/\/checkout-step-two\.html$/);
  });

  // TC-CHECKOUT-EDGE-002: Non-numeric characters in the Zip/Postal Code field are accepted without a validation error
  test('TC-CHECKOUT-EDGE-002 Non-numeric characters in the Zip/Postal Code field are accepted without a validation error', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
  }) => {
    // 1. Enter valid First/Last Name, Zip = "abc!@#", click Continue
    await goToCheckoutInfo(loginAsStandardUser, inventoryPage, cartPage);
    await checkoutStepOnePage.fillAndContinue({ firstName: 'John', lastName: 'Doe', zip: edgeCaseInputs.nonNumericZip });

    await expect(checkoutStepOnePage.errorBanner).toHaveCount(0);
    await expect(checkoutStepTwoPage.page).toHaveURL(/\/checkout-step-two\.html$/);
  });

  // TC-CHECKOUT-EDGE-003: Very long input (500+ characters) in First Name is accepted without breaking the page
  test('TC-CHECKOUT-EDGE-003 Very long input (500+ characters) in First Name is accepted without breaking the page', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
  }) => {
    // 1. Enter the 500-character string into First Name, valid Last Name and Zip, click Continue
    await goToCheckoutInfo(loginAsStandardUser, inventoryPage, cartPage);
    const longFirstName = stringOfLength(edgeCaseInputs.longFirstNameLength);
    await checkoutStepOnePage.fillAndContinue({ firstName: longFirstName, lastName: 'Doe', zip: '12345' });

    // No client-side max-length error blocks submission; the app accepts the full string and proceeds.
    await expect(checkoutStepOnePage.errorBanner).toHaveCount(0);
    await expect(checkoutStepTwoPage.page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(checkoutStepTwoPage.pageTitle).toHaveText('Checkout: Overview');
  });

  // TC-CHECKOUT-EDGE-004: Zip/Postal Code boundary values (single digit, all zeros, 12-digit) are all accepted
  for (const zip of edgeCaseInputs.zipBoundaryValues) {
    test(`TC-CHECKOUT-EDGE-004 Zip/Postal Code boundary value "${zip}" is accepted`, async ({
      loginAsStandardUser,
      inventoryPage,
      cartPage,
      checkoutStepOnePage,
      checkoutStepTwoPage,
    }) => {
      // 1. Fill valid First/Last Name plus this Zip value and click Continue
      await goToCheckoutInfo(loginAsStandardUser, inventoryPage, cartPage);
      await checkoutStepOnePage.fillAndContinue({ firstName: 'John', lastName: 'Doe', zip });

      await expect(checkoutStepOnePage.errorBanner).toHaveCount(0);
      await expect(checkoutStepTwoPage.page).toHaveURL(/\/checkout-step-two\.html$/);
    });
  }

  // TC-CHECKOUT-EDGE-005: Leading/trailing whitespace around otherwise valid values is accepted as-is (no trim)
  test('TC-CHECKOUT-EDGE-005 Leading/trailing whitespace around otherwise valid values is accepted as-is', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
  }) => {
    // 1. Enter "  John  " (leading/trailing spaces) into First Name, valid Last Name/Zip, click Continue
    await goToCheckoutInfo(loginAsStandardUser, inventoryPage, cartPage);
    await checkoutStepOnePage.fillAndContinue({ firstName: edgeCaseInputs.paddedFirstName, lastName: 'Doe', zip: '12345' });

    // Confirms the app does not require or perform trimming before validating.
    await expect(checkoutStepOnePage.errorBanner).toHaveCount(0);
    await expect(checkoutStepTwoPage.page).toHaveURL(/\/checkout-step-two\.html$/);
  });
});
