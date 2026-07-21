// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect, stringOfLength, digitsOfLength } from './fixtures/saucedemo.fixture';
import testData from './test-data/checkout-data.json';

const { credentials, products, customers, messages } = testData;
const backpack = products.backpack;

test.describe('AC5 - Error Handling and Edge Cases', () => {
  test.beforeEach(async ({ loginPage, inventoryPage }) => {
    await loginPage.open();
    await loginPage.login(credentials.standardUser.username, credentials.standardUser.password);
    await inventoryPage.addToCart(backpack.name);
  });

  test('TC-CHECKOUT-INFO-009-SpecialCharacters special characters and markup in Name fields are accepted (no format validation)', async ({ page, checkoutStepOnePage, checkoutStepTwoPage }) => {
    await checkoutStepOnePage.open();
    const specialData = { firstName: '<script>alert(1)</script>!@#$%', lastName: "O'Brien-Smith", postalCode: 'abc!@#' };

    let dialogFired = false;
    page.on('dialog', () => {
      dialogFired = true;
    });

    // 1. Enter the special-character/markup test data into First Name, Last Name, and Zip/Postal Code respectively
    await checkoutStepOnePage.fill(specialData);
    await expect(checkoutStepOnePage.firstNameInput).toHaveValue(specialData.firstName);
    await expect(checkoutStepOnePage.lastNameInput).toHaveValue(specialData.lastName);
    await expect(checkoutStepOnePage.postalCodeInput).toHaveValue(specialData.postalCode);

    // 2. Click 'Continue'
    await checkoutStepOnePage.clickContinue();
    await expect(checkoutStepOnePage.errorBanner).toHaveCount(0);
    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);
    expect(dialogFired).toBe(false);

    // 3. Note for reporting: current behavior does NOT reject special characters or enforce
    // numeric-only Zip; if SCRUM-101 requires stricter input validation, record this as a defect
    // against AC5.
  });

  test('TC-CHECKOUT-INFO-010-WhitespaceOnly whitespace-only input in a required field is treated as non-empty (accepted)', async ({ checkoutStepOnePage, checkoutStepTwoPage }) => {
    await checkoutStepOnePage.open();

    // 1. Enter '   ' (spaces only) into First Name; fill Last Name and Zip with valid data
    await checkoutStepOnePage.fill({ firstName: '   ', lastName: customers.johnDoe.lastName, postalCode: customers.johnDoe.postalCode });
    await expect(checkoutStepOnePage.firstNameInput).toHaveValue('   ');

    // 2. Click 'Continue'
    // Documented actual behavior: whitespace-only input satisfies the 'required' check and the app
    // proceeds to Step Two rather than rejecting it with 'Error: First Name is required'.
    await checkoutStepOnePage.clickContinue();
    await expect(checkoutStepOnePage.errorBanner).toHaveCount(0);
    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);
  });

  test('TC-CHECKOUT-INFO-011-LongInput very long input values are accepted in all three fields', async ({ checkoutStepOnePage, checkoutStepTwoPage }) => {
    await checkoutStepOnePage.open();
    const longAlpha = stringOfLength(300);
    const longDigits = digitsOfLength(100);

    // 1. Enter the 300-character string into First Name and Last Name, and the 100-character string into Zip/Postal Code
    await checkoutStepOnePage.fill({ firstName: longAlpha, lastName: longAlpha, postalCode: longDigits });
    await expect(checkoutStepOnePage.firstNameInput).toHaveValue(longAlpha);
    await expect(checkoutStepOnePage.lastNameInput).toHaveValue(longAlpha);
    await expect(checkoutStepOnePage.postalCodeInput).toHaveValue(longDigits);

    // 2. Click 'Continue'
    await checkoutStepOnePage.clickContinue();
    await expect(checkoutStepOnePage.errorBanner).toHaveCount(0);
    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);

    // 3. Visually inspect the Overview page layout
    await expect(checkoutStepTwoPage.totalLabel).toBeVisible();
    await expect(checkoutStepTwoPage.finishButton).toBeVisible();
  });

  test('TC-CHECKOUT-INFO-012-SingleCharacter minimum boundary - single-character values in each field are accepted', async ({ checkoutStepOnePage, checkoutStepTwoPage }) => {
    await checkoutStepOnePage.open();

    // 1. Enter 'A' in First Name, 'B' in Last Name, '1' in Zip/Postal Code
    await checkoutStepOnePage.fill({ firstName: 'A', lastName: 'B', postalCode: '1' });

    // 2. Click 'Continue'
    await checkoutStepOnePage.clickContinue();
    await expect(checkoutStepOnePage.errorBanner).toHaveCount(0);
    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);
  });

  test('TC-CHECKOUT-INFO-013-ReSubmitAfterError correcting a flagged field and resubmitting clears the error and proceeds', async ({ checkoutStepOnePage, checkoutStepTwoPage }) => {
    await checkoutStepOnePage.open();

    // 1. Click 'Continue' with all fields empty
    await checkoutStepOnePage.clickContinue();
    await expect(checkoutStepOnePage.errorBanner).toHaveText(messages.firstNameRequired);
    await expect(checkoutStepOnePage.page).toHaveURL(/checkout-step-one\.html/);

    // 2. Fill in First Name='John', Last Name='Doe', Zip='12345' and click 'Continue' again
    await checkoutStepOnePage.submitInformation(customers.johnDoe);
    await expect(checkoutStepOnePage.errorBanner).toHaveCount(0);
    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);
  });
});
