// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/checkout/seed.spec.ts

import { test, expect, loginAsStandardUser, stringOfLength, unauthenticatedErrorMessage } from './fixtures/saucedemo.fixture';
import products from './test-data/products.json';
import checkoutInfo from './test-data/checkout-info.json';

test.describe('Checkout Information Entry (AC2)', () => {
  test.beforeEach(async ({ loginPage, inventoryPage }) => {
    await loginAsStandardUser(loginPage);
    await inventoryPage.addToCart(products.sauceLabsBackpack.slug);
    await inventoryPage.header.goToCart();
  });

  test('TC-CHECKOUT-007 valid checkout information (all fields filled) proceeds to Overview', async ({
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
  }) => {
    await cartPage.checkoutButton.click();

    // 1-3. Enter First Name, Last Name and Zip/Postal Code
    await checkoutStepOnePage.fill(checkoutInfo.valid);
    // 4. Click 'Continue'
    await checkoutStepOnePage.continueCheckout();

    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);
    await expect(checkoutStepTwoPage.pageTitle).toHaveText('Checkout: Overview');
  });

  test("TC-CHECKOUT-008-EmptyFirstName empty First Name (all fields blank) shows 'First Name is required' error", async ({
    cartPage,
    checkoutStepOnePage,
  }) => {
    await cartPage.checkoutButton.click();

    // 1-2. Leave all fields blank and click 'Continue'
    await checkoutStepOnePage.continueCheckout();

    await expect(checkoutStepOnePage.page).toHaveURL(/checkout-step-one\.html/);
    await expect(checkoutStepOnePage.errorBanner).toHaveText(checkoutInfo.messages.firstNameRequired);
    await expect(checkoutStepOnePage.firstNameInput).toHaveClass(/input_error/);
  });

  test("TC-CHECKOUT-009-EmptyLastName empty Last Name (First Name provided) shows 'Last Name is required' error", async ({
    cartPage,
    checkoutStepOnePage,
  }) => {
    await cartPage.checkoutButton.click();

    // 1. Enter 'John' in First Name; leave Last Name and Zip/Postal Code blank
    await checkoutStepOnePage.fill({ firstName: 'John' });
    // 2. Click 'Continue'
    await checkoutStepOnePage.continueCheckout();

    await expect(checkoutStepOnePage.page).toHaveURL(/checkout-step-one\.html/);
    await expect(checkoutStepOnePage.errorBanner).toHaveText(checkoutInfo.messages.lastNameRequired);
    await expect(checkoutStepOnePage.lastNameInput).toHaveClass(/input_error/);
  });

  test("TC-CHECKOUT-010-EmptyZip empty Zip/Postal Code (First+Last provided) shows 'Postal Code is required' error", async ({
    cartPage,
    checkoutStepOnePage,
  }) => {
    await cartPage.checkoutButton.click();

    // 1. Enter 'John' in First Name and 'Doe' in Last Name; leave Zip/Postal Code blank
    await checkoutStepOnePage.fill({ firstName: 'John', lastName: 'Doe' });
    // 2. Click 'Continue'
    await checkoutStepOnePage.continueCheckout();

    await expect(checkoutStepOnePage.page).toHaveURL(/checkout-step-one\.html/);
    await expect(checkoutStepOnePage.errorBanner).toHaveText(checkoutInfo.messages.postalCodeRequired);
    await expect(checkoutStepOnePage.postalCodeInput).toHaveClass(/input_error/);
  });

  test('TC-CHECKOUT-011-AllFieldsEmpty submitting with all three fields empty surfaces only the First Name error (short-circuit validation)', async ({
    cartPage,
    checkoutStepOnePage,
  }) => {
    await cartPage.checkoutButton.click();

    // 1. With all three fields empty, click 'Continue'
    await checkoutStepOnePage.continueCheckout();

    // Exactly one error banner is shown; Last Name / Postal Code errors are never shown alongside it because
    // validation short-circuits on the first invalid field instead of aggregating all failures.
    await expect(checkoutStepOnePage.errorBanner).toHaveCount(1);
    await expect(checkoutStepOnePage.errorBanner).toHaveText(checkoutInfo.messages.firstNameRequired);
  });

  test("TC-CHECKOUT-012 error banner can be dismissed via its close ('X') icon", async ({
    cartPage,
    checkoutStepOnePage,
  }) => {
    await cartPage.checkoutButton.click();

    // 1. Click 'Continue' with all fields empty to trigger 'Error: First Name is required'
    await checkoutStepOnePage.continueCheckout();
    await expect(checkoutStepOnePage.errorBanner).toBeVisible();

    // 2. Click the 'X' close icon on the error banner
    await checkoutStepOnePage.errorCloseButton.click();

    await expect(checkoutStepOnePage.errorBanner).toHaveCount(0);
    await expect(checkoutStepOnePage.firstNameInput).toBeVisible();
    await expect(checkoutStepOnePage.lastNameInput).toBeVisible();
    await expect(checkoutStepOnePage.postalCodeInput).toBeVisible();
    await expect(checkoutStepOnePage.continueButton).toBeVisible();
  });

  test('TC-CHECKOUT-013-LongInput very long input (300+ characters) in First Name is accepted without a length validation error (boundary)', async ({
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
  }) => {
    const longFirstName = stringOfLength(checkoutInfo.boundary.longNameLength);
    await cartPage.checkoutButton.click();

    // 1. Enter a 300-character alphabetic string into First Name
    await checkoutStepOnePage.firstNameInput.fill(longFirstName);
    await expect(checkoutStepOnePage.firstNameInput).toHaveValue(longFirstName);

    // 2. Enter 'Doe' into Last Name and '12345' into Zip/Postal Code
    await checkoutStepOnePage.fill({ lastName: 'Doe', postalCode: '12345' });

    // 3. Click 'Continue'
    await checkoutStepOnePage.continueCheckout();

    await expect(checkoutStepOnePage.errorBanner).toHaveCount(0);
    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);
  });

  test('TC-CHECKOUT-014-SpecialChars special characters and script tags in Name fields are accepted as literal text with no script execution and no reflected output', async ({
    page,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    checkoutCompletePage,
  }) => {
    let dialogFired = false;
    page.on('dialog', async (dialog) => {
      dialogFired = true;
      await dialog.dismiss();
    });

    await cartPage.checkoutButton.click();

    // 1. Enter the script/special-character string into First Name, "O'Brien-Smith" into Last Name, '12345' into Zip
    await checkoutStepOnePage.fill(checkoutInfo.special);

    // 2. Click 'Continue'
    await checkoutStepOnePage.continueCheckout();

    await expect(checkoutStepOnePage.errorBanner).toHaveCount(0);
    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);

    // 3. Inspect the Checkout Overview page and, after finishing, the Checkout Complete page
    await expect(page.getByText(checkoutInfo.special.firstName)).toHaveCount(0);
    await expect(page.getByText(checkoutInfo.special.lastName)).toHaveCount(0);

    await checkoutStepTwoPage.finish();
    await expect(checkoutCompletePage.page).toHaveURL(/checkout-complete\.html/);
    await expect(page.getByText(checkoutInfo.special.firstName)).toHaveCount(0);
    await expect(page.getByText(checkoutInfo.special.lastName)).toHaveCount(0);

    expect(dialogFired).toBe(false);
  });

  test('TC-CHECKOUT-015-WhitespaceOnly whitespace-only First Name bypasses required-field validation (documented validation gap)', async ({
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
  }) => {
    await cartPage.checkoutButton.click();

    // 1. Enter three spaces into First Name, 'Test' into Last Name, '12345' into Zip
    await checkoutStepOnePage.fill(checkoutInfo.whitespaceFirstName);
    await expect(checkoutStepOnePage.firstNameInput).toHaveValue(checkoutInfo.whitespaceFirstName.firstName);

    // 2. Click 'Continue'
    await checkoutStepOnePage.continueCheckout();

    // ACTUAL BEHAVIOR (documented validation gap): no 'First Name is required' error is raised despite the
    // field having no meaningful trimmed content -- required-field validation checks only string length.
    await expect(checkoutStepOnePage.errorBanner).toHaveCount(0);
    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);
  });

  test('TC-CHECKOUT-016-NonNumericZip non-numeric / alphanumeric Zip/Postal Code is accepted without format validation', async ({
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
  }) => {
    await cartPage.checkoutButton.click();

    // 1. Enter 'Jane' in First Name, 'Smith' in Last Name, 'ABC-123' in Zip/Postal Code
    await checkoutStepOnePage.fill(checkoutInfo.nonNumericZip);

    // 2. Click 'Continue'
    await checkoutStepOnePage.continueCheckout();

    await expect(checkoutStepOnePage.errorBanner).toHaveCount(0);
    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);
  });

  test("TC-CHECKOUT-017 'Cancel' button on Checkout Information returns the user to the Cart page", async ({
    cartPage,
    checkoutStepOnePage,
  }) => {
    await cartPage.checkoutButton.click();

    // 1. Click the 'Cancel' button (regardless of whether fields are filled)
    await checkoutStepOnePage.cancel();

    await expect(cartPage.page).toHaveURL(/cart\.html/);
    await expect(cartPage.pageTitle).toHaveText('Your Cart');
    await expect(cartPage.itemByName(products.sauceLabsBackpack.name)).toHaveCount(1);
  });

  test('TC-CHECKOUT-018-Unauthenticated direct navigation to /checkout-step-one.html while logged out redirects to Login with an explicit error', async ({
    page,
    cartPage,
    loginPage,
  }) => {
    // 1. Confirm no active session by using Logout from the sidebar menu (overrides the logged-in state
    // left by beforeEach, per this test's precondition)
    await cartPage.header.logout();
    await expect(loginPage.page).toHaveURL('https://www.saucedemo.com/');

    // 2. Directly navigate the browser to https://www.saucedemo.com/checkout-step-one.html
    await page.goto('https://www.saucedemo.com/checkout-step-one.html');

    await expect(loginPage.page).toHaveURL('https://www.saucedemo.com/');
    await expect(loginPage.errorBanner).toHaveText(unauthenticatedErrorMessage('/checkout-step-one.html'));
  });
});
