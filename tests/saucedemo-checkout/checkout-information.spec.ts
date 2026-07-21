// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from './fixtures/saucedemo.fixture';
import testData from './test-data/checkout-data.json';

const { credentials, products, customers, messages } = testData;
const backpack = products.backpack;

test.describe('AC2 - Checkout Information Entry', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login(credentials.standardUser.username, credentials.standardUser.password);
  });

  test('TC-CHECKOUT-INFO-001 checkout information page displays all mandatory fields', async ({ inventoryPage, cartPage, checkoutStepOnePage }) => {
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.openCart();

    // 1. Click 'Checkout' from the cart
    await cartPage.checkout();
    await expect(checkoutStepOnePage.page).toHaveURL(/checkout-step-one\.html/);
    await expect(checkoutStepOnePage.title).toHaveText('Checkout: Your Information');

    // 2. Inspect the form
    await expect(checkoutStepOnePage.firstNameInput).toBeVisible();
    await expect(checkoutStepOnePage.firstNameInput).toHaveValue('');
    await expect(checkoutStepOnePage.lastNameInput).toBeVisible();
    await expect(checkoutStepOnePage.lastNameInput).toHaveValue('');
    await expect(checkoutStepOnePage.postalCodeInput).toBeVisible();
    await expect(checkoutStepOnePage.postalCodeInput).toHaveValue('');
    await expect(checkoutStepOnePage.cancelButton).toBeEnabled();
    await expect(checkoutStepOnePage.continueButton).toBeEnabled();
  });

  test('TC-CHECKOUT-INFO-002 valid First Name, Last Name, and Zip proceeds to Overview page', async ({ inventoryPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();

    // 1. Enter 'John' in First Name, 'Doe' in Last Name, '12345' in Zip/Postal Code
    await checkoutStepOnePage.fill(customers.johnDoe);
    await expect(checkoutStepOnePage.firstNameInput).toHaveValue(customers.johnDoe.firstName);
    await expect(checkoutStepOnePage.lastNameInput).toHaveValue(customers.johnDoe.lastName);
    await expect(checkoutStepOnePage.postalCodeInput).toHaveValue(customers.johnDoe.postalCode);

    // 2. Click 'Continue'
    await checkoutStepOnePage.clickContinue();
    await expect(checkoutStepOnePage.errorBanner).toHaveCount(0);
    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);
    await expect(checkoutStepTwoPage.title).toHaveText('Checkout: Overview');
  });

  test('TC-CHECKOUT-INFO-003-EmptyFirstName leaving First Name empty blocks progression and shows required-field error', async ({ inventoryPage, checkoutStepOnePage }) => {
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();

    // 1. Leave First Name empty; enter 'Doe' in Last Name and '12345' in Zip
    await checkoutStepOnePage.fill({ lastName: customers.johnDoe.lastName, postalCode: customers.johnDoe.postalCode });

    // 2. Click 'Continue'
    await checkoutStepOnePage.clickContinue();
    await expect(checkoutStepOnePage.page).toHaveURL(/checkout-step-one\.html/);
    await expect(checkoutStepOnePage.errorBanner).toHaveText(messages.firstNameRequired);
    await expect(checkoutStepOnePage.firstNameInput).toHaveClass(/error/);

    // 3. Click the 'x' dismiss icon on the error banner
    await checkoutStepOnePage.errorDismissButton.click();
    await expect(checkoutStepOnePage.errorBanner).toHaveCount(0);
  });

  test('TC-CHECKOUT-INFO-004-EmptyLastName leaving Last Name empty blocks progression and shows required-field error', async ({ inventoryPage, checkoutStepOnePage }) => {
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();

    // 1. Enter 'John' in First Name, leave Last Name empty, enter '12345' in Zip
    await checkoutStepOnePage.fill({ firstName: customers.johnDoe.firstName, postalCode: customers.johnDoe.postalCode });

    // 2. Click 'Continue'
    await checkoutStepOnePage.clickContinue();
    await expect(checkoutStepOnePage.page).toHaveURL(/checkout-step-one\.html/);
    await expect(checkoutStepOnePage.errorBanner).toHaveText(messages.lastNameRequired);
  });

  test('TC-CHECKOUT-INFO-005-EmptyZip leaving Zip/Postal Code empty blocks progression and shows required-field error', async ({ inventoryPage, checkoutStepOnePage }) => {
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();

    // 1. Enter 'John' in First Name, 'Doe' in Last Name, leave Zip/Postal Code empty
    await checkoutStepOnePage.fill({ firstName: customers.johnDoe.firstName, lastName: customers.johnDoe.lastName });

    // 2. Click 'Continue'
    await checkoutStepOnePage.clickContinue();
    await expect(checkoutStepOnePage.page).toHaveURL(/checkout-step-one\.html/);
    await expect(checkoutStepOnePage.errorBanner).toHaveText(messages.postalCodeRequired);
  });

  test('TC-CHECKOUT-INFO-006-AllFieldsEmpty submitting a completely blank form shows the First Name error first', async ({ inventoryPage, checkoutStepOnePage }) => {
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();

    // 1. Without entering any data, click 'Continue' immediately
    await checkoutStepOnePage.clickContinue();
    await expect(checkoutStepOnePage.page).toHaveURL(/checkout-step-one\.html/);
    // Validation stops at the first empty required field, in First Name -> Last Name -> Zip order.
    await expect(checkoutStepOnePage.errorBanner).toHaveText(messages.firstNameRequired);

    // 2. Fill only First Name with 'A' and click 'Continue' again
    await checkoutStepOnePage.fill({ firstName: 'A' });
    await checkoutStepOnePage.clickContinue();
    await expect(checkoutStepOnePage.errorBanner).toHaveText(messages.lastNameRequired);
  });

  test('TC-CHECKOUT-INFO-007 checkout information page requires an active login session', async ({ page, loginPage }) => {
    // Precondition: no active session. The auth session is a "session-username" cookie, so clearing
    // cookies (set by the beforeEach login) simulates a logged-out user without a separate context.
    await page.context().clearCookies();

    // 1. Without logging in, navigate directly to https://www.saucedemo.com/checkout-step-one.html
    await page.goto('https://www.saucedemo.com/checkout-step-one.html');
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(loginPage.errorBanner).toHaveText(messages.loginRequiredForCheckout);
  });

  test('TC-CHECKOUT-INFO-008-EmptyCart reaching checkout information with an empty cart does not block the form', async ({ checkoutStepOnePage }) => {
    // 1. With an empty cart, navigate directly to /checkout-step-one.html
    await checkoutStepOnePage.open();
    // Current observed behavior: the Your Information form still renders normally (no cart-empty
    // block/redirect). Record as a defect/flag if SCRUM-101 requires the app to block checkout
    // entry entirely when the cart is empty.
    await expect(checkoutStepOnePage.title).toHaveText('Checkout: Your Information');
    await expect(checkoutStepOnePage.firstNameInput).toBeVisible();
    await expect(checkoutStepOnePage.continueButton).toBeEnabled();
  });
});
