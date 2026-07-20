// spec: specs/saucedemo-checkout-test-plan.md (Suite 5: Error Handling and Field Validation)
// seed: tests/seed.spec.ts
import { test, expect, loginAsStandardUser } from './fixtures/saucedemo.fixture';
import products from './test-data/products.json';
import checkoutInfo from './test-data/checkout-info.json';
import messages from './test-data/messages.json';
import totals from './test-data/totals.json';

test.describe('Error Handling and Field Validation', () => {
  test('TC-CHECKOUT-ERROR-001 User cannot proceed past Step One until all three fields are non-empty', async ({
    loginPage,
    inventoryPage,
    checkoutInformationPage,
    checkoutOverviewPage,
  }) => {
    // 1. Preconditions: log in, add an item to cart, navigate to /checkout-step-one.html.
    await loginAsStandardUser(loginPage);
    await inventoryPage.addProductToCart(products.backpack.slug);
    await checkoutInformationPage.open();

    // 2. Click Continue with all fields empty.
    await checkoutInformationPage.clickContinue();
    await expect(checkoutInformationPage.errorBanner).toHaveText(messages.firstNameRequired);
    await expect(checkoutInformationPage.page).toHaveURL(/checkout-step-one\.html/);

    // 3. Fill only First Name, click Continue.
    await checkoutInformationPage.fillInformation({ firstName: checkoutInfo.valid.firstName });
    await checkoutInformationPage.clickContinue();
    await expect(checkoutInformationPage.errorBanner).toHaveText(messages.lastNameRequired);
    await expect(checkoutInformationPage.page).toHaveURL(/checkout-step-one\.html/);

    // 4. Fill Last Name also, click Continue.
    await checkoutInformationPage.fillInformation({ lastName: checkoutInfo.valid.lastName });
    await checkoutInformationPage.clickContinue();
    await expect(checkoutInformationPage.errorBanner).toHaveText(messages.postalCodeRequired);
    await expect(checkoutInformationPage.page).toHaveURL(/checkout-step-one\.html/);

    // 5. Fill Zip/Postal Code also, click Continue.
    await checkoutInformationPage.fillInformation({ postalCode: checkoutInfo.valid.postalCode });
    await checkoutInformationPage.clickContinue();
    await expect(checkoutOverviewPage.page).toHaveURL(/checkout-step-two\.html/);
  });

  test('TC-CHECKOUT-ERROR-002 Error banner text and visual treatment are correct and specific per missing field', async ({
    loginPage,
    inventoryPage,
    checkoutInformationPage,
  }) => {
    // 1. Preconditions: log in, add an item to cart, navigate to /checkout-step-one.html.
    await loginAsStandardUser(loginPage);
    await inventoryPage.addProductToCart(products.backpack.slug);
    await checkoutInformationPage.open();

    // 2a. Trigger the First Name required error.
    await checkoutInformationPage.submitInformation({
      lastName: checkoutInfo.valid.lastName,
      postalCode: checkoutInfo.valid.postalCode,
    });
    await expect(checkoutInformationPage.errorBanner).toHaveText(messages.firstNameRequired);
    // The error banner is rendered as a heading element, with a dismiss (X) control alongside it.
    await expect(checkoutInformationPage.page.getByRole('heading', { name: messages.firstNameRequired })).toBeVisible();
    await expect(checkoutInformationPage.errorCloseButton).toBeVisible();
    await expect(checkoutInformationPage.isFieldMarkedInvalid(checkoutInformationPage.firstNameInput)).resolves.toBe(true);
    await checkoutInformationPage.dismissError();

    // 2b. Trigger the Last Name required error.
    await checkoutInformationPage.fillInformation({ firstName: checkoutInfo.valid.firstName, lastName: '' });
    await checkoutInformationPage.clickContinue();
    await expect(checkoutInformationPage.errorBanner).toHaveText(messages.lastNameRequired);
    await expect(checkoutInformationPage.errorCloseButton).toBeVisible();
    await checkoutInformationPage.dismissError();

    // 2c. Trigger the Postal Code required error.
    await checkoutInformationPage.fillInformation({ lastName: checkoutInfo.valid.lastName, postalCode: '' });
    await checkoutInformationPage.clickContinue();
    await expect(checkoutInformationPage.errorBanner).toHaveText(messages.postalCodeRequired);
    await expect(checkoutInformationPage.errorCloseButton).toBeVisible();
  });

  test('TC-CHECKOUT-ERROR-003 Fixing the invalid field and resubmitting clears the error and proceeds', async ({
    loginPage,
    inventoryPage,
    checkoutInformationPage,
    checkoutOverviewPage,
  }) => {
    // 1. Preconditions: trigger 'Error: Postal Code is required' (First Name and Last Name filled, Zip empty).
    await loginAsStandardUser(loginPage);
    await inventoryPage.addProductToCart(products.backpack.slug);
    await checkoutInformationPage.open();
    await checkoutInformationPage.submitInformation({
      firstName: checkoutInfo.valid.firstName,
      lastName: checkoutInfo.valid.lastName,
    });
    await expect(checkoutInformationPage.errorBanner).toHaveText(messages.postalCodeRequired);

    // 2. Enter a valid Zip/Postal Code value.
    await checkoutInformationPage.fillInformation({ postalCode: checkoutInfo.valid.postalCode });

    // 3. Click 'Continue' again.
    await checkoutInformationPage.clickContinue();
    await expect(checkoutInformationPage.errorBanner).toHaveCount(0);
    await expect(checkoutOverviewPage.page).toHaveURL(/checkout-step-two\.html/);
  });

  test('TC-CHECKOUT-ERROR-004-EmptyCartThroughCheckout Proceeding through checkout with an empty cart is not blocked (confirmed business-rule gap vs. rule 3)', async ({
    loginPage,
    inventoryPage,
    cartPage,
    checkoutInformationPage,
    checkoutOverviewPage,
    checkoutCompletePage,
  }) => {
    // 1. Preconditions: log in as standard_user with an empty cart.
    await loginAsStandardUser(loginPage);
    await expect(inventoryPage.cartBadge).toHaveCount(0);
    await cartPage.open();
    await expect(cartPage.cartItems).toHaveCount(0);

    // 2. From the empty cart page, click 'Checkout'.
    await cartPage.goToCheckout();
    await expect(checkoutInformationPage.page).toHaveURL(/checkout-step-one\.html/);
    await expect(checkoutInformationPage.errorBanner).toHaveCount(0);

    // 3. Enter valid First Name/Last Name/Zip and click Continue.
    await checkoutInformationPage.submitInformation(checkoutInfo.valid);
    await expect(checkoutOverviewPage.page).toHaveURL(/checkout-step-two\.html/);
    await expect(checkoutOverviewPage.cartItems).toHaveCount(0);
    await expect(checkoutOverviewPage.subtotalLabel).toHaveText(`Item total: ${totals.emptyCart.itemTotal}`);
    await expect(checkoutOverviewPage.taxLabel).toHaveText(`Tax: ${totals.emptyCart.tax}`);
    await expect(checkoutOverviewPage.totalLabel).toHaveText(`Total: ${totals.emptyCart.total}`);

    // 4. Click 'Finish'.
    await checkoutOverviewPage.clickFinish();
    await expect(checkoutCompletePage.page).toHaveURL(/checkout-complete\.html/);
    await expect(checkoutCompletePage.completeHeader).toHaveText(messages.orderCompleteHeader);
  });
});
