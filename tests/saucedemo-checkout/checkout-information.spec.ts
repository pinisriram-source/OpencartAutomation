// spec: specs/saucedemo-checkout-test-plan.md (Suite 2: Checkout Information Entry)
// seed: tests/seed.spec.ts
import { test, expect, loginAsStandardUser, stringOfLength } from './fixtures/saucedemo.fixture';
import products from './test-data/products.json';
import checkoutInfo from './test-data/checkout-info.json';
import messages from './test-data/messages.json';

test.describe('Checkout Information Entry', () => {
  test('TC-CHECKOUT-INFO-001 Page displays all required fields and controls', async ({
    loginPage,
    inventoryPage,
    cartPage,
    checkoutInformationPage,
  }) => {
    // 1. Preconditions: log in, add an item to cart, click 'Checkout' from the cart page.
    await loginAsStandardUser(loginPage);
    await inventoryPage.addProductToCart(products.backpack.slug);
    await inventoryPage.goToCart();
    await cartPage.goToCheckout();
    await expect(checkoutInformationPage.page).toHaveURL(/checkout-step-one\.html/);

    // 2. Inspect the form.
    await expect(checkoutInformationPage.title).toHaveText('Checkout: Your Information');
    await expect(checkoutInformationPage.firstNameInput).toHaveValue('');
    await expect(checkoutInformationPage.lastNameInput).toHaveValue('');
    await expect(checkoutInformationPage.postalCodeInput).toHaveValue('');
    await expect(checkoutInformationPage.cancelButton).toBeVisible();
    await expect(checkoutInformationPage.continueButton).toBeVisible();
  });

  test('TC-CHECKOUT-INFO-002 Valid data in all fields proceeds to Overview', async ({
    loginPage,
    inventoryPage,
    checkoutInformationPage,
    checkoutOverviewPage,
  }) => {
    // 1. Preconditions: log in, add an item to cart, navigate to /checkout-step-one.html.
    await loginAsStandardUser(loginPage);
    await inventoryPage.addProductToCart(products.backpack.slug);
    await checkoutInformationPage.open();

    // 2. Enter First Name, Last Name, Zip/Postal Code, then click 'Continue'.
    await checkoutInformationPage.submitInformation(checkoutInfo.valid);
    await expect(checkoutOverviewPage.page).toHaveURL(/checkout-step-two\.html/);
    await expect(checkoutInformationPage.errorBanner).toHaveCount(0);
    await expect(checkoutOverviewPage.title).toHaveText('Checkout: Overview');
  });

  test('TC-CHECKOUT-INFO-003-EmptyFirstName Empty First Name blocks Continue with the correct error', async ({
    loginPage,
    inventoryPage,
    checkoutInformationPage,
  }) => {
    // 1. Preconditions: log in, add an item to cart, navigate to /checkout-step-one.html.
    await loginAsStandardUser(loginPage);
    await inventoryPage.addProductToCart(products.backpack.slug);
    await checkoutInformationPage.open();

    // 2. Leave First Name empty. Enter Last Name and Zip, then click 'Continue'.
    await checkoutInformationPage.submitInformation({
      lastName: checkoutInfo.valid.lastName,
      postalCode: checkoutInfo.valid.postalCode,
    });
    await expect(checkoutInformationPage.page).toHaveURL(/checkout-step-one\.html/);
    await expect(checkoutInformationPage.errorBanner).toHaveText(messages.firstNameRequired);
    await expect(checkoutInformationPage.isFieldMarkedInvalid(checkoutInformationPage.firstNameInput)).resolves.toBe(true);
    await expect(checkoutInformationPage.isFieldMarkedInvalid(checkoutInformationPage.lastNameInput)).resolves.toBe(true);
    await expect(checkoutInformationPage.isFieldMarkedInvalid(checkoutInformationPage.postalCodeInput)).resolves.toBe(true);
  });

  test('TC-CHECKOUT-INFO-004-EmptyLastName Empty Last Name blocks Continue with the correct error', async ({
    loginPage,
    inventoryPage,
    checkoutInformationPage,
  }) => {
    // 1. Preconditions: log in, add an item to cart, navigate to /checkout-step-one.html.
    await loginAsStandardUser(loginPage);
    await inventoryPage.addProductToCart(products.backpack.slug);
    await checkoutInformationPage.open();

    // 2. Enter First Name. Leave Last Name empty. Enter Zip, then click 'Continue'.
    await checkoutInformationPage.submitInformation({
      firstName: checkoutInfo.valid.firstName,
      postalCode: checkoutInfo.valid.postalCode,
    });
    await expect(checkoutInformationPage.page).toHaveURL(/checkout-step-one\.html/);
    await expect(checkoutInformationPage.errorBanner).toHaveText(messages.lastNameRequired);
  });

  test('TC-CHECKOUT-INFO-005-EmptyZip Empty Zip/Postal Code blocks Continue with the correct error', async ({
    loginPage,
    inventoryPage,
    checkoutInformationPage,
  }) => {
    // 1. Preconditions: log in, add an item to cart, navigate to /checkout-step-one.html.
    await loginAsStandardUser(loginPage);
    await inventoryPage.addProductToCart(products.backpack.slug);
    await checkoutInformationPage.open();

    // 2. Enter First Name and Last Name. Leave Zip/Postal Code empty, then click 'Continue'.
    await checkoutInformationPage.submitInformation({
      firstName: checkoutInfo.valid.firstName,
      lastName: checkoutInfo.valid.lastName,
    });
    await expect(checkoutInformationPage.page).toHaveURL(/checkout-step-one\.html/);
    await expect(checkoutInformationPage.errorBanner).toHaveText(messages.postalCodeRequired);
  });

  test('TC-CHECKOUT-INFO-006-AllFieldsEmpty Clicking Continue with all fields empty enforces sequential field-by-field validation', async ({
    loginPage,
    inventoryPage,
    checkoutInformationPage,
  }) => {
    // 1. Preconditions: log in, add an item to cart, navigate to /checkout-step-one.html.
    await loginAsStandardUser(loginPage);
    await inventoryPage.addProductToCart(products.backpack.slug);
    await checkoutInformationPage.open();

    // 2. Without entering any data, click 'Continue'.
    await checkoutInformationPage.clickContinue();
    await expect(checkoutInformationPage.page).toHaveURL(/checkout-step-one\.html/);
    await expect(checkoutInformationPage.errorBanner).toHaveText(messages.firstNameRequired);

    // 3. Fill only First Name, leaving Last Name/Zip empty, and click 'Continue' again.
    await checkoutInformationPage.fillInformation({ firstName: checkoutInfo.valid.firstName });
    await checkoutInformationPage.clickContinue();
    await expect(checkoutInformationPage.errorBanner).toHaveText(messages.lastNameRequired);
  });

  test('TC-CHECKOUT-INFO-007 Error banner can be dismissed without losing entered data', async ({
    loginPage,
    inventoryPage,
    checkoutInformationPage,
  }) => {
    // 1. Preconditions: trigger the 'Error: First Name is required' banner (Last Name/Zip already filled).
    await loginAsStandardUser(loginPage);
    await inventoryPage.addProductToCart(products.backpack.slug);
    await checkoutInformationPage.open();
    await checkoutInformationPage.submitInformation({
      lastName: checkoutInfo.valid.lastName,
      postalCode: checkoutInfo.valid.postalCode,
    });
    await expect(checkoutInformationPage.errorBanner).toBeVisible();

    // 2. Click the close icon on the error banner.
    await checkoutInformationPage.dismissError();
    await expect(checkoutInformationPage.errorBanner).toHaveCount(0);
    await expect(checkoutInformationPage.lastNameInput).toHaveValue(checkoutInfo.valid.lastName);
    await expect(checkoutInformationPage.postalCodeInput).toHaveValue(checkoutInfo.valid.postalCode);
  });

  test('TC-CHECKOUT-INFO-008-WhitespaceOnly Whitespace-only First Name satisfies the required-field check', async ({
    loginPage,
    inventoryPage,
    checkoutInformationPage,
    checkoutOverviewPage,
  }) => {
    // 1. Preconditions: log in, add an item to cart, navigate to /checkout-step-one.html.
    await loginAsStandardUser(loginPage);
    await inventoryPage.addProductToCart(products.backpack.slug);
    await checkoutInformationPage.open();

    // 2. Enter a single space character into First Name, a valid Last Name and Zip, then click 'Continue'.
    await checkoutInformationPage.submitInformation({
      firstName: checkoutInfo.boundary.whitespaceFirstName,
      lastName: checkoutInfo.valid.lastName,
      postalCode: checkoutInfo.valid.postalCode,
    });
    // Confirmed live: whitespace-only satisfies "required" — no error, proceeds to Overview (flagged product gap).
    await expect(checkoutOverviewPage.page).toHaveURL(/checkout-step-two\.html/);
  });

  test('TC-CHECKOUT-INFO-009-VeryLongInput Very long field values are accepted without truncation', async ({
    loginPage,
    inventoryPage,
    checkoutInformationPage,
    checkoutOverviewPage,
  }) => {
    // 1. Preconditions: log in, add an item to cart, navigate to /checkout-step-one.html.
    await loginAsStandardUser(loginPage);
    await inventoryPage.addProductToCart(products.backpack.slug);
    await checkoutInformationPage.open();

    // 2. Enter 250-char First Name/Last Name and a 100-char alphanumeric Zip (no maxlength attribute).
    const longName = stringOfLength(checkoutInfo.boundary.longNameLength);
    const longZip = stringOfLength(checkoutInfo.boundary.longZipLength, '9');
    await checkoutInformationPage.fillInformation({ firstName: longName, lastName: longName, postalCode: longZip });
    await expect(checkoutInformationPage.firstNameInput).toHaveValue(longName);
    await expect(checkoutInformationPage.lastNameInput).toHaveValue(longName);
    await expect(checkoutInformationPage.postalCodeInput).toHaveValue(longZip);

    // 3. Click 'Continue'.
    await checkoutInformationPage.clickContinue();
    await expect(checkoutOverviewPage.page).toHaveURL(/checkout-step-two\.html/);
    await expect(checkoutOverviewPage.title).toHaveText('Checkout: Overview');
  });

  test('TC-CHECKOUT-INFO-010-SpecialCharacters Special characters and script-like input are accepted as literal text with no XSS execution', async ({
    loginPage,
    inventoryPage,
    checkoutInformationPage,
    checkoutOverviewPage,
  }) => {
    // 1. Preconditions: log in, add an item to cart, navigate to /checkout-step-one.html.
    await loginAsStandardUser(loginPage);
    await inventoryPage.addProductToCart(products.backpack.slug);
    await checkoutInformationPage.open();

    // No JS dialog should ever fire while typing or navigating; fail the test if one appears.
    checkoutInformationPage.page.on('dialog', (dialog) => {
      throw new Error(`Unexpected dialog fired (possible XSS execution): ${dialog.message()}`);
    });

    // 2. Enter the special-character/script-like test data into First Name, Last Name, and Zip.
    await checkoutInformationPage.fillInformation(checkoutInfo.specialCharacters);
    await expect(checkoutInformationPage.firstNameInput).toHaveValue(checkoutInfo.specialCharacters.firstName);
    await expect(checkoutInformationPage.lastNameInput).toHaveValue(checkoutInfo.specialCharacters.lastName);
    await expect(checkoutInformationPage.postalCodeInput).toHaveValue(checkoutInfo.specialCharacters.postalCode);

    // 3. Click 'Continue'.
    await checkoutInformationPage.clickContinue();
    await expect(checkoutInformationPage.errorBanner).toHaveCount(0);
    await expect(checkoutOverviewPage.page).toHaveURL(/checkout-step-two\.html/);
    await expect(checkoutOverviewPage.title).toHaveText('Checkout: Overview');
  });

  test('TC-CHECKOUT-INFO-011-NumericFirstName Numeric names and alphabetic postal codes are accepted (no format validation)', async ({
    loginPage,
    inventoryPage,
    checkoutInformationPage,
    checkoutOverviewPage,
  }) => {
    // 1. Preconditions: log in, add an item to cart, navigate to /checkout-step-one.html.
    await loginAsStandardUser(loginPage);
    await inventoryPage.addProductToCart(products.backpack.slug);
    await checkoutInformationPage.open();

    // 2. Enter the numeric/alphabetic test data as specified, then click 'Continue'.
    await checkoutInformationPage.submitInformation(checkoutInfo.numeric);
    await expect(checkoutInformationPage.errorBanner).toHaveCount(0);
    await expect(checkoutOverviewPage.page).toHaveURL(/checkout-step-two\.html/);
  });

  test('TC-CHECKOUT-INFO-012-NotLoggedIn Direct navigation to checkout while logged out redirects to login with an error', async ({
    loginPage,
  }) => {
    // 1. Preconditions: fresh browser context/session — never logged in.
    // 2. Navigate directly to https://www.saucedemo.com/checkout-step-one.html.
    await loginPage.page.goto('https://www.saucedemo.com/checkout-step-one.html');
    await expect(loginPage.page).toHaveURL('https://www.saucedemo.com/');
    await expect(loginPage.errorBanner).toHaveText(
      messages.notLoggedInTemplate.replace('{path}', '/checkout-step-one.html'),
    );
    await expect(loginPage.usernameInput).toHaveValue('');
    await expect(loginPage.passwordInput).toHaveValue('');
  });
});
