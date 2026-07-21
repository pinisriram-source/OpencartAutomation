// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from './fixtures/saucedemo.fixture';
import testData from './test-data/checkout-data.json';

const { credentials, products } = testData;
const backpack = products.backpack;
const bikeLight = products.bikeLight;

test.describe('AC1 - Cart Review', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login(credentials.standardUser.username, credentials.standardUser.password);
  });

  test('TC-CART-001 cart displays single added item with correct name, description, price, and quantity', async ({ inventoryPage, cartPage }) => {
    // 1. Login at https://www.saucedemo.com with standard_user / secret_sauce
    await expect(inventoryPage.page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.title).toHaveText('Products');

    // 2. Click 'Add to cart' on 'Sauce Labs Backpack'
    const inventoryDescription = await inventoryPage.description(backpack.name).textContent();
    await inventoryPage.addToCart(backpack.name);
    await expect(inventoryPage.removeButton(backpack.name)).toBeVisible();
    await expect(inventoryPage.cartBadge).toHaveText('1');

    // 3. Click the cart icon to open /cart.html
    await inventoryPage.openCart();
    await expect(cartPage.page).toHaveURL(/cart\.html/);
    await expect(cartPage.title).toHaveText('Your Cart');

    // 4. Inspect the single line item row
    await expect(cartPage.quantity(backpack.name)).toHaveText('1');
    await expect(cartPage.name(backpack.name)).toHaveText(backpack.name);
    await expect(cartPage.description(backpack.name)).toHaveText(inventoryDescription ?? '');
    await expect(cartPage.price(backpack.name)).toHaveText(backpack.price);
    await expect(cartPage.removeButton(backpack.name)).toBeVisible();

    // 5. Verify page-level controls
    await expect(cartPage.continueShoppingButton).toBeEnabled();
    await expect(cartPage.checkoutButton).toBeEnabled();
  });

  test('TC-CART-002 cart displays multiple items with correct per-item details', async ({ inventoryPage, cartPage }) => {
    // 1. Login as standard_user and on /inventory.html click 'Add to cart' for 'Sauce Labs Backpack' then for 'Sauce Labs Bike Light'
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.addToCart(bikeLight.name);
    await expect(inventoryPage.cartBadge).toHaveText('2');
    await expect(inventoryPage.removeButton(backpack.name)).toBeVisible();
    await expect(inventoryPage.removeButton(bikeLight.name)).toBeVisible();

    // 2. Navigate to /cart.html
    await inventoryPage.openCart();
    await expect(cartPage.cartItems).toHaveCount(2);

    // 3. Verify each row independently
    await expect(cartPage.quantity(backpack.name)).toHaveText('1');
    await expect(cartPage.name(backpack.name)).toHaveText(backpack.name);
    await expect(cartPage.description(backpack.name)).not.toBeEmpty();
    await expect(cartPage.price(backpack.name)).toHaveText(backpack.price);
    await expect(cartPage.removeButton(backpack.name)).toBeVisible();

    await expect(cartPage.quantity(bikeLight.name)).toHaveText('1');
    await expect(cartPage.name(bikeLight.name)).toHaveText(bikeLight.name);
    await expect(cartPage.description(bikeLight.name)).not.toBeEmpty();
    await expect(cartPage.price(bikeLight.name)).toHaveText(bikeLight.price);
    await expect(cartPage.removeButton(bikeLight.name)).toBeVisible();

    // 4. Verify item order and no cross-contamination of data between rows
    await expect(cartPage.price(backpack.name)).not.toHaveText(bikeLight.price);
    await expect(cartPage.price(bikeLight.name)).not.toHaveText(backpack.price);
  });

  test('TC-CART-003 removing an item from the cart updates the list and badge count', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.addToCart(bikeLight.name);
    await inventoryPage.openCart();

    // 1. From /cart.html, click 'Remove' on the 'Sauce Labs Bike Light' row
    await cartPage.removeItem(bikeLight.name);
    await expect(cartPage.lineItem(bikeLight.name)).toHaveCount(0);
    await expect(cartPage.cartBadge).toHaveText('1');

    // 2. Verify remaining item
    await expect(cartPage.lineItem(backpack.name)).toHaveCount(1);
    await expect(cartPage.price(backpack.name)).toHaveText(backpack.price);

    // 3. Remove the last remaining item ('Sauce Labs Backpack')
    await cartPage.removeItem(backpack.name);
    await expect(cartPage.cartItems).toHaveCount(0);
    // The badge element is not rendered at all (rather than hidden) once the cart is empty.
    await expect(cartPage.cartBadge).toHaveCount(0);
  });

  test('TC-CART-004 continue shopping returns to Products page without altering cart contents', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.openCart();

    // 1. From /cart.html with 1 item present, click 'Continue Shopping'
    await cartPage.continueShopping();
    await expect(inventoryPage.page).toHaveURL(/inventory\.html/);

    // 2. Verify cart state is preserved
    await expect(inventoryPage.cartBadge).toHaveText('1');
    await expect(inventoryPage.removeButton(backpack.name)).toBeVisible();

    // 3. Re-open the cart via the cart icon
    await inventoryPage.openCart();
    await expect(cartPage.lineItem(backpack.name)).toHaveCount(1);
    await expect(cartPage.price(backpack.name)).toHaveText(backpack.price);
  });

  test('TC-CART-005 checkout button from cart navigates to Checkout Information page', async ({ inventoryPage, cartPage, checkoutStepOnePage }) => {
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.openCart();

    // 1. From /cart.html, click 'Checkout'
    await cartPage.checkout();
    await expect(checkoutStepOnePage.page).toHaveURL(/checkout-step-one\.html/);
    await expect(checkoutStepOnePage.title).toHaveText('Checkout: Your Information');
  });

  test('TC-CART-006-EmptyCart cart page with zero items shows no line items and no totals', async ({ cartPage }) => {
    // 1. Login as standard_user and navigate directly to /cart.html without adding any product
    await cartPage.open();
    await expect(cartPage.title).toHaveText('Your Cart');
    await expect(cartPage.cartItems).toHaveCount(0);
    await expect(cartPage.cartBadge).toHaveCount(0);

    // 2. Verify page controls remain available
    await expect(cartPage.continueShoppingButton).toBeEnabled();
    await expect(cartPage.checkoutButton).toBeEnabled();
  });
});
