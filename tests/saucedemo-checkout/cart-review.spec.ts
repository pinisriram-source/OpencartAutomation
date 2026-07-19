// spec: specs/saucedemo-checkout-test-plan.md (section 1. Cart Review)
// seed: tests/seed.spec.ts

import { test, expect } from './fixtures/saucedemo.fixture';
import products from './test-data/products.json';

test.describe('Cart Review', () => {
  test('TC-CART-001 - Cart displays single item with full details', async ({ loggedInPage, cartPage }) => {
    // 1. On the Products page, click 'Add to cart' for 'Sauce Labs Backpack'.
    await loggedInPage.addProductToCart(products.backpack.id);
    await expect(loggedInPage.removeButton(products.backpack.id)).toBeVisible();
    await expect(loggedInPage.cartBadge).toHaveText('1');

    // 2. Click the cart icon to navigate to the cart page (/cart.html).
    await loggedInPage.goToCart();
    await expect(loggedInPage.page).toHaveURL(/\/cart\.html$/);
    await expect(cartPage.heading).toHaveText('Your Cart');
    await expect(cartPage.qtyHeader).toBeVisible();
    await expect(cartPage.descHeader).toBeVisible();

    // 3. Verify the line item for Sauce Labs Backpack.
    await expect(cartPage.itemQty(products.backpack.name)).toHaveText('1');
    await expect(cartPage.itemNameLink(products.backpack.name)).toBeVisible();
    await expect(cartPage.itemDescription(products.backpack.name)).toHaveText(products.backpack.description);
    await expect(cartPage.itemPrice(products.backpack.name)).toHaveText(`$${products.backpack.price}`);
    await expect(cartPage.removeButton(products.backpack.name)).toBeVisible();

    // 4. Verify page-level controls.
    await expect(cartPage.continueShoppingButton).toBeEnabled();
    await expect(cartPage.checkoutButton).toBeEnabled();
  });

  test('TC-CART-002 - Cart displays multiple items with correct details for each', async ({ loggedInPage, cartPage }) => {
    // 1. Add 'Sauce Labs Backpack' ($29.99) and 'Sauce Labs Bike Light' ($9.99) to the cart from the Products page.
    await loggedInPage.addProductToCart(products.backpack.id);
    await loggedInPage.addProductToCart(products.bikeLight.id);
    await expect(loggedInPage.cartBadge).toHaveText('2');

    // 2. Navigate to the cart page.
    await loggedInPage.goToCart();
    await expect(cartPage.cartItems).toHaveCount(2);

    // 3. Verify each row independently.
    await expect(cartPage.itemQty(products.backpack.name)).toHaveText('1');
    await expect(cartPage.itemDescription(products.backpack.name)).toHaveText(products.backpack.description);
    await expect(cartPage.itemPrice(products.backpack.name)).toHaveText(`$${products.backpack.price}`);
    await expect(cartPage.removeButton(products.backpack.name)).toBeVisible();

    await expect(cartPage.itemQty(products.bikeLight.name)).toHaveText('1');
    await expect(cartPage.itemDescription(products.bikeLight.name)).toHaveText(products.bikeLight.description);
    await expect(cartPage.itemPrice(products.bikeLight.name)).toHaveText(`$${products.bikeLight.price}`);
    await expect(cartPage.removeButton(products.bikeLight.name)).toBeVisible();

    // Item order matches the order products were added.
    await expect(cartPage.cartItems.nth(0)).toContainText(products.backpack.name);
    await expect(cartPage.cartItems.nth(1)).toContainText(products.bikeLight.name);
  });

  test('TC-CART-003 - Continue Shopping returns user to Products page', async ({ loggedInPage, cartPage }) => {
    // Preconditions: add at least one item to the cart, navigate to /cart.html.
    await loggedInPage.addProductToCart(products.backpack.id);
    await loggedInPage.goToCart();
    await expect(cartPage.cartItems).toHaveCount(1);

    // 1. Click the 'Continue Shopping' button.
    await cartPage.continueShopping();
    await expect(cartPage.page).toHaveURL(/\/inventory\.html$/);
    await expect(cartPage.cartBadge).toHaveText('1');
  });

  test('TC-CART-004 - Proceed to Checkout from cart with items present', async ({ loggedInPage, cartPage, checkoutStepOnePage }) => {
    // Preconditions: add at least one item to the cart, navigate to /cart.html.
    await loggedInPage.addProductToCart(products.backpack.id);
    await loggedInPage.goToCart();
    await expect(cartPage.cartItems).toHaveCount(1);

    // 1. Click the 'Checkout' button.
    await cartPage.proceedToCheckout();
    await expect(cartPage.page).toHaveURL(/\/checkout-step-one\.html$/);
    await expect(checkoutStepOnePage.heading).toHaveText('Checkout: Your Information');
    await expect(checkoutStepOnePage.cartBadge).toHaveText('1');
  });

  test('TC-CART-005 - Removing an item from the cart updates the list', async ({ loggedInPage, cartPage }) => {
    // Preconditions: add 'Sauce Labs Backpack' and 'Sauce Labs Bike Light' to cart, navigate to /cart.html.
    await loggedInPage.addProductToCart(products.backpack.id);
    await loggedInPage.addProductToCart(products.bikeLight.id);
    await loggedInPage.goToCart();
    await expect(cartPage.cartItems).toHaveCount(2);
    await expect(cartPage.cartBadge).toHaveText('2');

    // 1. Click 'Remove' on the Sauce Labs Backpack row.
    await cartPage.removeItem(products.backpack.name);
    await expect(cartPage.itemNameLink(products.backpack.name)).toBeHidden();
    await expect(cartPage.itemQty(products.bikeLight.name)).toHaveText('1');
    await expect(cartPage.itemPrice(products.bikeLight.name)).toHaveText(`$${products.bikeLight.price}`);
    await expect(cartPage.cartBadge).toHaveText('1');
  });

  test('TC-CART-006-EmptyCart - Cart page with zero items shows no line items but retains action buttons', async ({ loggedInPage, cartPage }) => {
    // Preconditions: standard_user with a cart that has never had items added.
    await expect(loggedInPage.cartBadge).toBeHidden();

    // 1. Navigate to /cart.html.
    await loggedInPage.goToCart();
    await expect(cartPage.qtyHeader).toBeVisible();
    await expect(cartPage.descHeader).toBeVisible();
    await expect(cartPage.cartItems).toHaveCount(0);
    await expect(cartPage.continueShoppingButton).toBeVisible();
    await expect(cartPage.checkoutButton).toBeVisible();
    await expect(cartPage.checkoutButton).toBeEnabled();
  });
});
