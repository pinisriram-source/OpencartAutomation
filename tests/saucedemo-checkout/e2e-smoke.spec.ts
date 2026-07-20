// spec: specs/saucedemo-checkout-test-plan.md (Suite 7: Full End-to-End Happy Path - Cross-cutting Smoke Tests)
// seed: tests/seed.spec.ts
import { test, expect } from './fixtures/saucedemo.fixture';
import credentials from './test-data/credentials.json';
import products from './test-data/products.json';
import checkoutInfo from './test-data/checkout-info.json';
import messages from './test-data/messages.json';
import totals from './test-data/totals.json';

test.describe('Full End-to-End Happy Path (Cross-cutting Smoke Tests)', () => {
  test('TC-CHECKOUT-E2E-001 Complete a single-item checkout from login to confirmation', async ({
    loginPage,
    inventoryPage,
    cartPage,
    checkoutInformationPage,
    checkoutOverviewPage,
    checkoutCompletePage,
  }) => {
    // 1. Preconditions: fresh browser session, not logged in.
    await loginPage.open();

    // 2. Log in with username 'standard_user' and password 'secret_sauce'.
    await loginPage.login(credentials.standardUser.username, credentials.standardUser.password);
    await expect(inventoryPage.page).toHaveURL(/inventory\.html/);

    // 3. Click 'Add to cart' for 'Sauce Labs Backpack'.
    await inventoryPage.addProductToCart(products.backpack.slug);
    await expect(inventoryPage.cartBadge).toHaveText('1');
    await expect(inventoryPage.removeButton(products.backpack.slug)).toBeVisible();

    // 4. Click the cart icon to go to /cart.html.
    await inventoryPage.goToCart();
    const cartRow = cartPage.itemRow(products.backpack.name);
    await expect(cartPage.quantity(cartRow)).toHaveText('1');
    await expect(cartPage.price(cartRow)).toHaveText(`$${products.backpack.price}`);

    // 5. Click 'Checkout'.
    await cartPage.goToCheckout();
    await expect(checkoutInformationPage.page).toHaveURL(/checkout-step-one\.html/);

    // 6. Enter First Name, Last Name, Zip, click 'Continue'.
    await checkoutInformationPage.submitInformation(checkoutInfo.valid);
    await expect(checkoutOverviewPage.page).toHaveURL(/checkout-step-two\.html/);
    await expect(checkoutOverviewPage.cartItems).toHaveCount(1);
    await expect(checkoutOverviewPage.subtotalLabel).toHaveText(`Item total: ${totals.singleItem.itemTotal}`);
    await expect(checkoutOverviewPage.taxLabel).toHaveText(`Tax: ${totals.singleItem.tax}`);
    await expect(checkoutOverviewPage.totalLabel).toHaveText(`Total: ${totals.singleItem.total}`);

    // 7. Click 'Finish'.
    await checkoutOverviewPage.clickFinish();
    await expect(checkoutCompletePage.page).toHaveURL(/checkout-complete\.html/);
    await expect(checkoutCompletePage.completeHeader).toHaveText(messages.orderCompleteHeader);
    await expect(checkoutCompletePage.backHomeButton).toBeVisible();

    // 8. Click 'Back Home'.
    await checkoutCompletePage.clickBackHome();
    await expect(inventoryPage.page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.cartBadge).toHaveCount(0);
  });

  test('TC-CHECKOUT-E2E-002 Complete a multi-item checkout and verify math end-to-end', async ({
    loginPage,
    inventoryPage,
    cartPage,
    checkoutInformationPage,
    checkoutOverviewPage,
    checkoutCompletePage,
  }) => {
    // 1. Preconditions: log in as standard_user with an empty cart.
    await loginPage.open();
    await loginPage.login(credentials.standardUser.username, credentials.standardUser.password);
    await expect(inventoryPage.page).toHaveURL(/inventory\.html/);

    // 2. Add Backpack, Bike Light, and Bolt T-Shirt to the cart.
    await inventoryPage.addProductsToCart([products.backpack.slug, products.bikeLight.slug, products.boltTShirt.slug]);
    await expect(inventoryPage.cartBadge).toHaveText('3');

    // 3. Navigate to /cart.html and verify all 3 items with correct names/descriptions/prices/qty.
    await inventoryPage.goToCart();
    await expect(cartPage.cartItems).toHaveCount(3);
    for (const product of [products.backpack, products.bikeLight, products.boltTShirt]) {
      const row = cartPage.itemRow(product.name);
      await expect(cartPage.quantity(row)).toHaveText('1');
      await expect(cartPage.price(row)).toHaveText(`$${product.price}`);
    }
    await expect(cartPage.checkoutButton).toBeEnabled();

    // 4. Click 'Checkout', enter valid info, click 'Continue'.
    await cartPage.goToCheckout();
    await checkoutInformationPage.submitInformation(checkoutInfo.valid);
    await expect(checkoutOverviewPage.cartItems).toHaveCount(3);
    await expect(checkoutOverviewPage.subtotalLabel).toHaveText(`Item total: ${totals.threeItems.itemTotal}`);
    await expect(checkoutOverviewPage.taxLabel).toHaveText(`Tax: ${totals.threeItems.tax}`);
    await expect(checkoutOverviewPage.totalLabel).toHaveText(`Total: ${totals.threeItems.total}`);

    // 5. Click 'Finish'.
    await checkoutOverviewPage.clickFinish();
    await expect(checkoutCompletePage.completeHeader).toHaveText(messages.orderCompleteHeader);

    // 6. Navigate to /cart.html.
    await cartPage.open();
    await expect(cartPage.cartItems).toHaveCount(0);
  });
});
