// spec: specs/saucedemo-checkout-test-plan.md (section 5. Error Handling and Field Validation)
// seed: tests/seed.spec.ts

import { test, expect } from './fixtures/saucedemo.fixture';
import products from './test-data/products.json';
import customer from './test-data/customer.json';
import messages from './test-data/messages.json';

test.describe('Error Handling and Field Validation', () => {
  test('TC-CHECKOUT-ERROR-001 - User cannot proceed past Step One until all three fields are non-empty', async ({ loggedInPage, cartPage, checkoutStepOnePage }) => {
    // Preconditions: add an item to cart, navigate to /checkout-step-one.html.
    await loggedInPage.addProductToCart(products.backpack.id);
    await loggedInPage.goToCart();
    await cartPage.proceedToCheckout();

    // 1. Click Continue with all fields empty.
    await checkoutStepOnePage.continueCheckout();
    await expect(checkoutStepOnePage.errorBanner).toHaveText(messages.firstNameRequired);
    await expect(checkoutStepOnePage.page).toHaveURL(/\/checkout-step-one\.html$/);

    // 2. Fill only First Name, click Continue.
    await checkoutStepOnePage.firstNameInput.fill(customer.valid.firstName);
    await checkoutStepOnePage.continueCheckout();
    await expect(checkoutStepOnePage.errorBanner).toHaveText(messages.lastNameRequired);
    await expect(checkoutStepOnePage.page).toHaveURL(/\/checkout-step-one\.html$/);

    // 3. Fill Last Name also, click Continue.
    await checkoutStepOnePage.lastNameInput.fill(customer.valid.lastName);
    await checkoutStepOnePage.continueCheckout();
    await expect(checkoutStepOnePage.errorBanner).toHaveText(messages.postalCodeRequired);
    await expect(checkoutStepOnePage.page).toHaveURL(/\/checkout-step-one\.html$/);

    // 4. Fill Zip/Postal Code also, click Continue.
    await checkoutStepOnePage.postalCodeInput.fill(customer.valid.postalCode);
    await checkoutStepOnePage.continueCheckout();
    await expect(checkoutStepOnePage.page).toHaveURL(/\/checkout-step-two\.html$/);
  });

  test('TC-CHECKOUT-ERROR-002 - Error banner text and visibility are correct and specific per missing field', async ({ loggedInPage, cartPage, checkoutStepOnePage }) => {
    // Preconditions: add an item to cart, navigate to /checkout-step-one.html.
    await loggedInPage.addProductToCart(products.backpack.id);
    await loggedInPage.goToCart();
    await cartPage.proceedToCheckout();

    // 1a. Trigger First Name required error.
    await checkoutStepOnePage.fillInfo('', customer.valid.lastName, customer.valid.postalCode);
    await checkoutStepOnePage.continueCheckout();
    await expect(checkoutStepOnePage.errorBanner).toHaveText(messages.firstNameRequired);
    await expect(checkoutStepOnePage.errorDismissButton).toBeVisible();
    await expect(checkoutStepOnePage.firstNameInput).toHaveClass(/error/);
    await checkoutStepOnePage.dismissError();

    // 1b. Trigger Last Name required error.
    await checkoutStepOnePage.fillInfo(customer.valid.firstName, '', customer.valid.postalCode);
    await checkoutStepOnePage.continueCheckout();
    await expect(checkoutStepOnePage.errorBanner).toHaveText(messages.lastNameRequired);
    await expect(checkoutStepOnePage.errorDismissButton).toBeVisible();
    await expect(checkoutStepOnePage.lastNameInput).toHaveClass(/error/);
    await checkoutStepOnePage.dismissError();

    // 1c. Trigger Postal Code required error.
    await checkoutStepOnePage.fillInfo(customer.valid.firstName, customer.valid.lastName, '');
    await checkoutStepOnePage.continueCheckout();
    await expect(checkoutStepOnePage.errorBanner).toHaveText(messages.postalCodeRequired);
    await expect(checkoutStepOnePage.errorDismissButton).toBeVisible();
    await expect(checkoutStepOnePage.postalCodeInput).toHaveClass(/error/);
  });

  test('TC-CHECKOUT-ERROR-003 - Re-submitting after fixing the invalid field clears the error and proceeds', async ({ loggedInPage, cartPage, checkoutStepOnePage }) => {
    // Preconditions: trigger 'Error: Postal Code is required' (First Name and Last Name filled, Zip empty).
    await loggedInPage.addProductToCart(products.backpack.id);
    await loggedInPage.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutStepOnePage.fillInfo(customer.valid.firstName, customer.valid.lastName, '');
    await checkoutStepOnePage.continueCheckout();
    await expect(checkoutStepOnePage.errorBanner).toHaveText(messages.postalCodeRequired);

    // 1. Enter a valid Zip/Postal Code value.
    await checkoutStepOnePage.postalCodeInput.fill(customer.valid.postalCode);

    // 2. Click 'Continue' again.
    await checkoutStepOnePage.continueCheckout();
    await expect(checkoutStepOnePage.errorBanner).toBeHidden();
    await expect(checkoutStepOnePage.page).toHaveURL(/\/checkout-step-two\.html$/);
  });

  test('TC-CHECKOUT-ERROR-004-EmptyCartThroughCheckout - Proceeding through checkout with an empty cart is not blocked by the app', async ({ loggedInPage, cartPage, checkoutStepOnePage, checkoutStepTwoPage, checkoutCompletePage }) => {
    // Preconditions: standard_user with an empty cart.
    await expect(loggedInPage.cartBadge).toBeHidden();
    await loggedInPage.goToCart();
    await expect(cartPage.cartItems).toHaveCount(0);

    // 1. From the empty cart page, click 'Checkout'.
    // Documents a business-rule gap: the app allows proceeding to Step One despite an empty cart.
    await cartPage.proceedToCheckout();
    await expect(checkoutStepOnePage.page).toHaveURL(/\/checkout-step-one\.html$/);

    // 2. Enter valid First Name/Last Name/Zip and click Continue.
    await checkoutStepOnePage.fillInfo(customer.valid.firstName, customer.valid.lastName, customer.valid.postalCode);
    await checkoutStepOnePage.continueToOverview();
    await expect(checkoutStepTwoPage.cartItems).toHaveCount(0);
    await expect(checkoutStepTwoPage.subtotalLabel).toHaveText('Item total: $0');
    await expect(checkoutStepTwoPage.taxLabel).toHaveText('Tax: $0.00');
    await expect(checkoutStepTwoPage.totalLabel).toHaveText('Total: $0.00');

    // 3. Click 'Finish'.
    // Documents a confirmed gap versus the stated business rule: an order confirmation is produced
    // even though no items were ever purchased.
    await checkoutStepTwoPage.finish();
    await expect(checkoutCompletePage.page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(checkoutCompletePage.completeHeader).toHaveText(messages.thankYou);
  });
});
