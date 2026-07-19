// spec: specs/saucedemo-checkout-test-plan.md (section 7. Full End-to-End Happy Path Smoke Tests)
// seed: tests/seed.spec.ts

import { test, expect } from './fixtures/saucedemo.fixture';
import { LoginPage } from './pages/LoginPage';
import products from './test-data/products.json';
import customer from './test-data/customer.json';
import users from './test-data/users.json';
import { calculateTax, calculateTotal, formatMoney } from './utils/pricing';

test.describe('Full End-to-End Happy Path (Cross-cutting Smoke Tests)', () => {
  test('TC-CHECKOUT-E2E-001 - Complete guest-style checkout for a single item from login to confirmation @smoke', async ({ page, cartPage, checkoutStepOnePage, checkoutStepTwoPage, checkoutCompletePage }) => {
    // Preconditions: fresh browser session, not logged in.
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await expect(loginPage.usernameInput).toBeVisible();

    // 1. Log in with username 'standard_user' and password 'secret_sauce'.
    const inventoryPage = await loginPage.login(users.standard.username, users.standard.password);
    await expect(inventoryPage.page).toHaveURL(/\/inventory\.html$/);

    // 2. Click 'Add to cart' for 'Sauce Labs Backpack'.
    await inventoryPage.addProductToCart(products.backpack.id);
    await expect(inventoryPage.cartBadge).toHaveText('1');
    await expect(inventoryPage.removeButton(products.backpack.id)).toBeVisible();

    // 3. Click the cart icon to go to /cart.html.
    await inventoryPage.goToCart();
    await expect(cartPage.itemQty(products.backpack.name)).toHaveText('1');
    await expect(cartPage.itemPrice(products.backpack.name)).toHaveText(formatMoney(products.backpack.price));

    // 4. Click 'Checkout'.
    await cartPage.proceedToCheckout();
    await expect(checkoutStepOnePage.page).toHaveURL(/\/checkout-step-one\.html$/);

    // 5. Enter First Name, Last Name, Zip. Click 'Continue'.
    await checkoutStepOnePage.fillInfo(customer.valid.firstName, customer.valid.lastName, customer.valid.postalCode);
    await checkoutStepOnePage.continueToOverview();
    const tax = calculateTax(products.backpack.price);
    const total = calculateTotal(products.backpack.price);
    await expect(checkoutStepTwoPage.cartItems).toHaveCount(1);
    await expect(checkoutStepTwoPage.subtotalLabel).toHaveText(`Item total: ${formatMoney(products.backpack.price)}`);
    await expect(checkoutStepTwoPage.taxLabel).toHaveText(`Tax: ${formatMoney(tax)}`);
    await expect(checkoutStepTwoPage.totalLabel).toHaveText(`Total: ${formatMoney(total)}`);

    // 6. Click 'Finish'.
    await checkoutStepTwoPage.finish();
    await expect(checkoutCompletePage.page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(checkoutCompletePage.completeHeader).toHaveText('Thank you for your order!');
    await expect(checkoutCompletePage.backHomeButton).toBeVisible();

    // 7. Click 'Back Home'.
    await checkoutCompletePage.backHome();
    await expect(checkoutCompletePage.page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.cartBadge).toBeHidden();
  });

  test('TC-CHECKOUT-E2E-002 - Complete checkout with multiple items and verify math end-to-end @smoke', async ({ loggedInPage, cartPage, checkoutStepOnePage, checkoutStepTwoPage, checkoutCompletePage }) => {
    // Preconditions: standard_user with an empty cart.
    await expect(loggedInPage.page).toHaveURL(/\/inventory\.html$/);
    await expect(loggedInPage.cartBadge).toBeHidden();

    // 1. Add Backpack, Bike Light, and Bolt T-Shirt to the cart.
    await loggedInPage.addProductToCart(products.backpack.id);
    await loggedInPage.addProductToCart(products.bikeLight.id);
    await loggedInPage.addProductToCart(products.boltTShirt.id);
    await expect(loggedInPage.cartBadge).toHaveText('3');

    // 2. Navigate to /cart.html and verify all 3 items with correct names/descriptions/prices/qty.
    await loggedInPage.goToCart();
    await expect(cartPage.cartItems).toHaveCount(3);
    await expect(cartPage.itemPrice(products.backpack.name)).toHaveText(formatMoney(products.backpack.price));
    await expect(cartPage.itemPrice(products.bikeLight.name)).toHaveText(formatMoney(products.bikeLight.price));
    await expect(cartPage.itemPrice(products.boltTShirt.name)).toHaveText(formatMoney(products.boltTShirt.price));
    await expect(cartPage.checkoutButton).toBeEnabled();

    // 3. Click 'Checkout', enter valid First Name/Last Name/Zip, click 'Continue'.
    await cartPage.proceedToCheckout();
    await checkoutStepOnePage.fillInfo(customer.valid.firstName, customer.valid.lastName, customer.valid.postalCode);
    await checkoutStepOnePage.continueToOverview();
    const itemTotal = products.backpack.price + products.bikeLight.price + products.boltTShirt.price;
    const tax = calculateTax(itemTotal);
    const total = calculateTotal(itemTotal);
    expect(formatMoney(itemTotal)).toBe('$55.97');
    await expect(checkoutStepTwoPage.cartItems).toHaveCount(3);
    await expect(checkoutStepTwoPage.subtotalLabel).toHaveText(`Item total: ${formatMoney(itemTotal)}`);
    await expect(checkoutStepTwoPage.taxLabel).toHaveText(`Tax: ${formatMoney(tax)}`);
    await expect(checkoutStepTwoPage.totalLabel).toHaveText(`Total: ${formatMoney(total)}`);

    // 4. Click 'Finish'.
    await checkoutStepTwoPage.finish();
    await expect(checkoutCompletePage.completeHeader).toHaveText('Thank you for your order!');

    // 5. Navigate to /cart.html.
    await cartPage.goto();
    await expect(cartPage.cartItems).toHaveCount(0);
  });
});
