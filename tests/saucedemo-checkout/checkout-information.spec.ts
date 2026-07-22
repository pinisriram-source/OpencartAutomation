// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from './fixtures/saucedemo.fixture';
import testData from './test-data/checkout-data.json';

const { credentials, products, customers, edgeCaseInputs, messages } = testData;
const backpack = products.backpack;
const bikeLight = products.bikeLight;

test.describe('2. Checkout Information Entry', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login(credentials.standardUser.username, credentials.standardUser.password);
  });

  test('TC-CHECKOUT-001: Checkout button redirects to Checkout Information page with required fields', async ({ inventoryPage, cartPage, checkoutStepOnePage }) => {
    // 1. Login, add an item to cart, go to Cart page, click 'Checkout'
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.openCart();
    await cartPage.checkout();
    await expect(checkoutStepOnePage.page).toHaveURL(/checkout-step-one\.html/);
    await expect(checkoutStepOnePage.firstNameInput).toBeVisible();
    await expect(checkoutStepOnePage.lastNameInput).toBeVisible();
    await expect(checkoutStepOnePage.postalCodeInput).toBeVisible();
    await expect(checkoutStepOnePage.cancelButton).toBeVisible();
    await expect(checkoutStepOnePage.continueButton).toBeVisible();
  });

  test('TC-CHECKOUT-002: Valid data in all fields and Continue proceeds to Overview page', async ({ inventoryPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
    // 1. On Checkout Information page, enter First Name='Jane', Last Name='Smith', Zip='12345', click Continue
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation({ firstName: 'Jane', lastName: 'Smith', postalCode: '12345' });
    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);
    await expect(checkoutStepTwoPage.title).toHaveText('Checkout: Overview');
  });

  test('TC-CHECKOUT-003-EmptyFirstName: Error shown when First Name is empty', async ({ inventoryPage, checkoutStepOnePage }) => {
    // 1. On Checkout Information page, leave all fields empty, click Continue
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.clickContinue();
    await expect(checkoutStepOnePage.page).toHaveURL(/checkout-step-one\.html/);
    await expect(checkoutStepOnePage.errorBanner).toHaveText(messages.firstNameRequired);
    await expect(checkoutStepOnePage.firstNameInput).toHaveClass(/error/);
  });

  test('TC-CHECKOUT-004-EmptyLastName: Error shown when Last Name is empty', async ({ inventoryPage, checkoutStepOnePage }) => {
    // 1. Enter First Name='John' only, leave Last Name and Zip empty, click Continue
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.fill({ firstName: 'John' });
    await checkoutStepOnePage.clickContinue();
    await expect(checkoutStepOnePage.errorBanner).toHaveText(messages.lastNameRequired);
    await expect(checkoutStepOnePage.page).toHaveURL(/checkout-step-one\.html/);
  });

  test('TC-CHECKOUT-005-EmptyZip: Error shown when Postal Code is empty', async ({ inventoryPage, checkoutStepOnePage }) => {
    // 1. Enter First Name='John', Last Name='Doe', leave Zip empty, click Continue
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.fill({ firstName: customers.johnDoe.firstName, lastName: customers.johnDoe.lastName });
    await checkoutStepOnePage.clickContinue();
    await expect(checkoutStepOnePage.errorBanner).toHaveText(messages.postalCodeRequired);
    await expect(checkoutStepOnePage.page).toHaveURL(/checkout-step-one\.html/);
  });

  test('TC-CHECKOUT-006-AllFieldsEmpty: Only the first missing-field error is shown when all fields are empty', async ({ inventoryPage, checkoutStepOnePage }) => {
    // 1. With all three fields empty, click Continue
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.clickContinue();
    // Confirms sequential single-error validation behavior: only First Name's error is displayed,
    // not a combined list of all three.
    await expect(checkoutStepOnePage.errorBanner).toHaveText(messages.firstNameRequired);
    await expect(checkoutStepOnePage.errorBanner).not.toHaveText(messages.lastNameRequired);
    await expect(checkoutStepOnePage.errorBanner).not.toHaveText(messages.postalCodeRequired);
    await expect(checkoutStepOnePage.errorBanner).toHaveCount(1);
  });

  test('TC-CHECKOUT-007: Error banner dismiss (X) control clears the message', async ({ inventoryPage, checkoutStepOnePage }) => {
    // 1. Trigger the First Name required error, then click the 'X' dismiss icon on the error banner
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.clickContinue();
    await expect(checkoutStepOnePage.errorBanner).toHaveText(messages.firstNameRequired);

    await checkoutStepOnePage.errorDismissButton.click();
    await expect(checkoutStepOnePage.errorBanner).toHaveCount(0);
    await expect(checkoutStepOnePage.firstNameInput).toHaveValue('');
    await expect(checkoutStepOnePage.lastNameInput).toHaveValue('');
    await expect(checkoutStepOnePage.postalCodeInput).toHaveValue('');
  });

  test('TC-CHECKOUT-008: Invalid field is visually highlighted with an error icon', async ({ inventoryPage, checkoutStepOnePage }) => {
    // 1. Click Continue with all fields empty
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.clickContinue();
    // The 'error' CSS class (which renders the red icon/outline) is applied to all three input
    // containers simultaneously, even though only the First Name text banner is shown.
    await expect(checkoutStepOnePage.firstNameInput).toHaveClass(/error/);
    await expect(checkoutStepOnePage.lastNameInput).toHaveClass(/error/);
    await expect(checkoutStepOnePage.postalCodeInput).toHaveClass(/error/);
  });

  test('TC-CHECKOUT-009-WhitespaceOnly: Whitespace-only values are accepted (validation gap)', async ({ inventoryPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
    // 1. Enter three spaces ('   ') into First Name, Last Name, and Zip, then click Continue
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation({
      firstName: edgeCaseInputs.whitespaceOnly,
      lastName: edgeCaseInputs.whitespaceOnly,
      postalCode: edgeCaseInputs.whitespaceOnly,
    });
    // Actual behavior: no validation error is raised and the app proceeds - whitespace is not
    // trimmed/rejected, a gap vs the intent of 'mandatory fields'.
    await expect(checkoutStepOnePage.errorBanner).toHaveCount(0);
    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);
  });

  test('TC-CHECKOUT-010-SpecialCharacters: Special characters in Zip are accepted (AC5 gap)', async ({ inventoryPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
    // 1. Enter First Name='John', Last Name='Doe', Zip='!@#$%', click Continue
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation({
      firstName: customers.johnDoe.firstName,
      lastName: customers.johnDoe.lastName,
      postalCode: edgeCaseInputs.specialCharsZip,
    });
    // Actual behavior: no format-validation error is shown; the app proceeds to the Overview page
    // - contradicts AC5's expectation of a validation error for special characters/invalid data.
    await expect(checkoutStepOnePage.errorBanner).toHaveCount(0);
    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);
  });

  test('TC-CHECKOUT-011-LongInput: Very long input string in First Name is accepted', async ({ inventoryPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
    // 1. Enter a 250+ character string into First Name, valid Last Name and Zip, click Continue
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    const longFirstName = 'a'.repeat(260);
    await checkoutStepOnePage.submitInformation({
      firstName: longFirstName,
      lastName: customers.johnDoe.lastName,
      postalCode: customers.johnDoe.postalCode,
    });
    // No client-side max-length error occurs; the app proceeds to the Overview page without
    // truncation errors or a crash.
    await expect(checkoutStepOnePage.errorBanner).toHaveCount(0);
    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);
    await expect(checkoutStepTwoPage.totalLabel).toBeVisible();
  });

  test('TC-CHECKOUT-012-NumericAndAlphaZip: Zip field accepts both numeric and alphanumeric postal codes', async ({ inventoryPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
    // 1. Complete checkout info with Zip='12345' (numeric) and Continue
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation(customers.johnDoe);
    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);

    // 2. Repeat with Zip='A1B 2C3' (alphanumeric, Canadian-style)
    await checkoutStepTwoPage.cancel();
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation(customers.canadianZip);
    // Proceeds with no format error, confirming no country-specific postal format validation exists.
    await expect(checkoutStepOnePage.errorBanner).toHaveCount(0);
    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);
  });

  test('TC-CHECKOUT-013: Cancel button on Checkout Information page returns to Cart with items intact', async ({ inventoryPage, cartPage, checkoutStepOnePage }) => {
    // 1. From Checkout Information page (reached with 2 items in cart), click 'Cancel'
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.addToCart(bikeLight.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.clickCancel();
    await expect(cartPage.page).toHaveURL(/cart\.html/);
    await expect(cartPage.lineItem(backpack.name)).toHaveCount(1);
    await expect(cartPage.lineItem(bikeLight.name)).toHaveCount(1);
  });

  test('TC-CHECKOUT-014: Cart badge count persists on the Checkout Information page header', async ({ inventoryPage, checkoutStepOnePage }) => {
    // 1. Add 2 items to cart and proceed to Checkout Information page
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.addToCart(bikeLight.name);
    await checkoutStepOnePage.open();
    await expect(checkoutStepOnePage.page.locator('[data-test="shopping-cart-badge"]')).toHaveText('2');
  });

  test('TC-CHECKOUT-015-DirectURLWithItems: Direct URL navigation to checkout-step-one.html works when logged in with items in cart', async ({ inventoryPage, checkoutStepOnePage }) => {
    // 1. Login, add an item to cart, then navigate directly to https://www.saucedemo.com/checkout-step-one.html via the address bar
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    // Page loads normally showing the Checkout Information form (no redirect/error), since the
    // user is authenticated.
    await expect(checkoutStepOnePage.page).toHaveURL(/checkout-step-one\.html/);
    await expect(checkoutStepOnePage.title).toHaveText('Checkout: Your Information');
    await expect(checkoutStepOnePage.firstNameInput).toBeVisible();
  });

  test('TC-CHECKOUT-016-EmptyCartAccess: Checkout Information page is reachable even with an empty cart (business rule 3 gap)', async ({ checkoutStepOnePage }) => {
    // 1. Login with an empty cart, navigate directly to /checkout-step-one.html
    await checkoutStepOnePage.open();
    // Actual behavior: the page loads normally with the form fields available and no 'cart is
    // empty' block/redirect - contradicts business rule 3.
    await expect(checkoutStepOnePage.title).toHaveText('Checkout: Your Information');
    await expect(checkoutStepOnePage.firstNameInput).toBeVisible();
    await expect(checkoutStepOnePage.continueButton).toBeEnabled();
  });
});
