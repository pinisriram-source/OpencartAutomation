// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect, testData } from './fixtures/saucedemo.fixture';
import type { InventoryPage } from './pages/inventory.page';
import type { CartPage } from './pages/cart.page';

const { products, messages, validCheckoutInfo } = testData;

/** Logs in, adds the given product(s) to the cart and clicks through to Checkout Information. */
async function goToCheckoutInfo(
  loginAsStandardUser: () => Promise<void>,
  inventoryPage: InventoryPage,
  cartPage: CartPage,
  slugs: string[] = [products.backpack.slug],
): Promise<void> {
  await loginAsStandardUser();
  await inventoryPage.addMultipleToCart(slugs);
  await inventoryPage.header.openCart();
  await cartPage.checkout();
}

test.describe('Checkout Information Entry (AC2)', () => {
  // TC-CHECKOUT-INFO-001: Checkout Information page displays all three mandatory fields and action buttons
  test('TC-CHECKOUT-INFO-001 Checkout Information page displays all three mandatory fields and action buttons', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
  }) => {
    // 1. From Cart with 1 item, click "Checkout"
    await goToCheckoutInfo(loginAsStandardUser, inventoryPage, cartPage);

    await expect(checkoutStepOnePage.page).toHaveURL(/\/checkout-step-one\.html$/);
    await expect(checkoutStepOnePage.firstNameInput).toBeVisible();
    await expect(checkoutStepOnePage.firstNameInput).toHaveValue('');
    await expect(checkoutStepOnePage.lastNameInput).toBeVisible();
    await expect(checkoutStepOnePage.lastNameInput).toHaveValue('');
    await expect(checkoutStepOnePage.postalCodeInput).toBeVisible();
    await expect(checkoutStepOnePage.postalCodeInput).toHaveValue('');
    await expect(checkoutStepOnePage.cancelButton).toBeVisible();
    await expect(checkoutStepOnePage.continueButton).toBeVisible();
  });

  // TC-CHECKOUT-INFO-002: Submitting with all fields empty shows "First Name is required" error
  test('TC-CHECKOUT-INFO-002 Submitting with all fields empty shows "First Name is required" error', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
  }) => {
    // 1. Leave First Name, Last Name and Zip/Postal Code empty and click "Continue"
    await goToCheckoutInfo(loginAsStandardUser, inventoryPage, cartPage);
    await checkoutStepOnePage.continue();

    await expect(checkoutStepOnePage.page).toHaveURL(/\/checkout-step-one\.html$/);
    await expect(checkoutStepOnePage.errorBanner).toHaveText(messages.firstNameRequired);
    await expect(checkoutStepOnePage.firstNameInput).toHaveClass(/error/);
  });

  // TC-CHECKOUT-INFO-003: Submitting with only First Name filled shows "Last Name is required" error
  test('TC-CHECKOUT-INFO-003 Submitting with only First Name filled shows "Last Name is required" error', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
  }) => {
    // 1. Fill First Name = "John"; leave Last Name and Zip empty; click "Continue"
    await goToCheckoutInfo(loginAsStandardUser, inventoryPage, cartPage);
    await checkoutStepOnePage.fill({ firstName: 'John' });
    await checkoutStepOnePage.continue();

    await expect(checkoutStepOnePage.errorBanner).toHaveText(messages.lastNameRequired);
    await expect(checkoutStepOnePage.firstNameInput).toHaveValue('John');
  });

  // TC-CHECKOUT-INFO-004: Submitting with First and Last Name filled, Zip empty shows "Postal Code is required" error
  test('TC-CHECKOUT-INFO-004 Submitting with First and Last Name filled, Zip empty shows "Postal Code is required" error', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
  }) => {
    // 1. Fill First Name = "John", Last Name = "Doe"; leave Zip empty; click "Continue"
    await goToCheckoutInfo(loginAsStandardUser, inventoryPage, cartPage);
    await checkoutStepOnePage.fill({ firstName: 'John', lastName: 'Doe' });
    await checkoutStepOnePage.continue();

    await expect(checkoutStepOnePage.errorBanner).toHaveText(messages.postalCodeRequired);
    await expect(checkoutStepOnePage.firstNameInput).toHaveValue('John');
    await expect(checkoutStepOnePage.lastNameInput).toHaveValue('Doe');
  });

  // TC-CHECKOUT-INFO-005: Submitting all three valid fields proceeds to the Overview page (happy path)
  test('TC-CHECKOUT-INFO-005 Submitting all three valid fields proceeds to the Overview page', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
  }) => {
    // 1. Fill First Name = "John", Last Name = "Doe", Zip = "12345"; click "Continue"
    await goToCheckoutInfo(loginAsStandardUser, inventoryPage, cartPage);
    await checkoutStepOnePage.fillAndContinue(validCheckoutInfo);

    await expect(checkoutStepOnePage.errorBanner).toHaveCount(0);
    await expect(checkoutStepTwoPage.page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(checkoutStepTwoPage.pageTitle).toHaveText('Checkout: Overview');
  });

  // TC-CHECKOUT-INFO-006: Dismissing the validation error banner via its close (X) icon
  test('TC-CHECKOUT-INFO-006 Dismissing the validation error banner via its close (X) icon', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
  }) => {
    // 1. Click "Continue" with all fields empty to trigger the "First Name is required" error
    await goToCheckoutInfo(loginAsStandardUser, inventoryPage, cartPage);
    await checkoutStepOnePage.continue();
    await expect(checkoutStepOnePage.errorBanner).toBeVisible();
    await expect(checkoutStepOnePage.errorCloseButton).toBeVisible();

    // 2. Click the close (X) icon on the error banner
    await checkoutStepOnePage.errorCloseButton.click();
    await expect(checkoutStepOnePage.errorBanner).toHaveCount(0);
    await expect(checkoutStepOnePage.firstNameInput).toHaveValue('');
  });

  // TC-CHECKOUT-INFO-007: Cancel button on Checkout Information returns to Cart with items intact
  test('TC-CHECKOUT-INFO-007 Cancel button on Checkout Information returns to Cart with items intact', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
  }) => {
    // 1. From Cart (2 items) click "Checkout" to reach /checkout-step-one.html
    await goToCheckoutInfo(loginAsStandardUser, inventoryPage, cartPage, [products.backpack.slug, products.bikeLight.slug]);
    await expect(checkoutStepOnePage.pageTitle).toHaveText('Checkout: Your Information');

    // 2. Click "Cancel"
    await checkoutStepOnePage.cancel();
    await expect(cartPage.page).toHaveURL(/\/cart\.html$/);
    await expect(cartPage.cartItems).toHaveCount(2);
    await expect(cartPage.itemPrice(products.backpack.name)).toHaveText(products.backpack.price);
    await expect(cartPage.itemPrice(products.bikeLight.name)).toHaveText(products.bikeLight.price);
    await expect(cartPage.header.cartBadge).toHaveText('2');
  });

  // TC-CHECKOUT-INFO-008: Unauthenticated user cannot access Checkout Information page directly (negative, access control)
  test('TC-CHECKOUT-INFO-008 Unauthenticated user cannot access Checkout Information page directly', async ({
    loginPage,
    checkoutStepOnePage,
  }) => {
    // 1. Without logging in, navigate directly to https://www.saucedemo.com/checkout-step-one.html
    await checkoutStepOnePage.open();

    await expect(loginPage.page).toHaveURL(loginPage.url);
    await expect(loginPage.errorBanner).toHaveText(messages.loginRequired.checkoutStepOne);
  });

  // TC-CHECKOUT-INFO-009: Field-required errors surface one at a time in First Name -> Last Name -> Postal Code order
  test('TC-CHECKOUT-INFO-009 Field-required errors surface one at a time in First Name -> Last Name -> Postal Code order', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
  }) => {
    // 1. On a blank form, click Continue
    await goToCheckoutInfo(loginAsStandardUser, inventoryPage, cartPage);
    await checkoutStepOnePage.continue();
    await expect(checkoutStepOnePage.errorBanner).toHaveText(messages.firstNameRequired);

    // 2. Fill First Name only, click Continue
    await checkoutStepOnePage.fill({ firstName: 'John' });
    await checkoutStepOnePage.continue();
    await expect(checkoutStepOnePage.errorBanner).toHaveText(messages.lastNameRequired);

    // 3. Fill Last Name, click Continue
    await checkoutStepOnePage.fill({ lastName: 'Doe' });
    await checkoutStepOnePage.continue();
    await expect(checkoutStepOnePage.errorBanner).toHaveText(messages.postalCodeRequired);

    // 4. Fill Zip/Postal Code, click Continue
    await checkoutStepOnePage.fill({ zip: '12345' });
    await checkoutStepOnePage.continue();
    await expect(checkoutStepOnePage.errorBanner).toHaveCount(0);
    await expect(checkoutStepTwoPage.page).toHaveURL(/\/checkout-step-two\.html$/);
  });

  // TC-CHECKOUT-INFO-010: Whitespace-only value in First Name incorrectly satisfies the "required" check (edge case / data-quality gap)
  test('TC-CHECKOUT-INFO-010 Whitespace-only value in First Name incorrectly satisfies the "required" check', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
  }) => {
    // 1. Enter three space characters into First Name, valid Last Name and Zip, click Continue
    await goToCheckoutInfo(loginAsStandardUser, inventoryPage, cartPage);
    await checkoutStepOnePage.fillAndContinue({ firstName: testData.edgeCaseInputs.whitespaceOnlyFirstName, lastName: 'Doe', zip: '12345' });

    // Known gap (see plan notes): a whitespace-only value should arguably not satisfy a mandatory-field rule,
    // but the app currently accepts it and proceeds — flagged here for product-owner confirmation.
    await expect(checkoutStepOnePage.errorBanner).toHaveCount(0);
    await expect(checkoutStepTwoPage.page).toHaveURL(/\/checkout-step-two\.html$/);
  });
});
