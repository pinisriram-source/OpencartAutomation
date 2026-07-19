// spec: specs/saucedemo-checkout-test-plan.md (section 2. Checkout Information Entry)
// seed: tests/seed.spec.ts

import { test, expect, stringOfLength, alphaNumericStringOfLength } from './fixtures/saucedemo.fixture';
import { LoginPage } from './pages/LoginPage';
import products from './test-data/products.json';
import customer from './test-data/customer.json';
import messages from './test-data/messages.json';

test.describe('Checkout Information Entry', () => {
  test('TC-CHECKOUT-INFO-001 - Checkout Information page displays required fields', async ({ loggedInPage, cartPage, checkoutStepOnePage }) => {
    // Preconditions: add an item to cart, click Checkout from the cart page.
    await loggedInPage.addProductToCart(products.backpack.id);
    await loggedInPage.goToCart();
    await cartPage.proceedToCheckout();
    await expect(checkoutStepOnePage.page).toHaveURL(/\/checkout-step-one\.html$/);

    // 1. Inspect the form.
    await expect(checkoutStepOnePage.heading).toHaveText('Checkout: Your Information');
    await expect(checkoutStepOnePage.firstNameInput).toBeVisible();
    await expect(checkoutStepOnePage.firstNameInput).toBeEmpty();
    await expect(checkoutStepOnePage.lastNameInput).toBeVisible();
    await expect(checkoutStepOnePage.lastNameInput).toBeEmpty();
    await expect(checkoutStepOnePage.postalCodeInput).toBeVisible();
    await expect(checkoutStepOnePage.postalCodeInput).toBeEmpty();
    await expect(checkoutStepOnePage.cancelButton).toBeVisible();
    await expect(checkoutStepOnePage.continueButton).toBeVisible();
  });

  test('TC-CHECKOUT-INFO-002 - Valid data in all fields allows proceeding to Overview', async ({ loggedInPage, cartPage, checkoutStepOnePage }) => {
    // Preconditions: add an item to cart, navigate to /checkout-step-one.html.
    await loggedInPage.addProductToCart(products.backpack.id);
    await loggedInPage.goToCart();
    await cartPage.proceedToCheckout();

    // 1-3. Enter First Name, Last Name, Zip/Postal Code.
    await checkoutStepOnePage.fillInfo(customer.valid.firstName, customer.valid.lastName, customer.valid.postalCode);
    await expect(checkoutStepOnePage.firstNameInput).toHaveValue(customer.valid.firstName);
    await expect(checkoutStepOnePage.lastNameInput).toHaveValue(customer.valid.lastName);
    await expect(checkoutStepOnePage.postalCodeInput).toHaveValue(customer.valid.postalCode);

    // 4. Click 'Continue'.
    await checkoutStepOnePage.continueCheckout();
    await expect(checkoutStepOnePage.page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(checkoutStepOnePage.errorBanner).toBeHidden();
    await expect(checkoutStepOnePage.heading).toHaveText('Checkout: Overview');
  });

  test('TC-CHECKOUT-INFO-003-EmptyFirstName - Leaving First Name empty blocks Continue with correct error', async ({ loggedInPage, cartPage, checkoutStepOnePage }) => {
    // Preconditions: add an item to cart, navigate to /checkout-step-one.html.
    await loggedInPage.addProductToCart(products.backpack.id);
    await loggedInPage.goToCart();
    await cartPage.proceedToCheckout();

    // 1. Leave First Name empty. Enter Last Name and Zip.
    await checkoutStepOnePage.fillInfo('', customer.valid.lastName, customer.valid.postalCode);

    // 2. Click 'Continue'.
    await checkoutStepOnePage.continueCheckout();
    await expect(checkoutStepOnePage.page).toHaveURL(/\/checkout-step-one\.html$/);
    await expect(checkoutStepOnePage.errorBanner).toHaveText(messages.firstNameRequired);
    await expect(checkoutStepOnePage.firstNameInput).toHaveClass(/error/);
  });

  test('TC-CHECKOUT-INFO-004-EmptyLastName - Leaving Last Name empty blocks Continue with correct error', async ({ loggedInPage, cartPage, checkoutStepOnePage }) => {
    // Preconditions: add an item to cart, navigate to /checkout-step-one.html.
    await loggedInPage.addProductToCart(products.backpack.id);
    await loggedInPage.goToCart();
    await cartPage.proceedToCheckout();

    // 1. Enter First Name. Leave Last Name empty. Enter Zip.
    await checkoutStepOnePage.fillInfo(customer.valid.firstName, '', customer.valid.postalCode);

    // 2. Click 'Continue'.
    await checkoutStepOnePage.continueCheckout();
    await expect(checkoutStepOnePage.page).toHaveURL(/\/checkout-step-one\.html$/);
    await expect(checkoutStepOnePage.errorBanner).toHaveText(messages.lastNameRequired);
  });

  test('TC-CHECKOUT-INFO-005-EmptyZip - Leaving Zip/Postal Code empty blocks Continue with correct error', async ({ loggedInPage, cartPage, checkoutStepOnePage }) => {
    // Preconditions: add an item to cart, navigate to /checkout-step-one.html.
    await loggedInPage.addProductToCart(products.backpack.id);
    await loggedInPage.goToCart();
    await cartPage.proceedToCheckout();

    // 1. Enter First Name and Last Name. Leave Zip/Postal Code empty.
    await checkoutStepOnePage.fillInfo(customer.valid.firstName, customer.valid.lastName, '');

    // 2. Click 'Continue'.
    await checkoutStepOnePage.continueCheckout();
    await expect(checkoutStepOnePage.page).toHaveURL(/\/checkout-step-one\.html$/);
    await expect(checkoutStepOnePage.errorBanner).toHaveText(messages.postalCodeRequired);
  });

  test('TC-CHECKOUT-INFO-006-AllFieldsEmpty - Clicking Continue with all fields empty shows First Name error first', async ({ loggedInPage, cartPage, checkoutStepOnePage }) => {
    // Preconditions: add an item to cart, navigate to /checkout-step-one.html.
    await loggedInPage.addProductToCart(products.backpack.id);
    await loggedInPage.goToCart();
    await cartPage.proceedToCheckout();
    await expect(checkoutStepOnePage.firstNameInput).toBeEmpty();
    await expect(checkoutStepOnePage.lastNameInput).toBeEmpty();
    await expect(checkoutStepOnePage.postalCodeInput).toBeEmpty();

    // 1. Without entering any data, click 'Continue'.
    await checkoutStepOnePage.continueCheckout();
    await expect(checkoutStepOnePage.page).toHaveURL(/\/checkout-step-one\.html$/);
    await expect(checkoutStepOnePage.errorBanner).toHaveText(messages.firstNameRequired);

    // 2. Fill First Name and click Continue again (leaving Last Name/Zip empty).
    await checkoutStepOnePage.firstNameInput.fill(customer.valid.firstName);
    await checkoutStepOnePage.continueCheckout();
    await expect(checkoutStepOnePage.errorBanner).toHaveText(messages.lastNameRequired);
  });

  test('TC-CHECKOUT-INFO-007 - Error message can be dismissed', async ({ loggedInPage, cartPage, checkoutStepOnePage }) => {
    // Preconditions: trigger the 'Error: First Name is required' banner.
    await loggedInPage.addProductToCart(products.backpack.id);
    await loggedInPage.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutStepOnePage.fillInfo('', customer.valid.lastName, customer.valid.postalCode);
    await checkoutStepOnePage.continueCheckout();
    await expect(checkoutStepOnePage.errorBanner).toHaveText(messages.firstNameRequired);
    await expect(checkoutStepOnePage.errorDismissButton).toBeVisible();

    // 1. Click the close icon on the error banner.
    await checkoutStepOnePage.dismissError();
    await expect(checkoutStepOnePage.errorBanner).toBeHidden();
    await expect(checkoutStepOnePage.lastNameInput).toHaveValue(customer.valid.lastName);
    await expect(checkoutStepOnePage.postalCodeInput).toHaveValue(customer.valid.postalCode);
  });

  test('TC-CHECKOUT-INFO-008-WhitespaceOnly - Whitespace-only input is evaluated for required-field validation', async ({ loggedInPage, cartPage, checkoutStepOnePage }) => {
    // Preconditions: add an item to cart, navigate to /checkout-step-one.html.
    await loggedInPage.addProductToCart(products.backpack.id);
    await loggedInPage.goToCart();
    await cartPage.proceedToCheckout();

    // 1. Enter a single space character into First Name, valid Last Name and Zip.
    await checkoutStepOnePage.fillInfo(' ', customer.valid.lastName, customer.valid.postalCode);
    await expect(checkoutStepOnePage.firstNameInput).toHaveValue(' ');

    // 2. Click 'Continue'.
    // Observed behavior: the app does NOT trim/require-check whitespace as empty, so it proceeds to Overview
    // rather than showing "Error: First Name is required".
    await checkoutStepOnePage.continueCheckout();
    await expect(checkoutStepOnePage.page).toHaveURL(/\/checkout-step-two\.html$/);
  });

  test('TC-CHECKOUT-INFO-009-VeryLongInput - Very long values in each field are accepted without truncation or crash', async ({ loggedInPage, cartPage, checkoutStepOnePage }) => {
    // Preconditions: add an item to cart, navigate to /checkout-step-one.html.
    await loggedInPage.addProductToCart(products.backpack.id);
    await loggedInPage.goToCart();
    await cartPage.proceedToCheckout();

    const pageErrors: Error[] = [];
    checkoutStepOnePage.page.on('pageerror', (err) => pageErrors.push(err));

    const longFirstName = stringOfLength(customer.boundary.longNameLength);
    const longLastName = stringOfLength(customer.boundary.longNameLength);
    const longZip = alphaNumericStringOfLength(customer.boundary.longPostalCodeLength);

    // 1. Enter a 250-character string into First Name/Last Name, and a 100-character alphanumeric string into Zip.
    await checkoutStepOnePage.fillInfo(longFirstName, longLastName, longZip);
    await expect(checkoutStepOnePage.firstNameInput).toHaveValue(longFirstName);
    await expect(checkoutStepOnePage.lastNameInput).toHaveValue(longLastName);
    await expect(checkoutStepOnePage.postalCodeInput).toHaveValue(longZip);

    // 2. Click 'Continue'.
    await checkoutStepOnePage.continueCheckout();
    expect(pageErrors).toHaveLength(0);
    await expect(checkoutStepOnePage.page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(checkoutStepOnePage.heading).toHaveText('Checkout: Overview');
  });

  test('TC-CHECKOUT-INFO-010-SpecialCharacters - Special characters and script-like input are accepted as literal text (no validation, no XSS execution)', async ({ loggedInPage, cartPage, checkoutStepOnePage }) => {
    // Preconditions: add an item to cart, navigate to /checkout-step-one.html.
    await loggedInPage.addProductToCart(products.backpack.id);
    await loggedInPage.goToCart();
    await cartPage.proceedToCheckout();

    let dialogFired = false;
    checkoutStepOnePage.page.on('dialog', async (dialog) => {
      dialogFired = true;
      await dialog.dismiss();
    });

    // 1-3. Enter special/script-like characters into all three fields.
    await checkoutStepOnePage.fillInfo(
      customer.specialCharacters.firstName,
      customer.specialCharacters.lastName,
      customer.specialCharacters.postalCode,
    );
    await expect(checkoutStepOnePage.firstNameInput).toHaveValue(customer.specialCharacters.firstName);
    await expect(checkoutStepOnePage.lastNameInput).toHaveValue(customer.specialCharacters.lastName);
    await expect(checkoutStepOnePage.postalCodeInput).toHaveValue(customer.specialCharacters.postalCode);

    // 4. Click 'Continue'.
    await checkoutStepOnePage.continueCheckout();
    await expect(checkoutStepOnePage.errorBanner).toBeHidden();
    expect(dialogFired).toBe(false);
    await expect(checkoutStepOnePage.page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(checkoutStepOnePage.heading).toHaveText('Checkout: Overview');
  });

  test('TC-CHECKOUT-INFO-011-NumericFirstName - Numeric/non-alphabetic values in Name fields are accepted (no format validation)', async ({ loggedInPage, cartPage, checkoutStepOnePage }) => {
    // Preconditions: add an item to cart, navigate to /checkout-step-one.html.
    await loggedInPage.addProductToCart(products.backpack.id);
    await loggedInPage.goToCart();
    await cartPage.proceedToCheckout();

    // 1. Enter numeric First/Last Name and alphabetic Zip.
    await checkoutStepOnePage.fillInfo(
      customer.numericFirstName.firstName,
      customer.numericFirstName.lastName,
      customer.numericFirstName.postalCode,
    );

    // 2. Click 'Continue'.
    await checkoutStepOnePage.continueCheckout();
    await expect(checkoutStepOnePage.errorBanner).toBeHidden();
    await expect(checkoutStepOnePage.page).toHaveURL(/\/checkout-step-two\.html$/);
  });

  test('TC-CHECKOUT-INFO-012-NotLoggedIn - Direct navigation to checkout page while logged out redirects to login with an error', async ({ page }) => {
    // Preconditions: fresh, unauthenticated browser context (default Playwright test isolation - no login performed).
    const loginPage = new LoginPage(page);

    // 1. Navigate directly to https://www.saucedemo.com/checkout-step-one.html.
    await page.goto('https://www.saucedemo.com/checkout-step-one.html');
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(loginPage.errorBanner).toHaveText(messages.notLoggedInCheckoutStepOne);
    await expect(loginPage.usernameInput).toBeEmpty();
    await expect(loginPage.passwordInput).toBeEmpty();
  });
});
