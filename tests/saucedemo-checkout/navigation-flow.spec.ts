// spec: specs/saucedemo-checkout-test-plan.md (Suite 6: Navigation Flow - Cancel and Browser Back Button)
// seed: tests/seed.spec.ts
import { test, expect, loginAsStandardUser } from './fixtures/saucedemo.fixture';
import products from './test-data/products.json';
import checkoutInfo from './test-data/checkout-info.json';
import totals from './test-data/totals.json';

test.describe('Navigation Flow: Cancel and Browser Back Button', () => {
  test('TC-CHECKOUT-NAV-001 Cancel on Step One returns to the Cart page (business rule 5)', async ({
    loginPage,
    inventoryPage,
    cartPage,
    checkoutInformationPage,
  }) => {
    // 1. Preconditions: log in, add an item to cart, navigate to /checkout-step-one.html.
    await loginAsStandardUser(loginPage);
    await inventoryPage.addProductToCart(products.backpack.slug);
    await checkoutInformationPage.open();

    // 2. Click the 'Cancel' button without entering any data.
    await checkoutInformationPage.clickCancel();
    await expect(cartPage.page).toHaveURL(/cart\.html/);
    await expect(cartPage.itemRow(products.backpack.name)).toHaveCount(1);
  });

  test('TC-CHECKOUT-NAV-002 Cancel on Overview returns to the Products page, not the Cart (confirmed asymmetry)', async ({
    loginPage,
    inventoryPage,
    cartPage,
    checkoutInformationPage,
    checkoutOverviewPage,
  }) => {
    // 1. Preconditions: log in, add an item to cart, complete Step One with valid data, reach the Overview page.
    await loginAsStandardUser(loginPage);
    await inventoryPage.addProductToCart(products.backpack.slug);
    await checkoutInformationPage.open();
    await checkoutInformationPage.submitInformation(checkoutInfo.valid);
    await expect(checkoutOverviewPage.cartItems).toHaveCount(1);

    // 2. Click the 'Cancel' button.
    await checkoutOverviewPage.clickCancel();
    // Confirmed live: lands on /inventory.html, NOT /cart.html — a real asymmetry vs. Cancel on Step One.
    await expect(inventoryPage.page).toHaveURL(/inventory\.html/);

    // 3. Navigate to /cart.html to check cart state.
    await cartPage.open();
    await expect(cartPage.itemRow(products.backpack.name)).toHaveCount(1);
  });

  test('TC-CHECKOUT-NAV-003 Browser Back from Step Two returns to Step One with cleared form fields', async ({
    loginPage,
    inventoryPage,
    checkoutInformationPage,
    checkoutOverviewPage,
  }) => {
    // 1. Preconditions: log in, add an item, fill valid info on Step One, click Continue to reach the Overview page.
    await loginAsStandardUser(loginPage);
    await inventoryPage.addProductToCart(products.backpack.slug);
    await checkoutInformationPage.open();
    await checkoutInformationPage.submitInformation(checkoutInfo.valid);
    await expect(checkoutOverviewPage.page).toHaveURL(/checkout-step-two\.html/);

    // 2. Click the browser's Back button.
    await checkoutOverviewPage.page.goBack();
    await expect(checkoutInformationPage.page).toHaveURL(/checkout-step-one\.html/);
    await expect(checkoutInformationPage.firstNameInput).toHaveValue('');
    await expect(checkoutInformationPage.lastNameInput).toHaveValue('');
    await expect(checkoutInformationPage.postalCodeInput).toHaveValue('');
  });

  test('TC-CHECKOUT-NAV-004 Browser Back after order completion shows a stale, zeroed-out Overview page', async ({
    loginPage,
    inventoryPage,
    checkoutInformationPage,
    checkoutOverviewPage,
    checkoutCompletePage,
  }) => {
    // 1. Preconditions: log in, add one item, complete the full checkout flow through Finish.
    await loginAsStandardUser(loginPage);
    await inventoryPage.addProductToCart(products.backpack.slug);
    await checkoutInformationPage.open();
    await checkoutInformationPage.submitInformation(checkoutInfo.valid);
    await checkoutOverviewPage.clickFinish();
    await expect(checkoutCompletePage.page).toHaveURL(/checkout-complete\.html/);

    // 2. Click the browser's Back button.
    await checkoutCompletePage.page.goBack();
    await expect(checkoutOverviewPage.page).toHaveURL(/checkout-step-two\.html/);
    await expect(checkoutOverviewPage.cartItems).toHaveCount(0);
    await expect(checkoutOverviewPage.subtotalLabel).toHaveText(`Item total: ${totals.emptyCart.itemTotal}`);
    await expect(checkoutOverviewPage.taxLabel).toHaveText(`Tax: ${totals.emptyCart.tax}`);
    await expect(checkoutOverviewPage.totalLabel).toHaveText(`Total: ${totals.emptyCart.total}`);
  });

  test('TC-CHECKOUT-NAV-005-DuplicateFinish Clicking Finish again on the stale post-completion Overview page is not blocked', async ({
    loginPage,
    inventoryPage,
    checkoutInformationPage,
    checkoutOverviewPage,
    checkoutCompletePage,
  }) => {
    // 1. Preconditions: complete an order, then use Back to land on the stale /checkout-step-two.html with $0 totals.
    await loginAsStandardUser(loginPage);
    await inventoryPage.addProductToCart(products.backpack.slug);
    await checkoutInformationPage.open();
    await checkoutInformationPage.submitInformation(checkoutInfo.valid);
    await checkoutOverviewPage.clickFinish();
    await checkoutCompletePage.page.goBack();
    await expect(checkoutOverviewPage.page).toHaveURL(/checkout-step-two\.html/);
    await expect(checkoutOverviewPage.subtotalLabel).toHaveText(`Item total: ${totals.emptyCart.itemTotal}`);

    // 2. Click 'Finish' again.
    await checkoutOverviewPage.clickFinish();
    // Confirmed observed behavior: the app allows navigating to the confirmation page again with no real order data.
    await expect(checkoutCompletePage.page).toHaveURL(/checkout-complete\.html/);
    await expect(checkoutCompletePage.completeHeader).toBeVisible();
  });

  test('TC-CHECKOUT-NAV-006 Browser Back after Cancel from Step One shows an empty form with cart state unchanged', async ({
    loginPage,
    inventoryPage,
    cartPage,
    checkoutInformationPage,
  }) => {
    // 1. Preconditions: log in, add an item, navigate to /checkout-step-one.html, click Cancel to land on /cart.html.
    await loginAsStandardUser(loginPage);
    await inventoryPage.addProductToCart(products.backpack.slug);
    await checkoutInformationPage.open();
    await checkoutInformationPage.clickCancel();
    await expect(cartPage.page).toHaveURL(/cart\.html/);
    await expect(cartPage.cartBadge).toHaveText('1');

    // 2. Click the browser's Back button.
    await cartPage.page.goBack();
    await expect(checkoutInformationPage.page).toHaveURL(/checkout-step-one\.html/);
    await expect(checkoutInformationPage.firstNameInput).toHaveValue('');
    await expect(checkoutInformationPage.lastNameInput).toHaveValue('');
    await expect(checkoutInformationPage.postalCodeInput).toHaveValue('');
    await expect(checkoutInformationPage.cartBadge).toHaveText('1');
  });

  test('TC-CHECKOUT-NAV-007 Cancel from Step One with multiple cart items preserves all items', async ({
    loginPage,
    inventoryPage,
    cartPage,
    checkoutInformationPage,
  }) => {
    // 1. Preconditions: log in, add 3 different items to the cart, click Checkout to reach /checkout-step-one.html.
    await loginAsStandardUser(loginPage);
    await inventoryPage.addProductsToCart([products.backpack.slug, products.bikeLight.slug, products.boltTShirt.slug]);
    await expect(inventoryPage.cartBadge).toHaveText('3');
    await inventoryPage.goToCart();
    await cartPage.goToCheckout();
    await expect(checkoutInformationPage.page).toHaveURL(/checkout-step-one\.html/);

    // 2. Click 'Cancel'.
    await checkoutInformationPage.clickCancel();
    await expect(cartPage.page).toHaveURL(/cart\.html/);
    await expect(cartPage.cartItems).toHaveCount(3);
    await expect(cartPage.itemRow(products.backpack.name)).toHaveCount(1);
    await expect(cartPage.itemRow(products.bikeLight.name)).toHaveCount(1);
    await expect(cartPage.itemRow(products.boltTShirt.name)).toHaveCount(1);
  });
});
