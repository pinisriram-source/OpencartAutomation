// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from './fixtures/saucedemo.fixture';
import testData from './test-data/checkout-data.json';

const { credentials, products, customers, totals } = testData;
const backpack = products.backpack;
const bikeLight = products.bikeLight;

test.describe('Navigation Flow and Cross-Cutting Tests', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login(credentials.standardUser.username, credentials.standardUser.password);
  });

  test('TC-CHECKOUT-NAV-001 cancel on Checkout Information returns to the Cart page with cart intact', async ({ inventoryPage, cartPage, checkoutStepOnePage }) => {
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();

    // 1. Optionally enter partial data into First Name/Last Name/Zip, then click 'Cancel'
    await checkoutStepOnePage.fill({ firstName: 'John' });
    await checkoutStepOnePage.clickCancel();
    await expect(cartPage.page).toHaveURL(/cart\.html/);

    // 2. Verify cart contents are unaffected by cancelling
    await expect(cartPage.lineItem(backpack.name)).toHaveCount(1);
    await expect(cartPage.price(backpack.name)).toHaveText(backpack.price);
    await expect(cartPage.cartBadge).toHaveText('1');
  });

  test('TC-CHECKOUT-NAV-002 end-to-end cancel-and-resume - cancelling at Overview and re-entering checkout preserves cart and requires re-entry of info', async ({ inventoryPage, cartPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation(customers.johnDoe);

    // 1. Click 'Cancel' on the Overview page
    await checkoutStepTwoPage.cancel();
    await expect(inventoryPage.page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.cartBadge).toHaveText('1');

    // 2. Re-open the cart and click 'Checkout' again
    await inventoryPage.openCart();
    await cartPage.checkout();
    await expect(checkoutStepOnePage.page).toHaveURL(/checkout-step-one\.html/);
    await expect(checkoutStepOnePage.firstNameInput).toHaveValue('');
    await expect(checkoutStepOnePage.lastNameInput).toHaveValue('');
    await expect(checkoutStepOnePage.postalCodeInput).toHaveValue('');
  });

  test('TC-CHECKOUT-NAV-003 browser Back button from Checkout Information returns to Cart without data loss', async ({ page, inventoryPage, cartPage, checkoutStepOnePage }) => {
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.openCart();
    await cartPage.checkout();
    await expect(checkoutStepOnePage.page).toHaveURL(/checkout-step-one\.html/);

    // 1. Use the browser's Back button (not the in-page Cancel link) while on /checkout-step-one.html
    await page.goBack();
    await expect(cartPage.page).toHaveURL(/cart\.html/);

    // 2. Verify cart contents
    await expect(cartPage.lineItem(backpack.name)).toHaveCount(1);
    await expect(cartPage.price(backpack.name)).toHaveText(backpack.price);
  });

  test('TC-CHECKOUT-NAV-004 browser Back button from Checkout Overview returns to Checkout Information with fields cleared', async ({ page, inventoryPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation(customers.johnDoe);
    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);

    // 1. Use the browser's Back button while on /checkout-step-two.html
    await page.goBack();
    await expect(checkoutStepOnePage.page).toHaveURL(/checkout-step-one\.html/);

    // 2. Inspect the First Name, Last Name, and Zip fields
    // Documented actual behavior: the form is not repopulated from history, so fields render
    // empty; submitting 'Continue' again immediately would show a required-field error rather
    // than silently reusing prior values.
    await expect(checkoutStepOnePage.firstNameInput).toHaveValue('');
    await expect(checkoutStepOnePage.lastNameInput).toHaveValue('');
    await expect(checkoutStepOnePage.postalCodeInput).toHaveValue('');
  });

  test('TC-CHECKOUT-NAV-005 full guest-to-confirmation happy path in a single continuous run', async ({ inventoryPage, cartPage, checkoutStepOnePage, checkoutStepTwoPage, checkoutCompletePage }) => {
    // 1. Login with standard_user/secret_sauce (performed in beforeEach)
    await expect(inventoryPage.page).toHaveURL(/inventory\.html/);

    // 2. Add 'Sauce Labs Backpack' and 'Sauce Labs Bike Light' to the cart
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.addToCart(bikeLight.name);
    await expect(inventoryPage.cartBadge).toHaveText('2');

    // 3. Open the cart and verify both items are listed correctly, then click 'Checkout'
    await inventoryPage.openCart();
    await expect(cartPage.lineItem(backpack.name)).toHaveCount(1);
    await expect(cartPage.lineItem(bikeLight.name)).toHaveCount(1);
    await cartPage.checkout();
    await expect(checkoutStepOnePage.page).toHaveURL(/checkout-step-one\.html/);

    // 4. Enter First Name='John', Last Name='Doe', Zip='12345' and click 'Continue'
    await checkoutStepOnePage.submitInformation(customers.johnDoe);
    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);
    await expect(checkoutStepTwoPage.subtotalLabel).toHaveText(totals.backpackAndBikeLight.itemTotal);
    await expect(checkoutStepTwoPage.taxLabel).toHaveText(totals.backpackAndBikeLight.tax);
    await expect(checkoutStepTwoPage.totalLabel).toHaveText(totals.backpackAndBikeLight.total);

    // 5. Click 'Finish'
    await checkoutStepTwoPage.finish();
    await expect(checkoutCompletePage.page).toHaveURL(/checkout-complete\.html/);
    await expect(checkoutCompletePage.completeHeader).toHaveText('Thank you for your order!');
    await expect(checkoutCompletePage.backHomeButton).toBeEnabled();

    // 6. Click 'Back Home'
    await checkoutCompletePage.backHome();
    await expect(inventoryPage.page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.cartBadge).toHaveCount(0);
  });
});
