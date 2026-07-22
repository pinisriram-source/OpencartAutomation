// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from './fixtures/saucedemo.fixture';
import testData from './test-data/checkout-data.json';

const { credentials, products, customers, edgeCaseInputs, messages } = testData;
const backpack = products.backpack;

test.describe('5. Error Handling / Boundary', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login(credentials.standardUser.username, credentials.standardUser.password);
  });

  test('TC-ERROR-001-UnauthCart: Unauthenticated direct access to Cart page is blocked', async ({ page, loginPage }) => {
    // 1. Without logging in (or after logging out), navigate directly to https://www.saucedemo.com/cart.html
    await page.context().clearCookies();
    await page.goto('https://www.saucedemo.com/cart.html');
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(loginPage.errorBanner).toHaveText(messages.loginRequiredForCart);
  });

  test('TC-ERROR-002-UnauthCheckoutInfo: Unauthenticated direct access to Checkout Information page is blocked', async ({ page, loginPage }) => {
    // 1. While logged out, navigate directly to /checkout-step-one.html
    await page.context().clearCookies();
    await page.goto('https://www.saucedemo.com/checkout-step-one.html');
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(loginPage.errorBanner).toHaveText(messages.loginRequiredForCheckoutStepOne);
  });

  test('TC-ERROR-003-UnauthOverview: Unauthenticated direct access to Order Overview page is blocked', async ({ page, loginPage }) => {
    // 1. While logged out, navigate directly to /checkout-step-two.html
    await page.context().clearCookies();
    await page.goto('https://www.saucedemo.com/checkout-step-two.html');
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(loginPage.errorBanner).toHaveText(messages.loginRequiredForCheckoutStepTwo);
  });

  test('TC-ERROR-004-UnauthComplete: Unauthenticated direct access to Order Confirmation page is blocked', async ({ page, loginPage }) => {
    // 1. While logged out, navigate directly to /checkout-complete.html
    await page.context().clearCookies();
    await page.goto('https://www.saucedemo.com/checkout-complete.html');
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(loginPage.errorBanner).toHaveText(messages.loginRequiredForCheckoutComplete);
  });

  test('TC-ERROR-005-InvalidLogin: Invalid login credentials block all checkout access', async ({ page, loginPage }) => {
    // 1. On the login page, enter an invalid username/password combination and submit
    await page.context().clearCookies();
    await loginPage.open();
    await loginPage.login(credentials.invalidUser.username, credentials.invalidUser.password);
    await expect(loginPage.errorBanner).toHaveText(messages.invalidLogin);
    await expect(page).toHaveURL('https://www.saucedemo.com/');

    // 2. Attempt to navigate directly to /checkout-step-one.html afterward
    await page.goto('https://www.saucedemo.com/checkout-step-one.html');
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(loginPage.errorBanner).toHaveText(messages.loginRequiredForCheckoutStepOne);
  });

  test('TC-ERROR-006-SequentialValidation: Field validation errors surface one at a time in a fixed order', async ({ inventoryPage, checkoutStepOnePage }) => {
    // 1. On Checkout Information page with all fields empty, click Continue
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.clickContinue();
    await expect(checkoutStepOnePage.errorBanner).toHaveText(messages.firstNameRequired);

    // 2. Fill First Name only, click Continue again
    await checkoutStepOnePage.fill({ firstName: 'John' });
    await checkoutStepOnePage.clickContinue();
    await expect(checkoutStepOnePage.errorBanner).toHaveText(messages.lastNameRequired);
    await expect(checkoutStepOnePage.errorBanner).not.toHaveText(messages.firstNameRequired);

    // 3. Fill Last Name, click Continue again
    await checkoutStepOnePage.fill({ lastName: 'Doe' });
    await checkoutStepOnePage.clickContinue();
    await expect(checkoutStepOnePage.errorBanner).toHaveText(messages.postalCodeRequired);
  });

  test('TC-ERROR-007-EmptyCartCheckoutButtonEnabled: Checkout button remains active on an empty cart (business rule 3 gap)', async ({ cartPage, checkoutStepOnePage }) => {
    // 1. Login with an empty cart and open the Cart page
    await cartPage.open();
    await expect(cartPage.checkoutButton).toBeVisible();
    await expect(cartPage.checkoutButton).toBeEnabled();

    // Clicking it proceeds to /checkout-step-one.html rather than being blocked, contradicting
    // business rule 3.
    await cartPage.checkout();
    await expect(checkoutStepOnePage.page).toHaveURL(/checkout-step-one\.html/);
  });

  test('TC-ERROR-008-ScriptInjection: Script-tag input is rendered as literal text, not executed', async ({ page, inventoryPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
    // 1. On Checkout Information page, enter '<script>alert(1)</script>' as First Name, valid Last Name and Zip, click Continue
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();

    let dialogFired = false;
    page.on('dialog', () => {
      dialogFired = true;
    });

    await checkoutStepOnePage.submitInformation({
      firstName: edgeCaseInputs.scriptInjection,
      lastName: customers.johnDoe.lastName,
      postalCode: customers.johnDoe.postalCode,
    });
    // No JavaScript alert/dialog is triggered; the app proceeds normally, treating the string as
    // inert text - confirming no XSS execution.
    expect(dialogFired).toBe(false);
    await expect(checkoutStepOnePage.errorBanner).toHaveCount(0);
    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);
  });

  test('TC-ERROR-009-SQLInjection: SQL-injection-style input is treated as literal text', async ({ inventoryPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
    // 1. Enter Zip = "' OR '1'='1" with valid First/Last Name, click Continue
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation({
      firstName: customers.johnDoe.firstName,
      lastName: customers.johnDoe.lastName,
      postalCode: edgeCaseInputs.sqlInjectionZip,
    });
    // No error, crash, or unexpected behavior occurs; the app proceeds to the Overview page
    // treating the value as an ordinary string.
    await expect(checkoutStepOnePage.errorBanner).toHaveCount(0);
    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);
  });

  test('TC-ERROR-010-UnicodeEmoji: Unicode/emoji characters in Last Name are accepted without crashing', async ({ inventoryPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
    // 1. Enter an emoji/unicode string (e.g. 'Smîth 😀') as Last Name, valid First Name and Zip, click Continue
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation({
      firstName: customers.johnDoe.firstName,
      lastName: edgeCaseInputs.unicodeEmojiLastName,
      postalCode: customers.johnDoe.postalCode,
    });
    // No client error occurs; the app proceeds to the Overview page without garbling or crashing.
    await expect(checkoutStepOnePage.errorBanner).toHaveCount(0);
    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);
  });

  test('TC-ERROR-011-FixOneFieldAtATime: Correcting fields one at a time surfaces the correct next error with no stale message', async ({ inventoryPage, checkoutStepOnePage }) => {
    // 1. Trigger the First Name required error, then fill in First Name and Last Name (leaving Zip empty), click Continue
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.clickContinue();
    await expect(checkoutStepOnePage.errorBanner).toHaveText(messages.firstNameRequired);

    await checkoutStepOnePage.fill({ firstName: 'John', lastName: 'Doe' });
    await checkoutStepOnePage.clickContinue();
    // Only the 'Postal Code is required' error is now shown; the earlier First Name/Last Name
    // error text is no longer present anywhere on the page.
    await expect(checkoutStepOnePage.errorBanner).toHaveText(messages.postalCodeRequired);
    await expect(checkoutStepOnePage.errorBanner).not.toHaveText(messages.firstNameRequired);
    await expect(checkoutStepOnePage.errorBanner).not.toHaveText(messages.lastNameRequired);
    await expect(checkoutStepOnePage.errorBanner).toHaveCount(1);
  });

  test('TC-ERROR-012-RefreshMidEntry: Refreshing the Checkout Information page mid-entry clears typed values', async ({ page, inventoryPage, checkoutStepOnePage }) => {
    // 1. On the Checkout Information page, type values into First Name and Last Name but do not submit, then refresh the browser
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.fill({ firstName: 'John', lastName: 'Doe' });
    await expect(checkoutStepOnePage.firstNameInput).toHaveValue('John');

    await page.reload();
    // After reload, all three fields are empty again - confirms unsaved form input is not
    // persisted client-side.
    await expect(checkoutStepOnePage.firstNameInput).toHaveValue('');
    await expect(checkoutStepOnePage.lastNameInput).toHaveValue('');
    await expect(checkoutStepOnePage.postalCodeInput).toHaveValue('');
  });
});
