// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect, testData } from './fixtures/saucedemo.fixture';

const { products } = testData;

test.describe('Cart Review (AC1)', () => {
  // TC-CART-001: Cart displays a single added item with correct name, description, price and quantity
  test('TC-CART-001 Cart displays a single added item with correct name, description, price and quantity', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
  }) => {
    // 1. Navigate to https://www.saucedemo.com and log in with standard_user / secret_sauce
    await loginAsStandardUser();
    await expect(inventoryPage.page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.inventoryItems).toHaveCount(6);

    // 2. Click "Add to cart" on Sauce Labs Backpack
    await inventoryPage.addToCart(products.backpack.slug);
    await expect(inventoryPage.removeButton(products.backpack.slug)).toHaveText('Remove');
    await expect(inventoryPage.header.cartBadge).toHaveText('1');

    // 3. Click the shopping cart icon in the header
    await inventoryPage.header.openCart();
    await expect(cartPage.page).toHaveURL(/\/cart\.html$/);
    await expect(cartPage.pageTitle).toHaveText('Your Cart');

    // 4. Inspect the single cart line item
    await expect(cartPage.itemQuantity(products.backpack.name)).toHaveText('1');
    await expect(cartPage.itemNameLink(products.backpack.name)).toBeVisible();
    await expect(cartPage.itemDescription(products.backpack.name)).toHaveText(products.backpack.description);
    await expect(cartPage.itemPrice(products.backpack.name)).toHaveText(products.backpack.price);
    await expect(cartPage.itemRemoveButton(products.backpack.name)).toBeVisible();
  });

  // TC-CART-002: Cart displays multiple items each with correct independent details
  test('TC-CART-002 Cart displays multiple items each with correct independent details', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
  }) => {
    // 1. Log in and add "Sauce Labs Backpack" then "Sauce Labs Bike Light" to the cart from the Products page
    await loginAsStandardUser();
    await inventoryPage.addMultipleToCart([products.backpack.slug, products.bikeLight.slug]);
    await expect(inventoryPage.header.cartBadge).toHaveText('2');

    // 2. Open the Cart page
    await inventoryPage.header.openCart();
    await expect(cartPage.cartItems).toHaveCount(2);
    await expect(cartPage.itemQuantity(products.backpack.name)).toHaveText('1');
    await expect(cartPage.itemDescription(products.backpack.name)).toHaveText(products.backpack.description);
    await expect(cartPage.itemPrice(products.backpack.name)).toHaveText(products.backpack.price);
    await expect(cartPage.itemQuantity(products.bikeLight.name)).toHaveText('1');
    await expect(cartPage.itemDescription(products.bikeLight.name)).toHaveText(products.bikeLight.description);
    await expect(cartPage.itemPrice(products.bikeLight.name)).toHaveText(products.bikeLight.price);
    await expect(cartPage.itemRemoveButton(products.backpack.name)).toBeVisible();
    await expect(cartPage.itemRemoveButton(products.bikeLight.name)).toBeVisible();
  });

  // TC-CART-003: Continue Shopping button returns to the Products page and preserves cart contents
  test('TC-CART-003 Continue Shopping button returns to the Products page and preserves cart contents', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
  }) => {
    // 1. Add Sauce Labs Backpack to cart and open /cart.html
    await loginAsStandardUser();
    await inventoryPage.addToCart(products.backpack.slug);
    await inventoryPage.header.openCart();
    await expect(cartPage.itemRow(products.backpack.name)).toBeVisible();

    // 2. Click "Continue Shopping"
    await cartPage.continueShopping();
    await expect(inventoryPage.page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.header.cartBadge).toHaveText('1');
  });

  // TC-CART-004: Checkout button on Cart page navigates to Checkout Information page
  test('TC-CART-004 Checkout button on Cart page navigates to Checkout Information page', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
  }) => {
    // 1. With >=1 item in the cart, open /cart.html and click "Checkout"
    await loginAsStandardUser();
    await inventoryPage.addToCart(products.backpack.slug);
    await inventoryPage.header.openCart();
    await cartPage.checkout();

    await expect(checkoutStepOnePage.page).toHaveURL(/\/checkout-step-one\.html$/);
    await expect(checkoutStepOnePage.pageTitle).toHaveText('Checkout: Your Information');
    await expect(checkoutStepOnePage.firstNameInput).toBeVisible();
    await expect(checkoutStepOnePage.firstNameInput).toHaveValue('');
    await expect(checkoutStepOnePage.lastNameInput).toBeVisible();
    await expect(checkoutStepOnePage.lastNameInput).toHaveValue('');
    await expect(checkoutStepOnePage.postalCodeInput).toBeVisible();
    await expect(checkoutStepOnePage.postalCodeInput).toHaveValue('');
  });

  // TC-CART-005: Removing one item from a multi-item cart updates the badge count and removes only that row
  test('TC-CART-005 Removing one item from a multi-item cart updates the badge count and removes only that row', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
  }) => {
    // 1. Add 2 items to the cart and open /cart.html
    await loginAsStandardUser();
    await inventoryPage.addMultipleToCart([products.backpack.slug, products.bikeLight.slug]);
    await inventoryPage.header.openCart();
    await expect(cartPage.cartItems).toHaveCount(2);
    await expect(cartPage.header.cartBadge).toHaveText('2');

    // 2. Click "Remove" on the Sauce Labs Bike Light row
    await cartPage.removeItem(products.bikeLight.name);
    await expect(cartPage.itemRow(products.bikeLight.name)).toHaveCount(0);
    await expect(cartPage.header.cartBadge).toHaveText('1');
    await expect(cartPage.itemQuantity(products.backpack.name)).toHaveText('1');
    await expect(cartPage.itemDescription(products.backpack.name)).toHaveText(products.backpack.description);
    await expect(cartPage.itemPrice(products.backpack.name)).toHaveText(products.backpack.price);
  });

  // TC-CART-006: Removing all items empties the cart and clears the badge
  test('TC-CART-006 Removing all items empties the cart and clears the badge', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
  }) => {
    // 1. Add 1 item to cart, open /cart.html, click "Remove" on that item
    await loginAsStandardUser();
    await inventoryPage.addToCart(products.backpack.slug);
    await inventoryPage.header.openCart();
    await cartPage.removeItem(products.backpack.name);

    await expect(cartPage.itemRow(products.backpack.name)).toHaveCount(0);
    await expect(cartPage.header.cartBadge).toHaveCount(0);
    await expect(cartPage.continueShoppingButton).toBeVisible();
    await expect(cartPage.checkoutButton).toBeVisible();
  });

  // TC-CART-007: Cart page with zero items still renders its standard layout and controls (boundary: zero items)
  test('TC-CART-007 Cart page with zero items still renders its standard layout and controls', async ({
    loginAsStandardUser,
    cartPage,
  }) => {
    // 1. With an empty cart, navigate directly to /cart.html
    await loginAsStandardUser();
    await cartPage.open();

    await expect(cartPage.pageTitle).toHaveText('Your Cart');
    await expect(cartPage.cartItems).toHaveCount(0);
    await expect(cartPage.continueShoppingButton).toBeVisible();
    await expect(cartPage.checkoutButton).toBeEnabled();

    // 2. Note actual behavior for later cross-reference with Business Rule 3:
    // the Checkout button is clickable even with zero items (see TC-ACCESS-002 for the full downstream flow).
    await expect(cartPage.checkoutButton).toBeEnabled();
  });

  // TC-CART-008: Unauthenticated user cannot access the Cart page directly (negative, access control)
  test('TC-CART-008 Unauthenticated user cannot access the Cart page directly', async ({ loginPage, cartPage }) => {
    // 1. Without logging in, navigate directly to https://www.saucedemo.com/cart.html
    await cartPage.open();

    await expect(loginPage.page).toHaveURL(`${loginPage.url}`);
    await expect(loginPage.errorBanner).toHaveText(testData.messages.loginRequired.cart);
  });

  // TC-CART-009: Cart line items have no quantity increment/decrement controls (UI validation)
  test('TC-CART-009 Cart line items have no quantity increment/decrement controls', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
  }) => {
    // 1. Add 1 item to the cart and open /cart.html
    await loginAsStandardUser();
    await inventoryPage.addToCart(products.backpack.slug);
    await inventoryPage.header.openCart();

    await expect(cartPage.itemQuantity(products.backpack.name)).toHaveText('1');
    // There is no in-cart mechanism to change quantity; the only line-level action is "Remove".
    await expect(cartPage.itemRow(products.backpack.name).locator('input, select')).toHaveCount(0);
    await expect(cartPage.itemRow(products.backpack.name).getByRole('button')).toHaveCount(1);
    await expect(cartPage.itemRemoveButton(products.backpack.name)).toBeVisible();
  });
});
