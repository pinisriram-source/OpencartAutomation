// spec: specs/saucedemo-checkout-test-plan.md (Suite 1: Cart Review)
// seed: tests/seed.spec.ts
import { test, expect, loginAsStandardUser } from './fixtures/saucedemo.fixture';
import products from './test-data/products.json';

test.describe('Cart Review', () => {
  test('TC-CART-001 Cart displays a single item with full details', async ({
    loginPage,
    inventoryPage,
    cartPage,
  }) => {
    // 1. Preconditions: fresh session, log in as standard_user.
    await loginAsStandardUser(loginPage);
    await expect(inventoryPage.page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.inventoryItems).toHaveCount(6);

    // 2. Add 'Sauce Labs Backpack' to the cart.
    await inventoryPage.addProductToCart(products.backpack.slug);
    await expect(inventoryPage.removeButton(products.backpack.slug)).toBeVisible();
    await expect(inventoryPage.cartBadge).toHaveText('1');

    // 3. Click the cart icon to navigate to /cart.html.
    await inventoryPage.goToCart();
    await expect(cartPage.page).toHaveURL(/cart\.html/);
    await expect(cartPage.title).toHaveText('Your Cart');
    await expect(cartPage.cartQuantityLabel).toBeVisible();
    await expect(cartPage.cartDescLabel).toBeVisible();

    // 4. Verify the Sauce Labs Backpack line item in detail.
    const row = cartPage.itemRow(products.backpack.name);
    await expect(cartPage.quantity(row)).toHaveText('1');
    await expect(cartPage.name(row)).toHaveText(products.backpack.name);
    await expect(cartPage.description(row)).not.toBeEmpty();
    await expect(cartPage.price(row)).toHaveText(`$${products.backpack.price}`);
    await expect(cartPage.removeButtonInRow(row)).toBeVisible();

    // 5. Verify page-level controls below the item list.
    await expect(cartPage.continueShoppingButton).toBeEnabled();
    await expect(cartPage.checkoutButton).toBeEnabled();
  });

  test('TC-CART-002 Cart displays multiple items with correct details for each', async ({
    loginPage,
    inventoryPage,
    cartPage,
  }) => {
    // 1. Preconditions: log in with an empty cart.
    await loginAsStandardUser(loginPage);
    await expect(inventoryPage.cartBadge).toHaveCount(0);

    // 2. Add 'Sauce Labs Backpack' and 'Sauce Labs Bike Light' to the cart.
    await inventoryPage.addProductsToCart([products.backpack.slug, products.bikeLight.slug]);
    await expect(inventoryPage.cartBadge).toHaveText('2');

    // 3. Navigate to /cart.html.
    await inventoryPage.goToCart();
    await expect(cartPage.cartItems).toHaveCount(2);

    // 4. Verify each row independently.
    const backpackRow = cartPage.itemRow(products.backpack.name);
    await expect(cartPage.quantity(backpackRow)).toHaveText('1');
    await expect(cartPage.description(backpackRow)).not.toBeEmpty();
    await expect(cartPage.price(backpackRow)).toHaveText(`$${products.backpack.price}`);
    await expect(cartPage.removeButtonInRow(backpackRow)).toBeVisible();

    const bikeLightRow = cartPage.itemRow(products.bikeLight.name);
    await expect(cartPage.quantity(bikeLightRow)).toHaveText('1');
    await expect(cartPage.description(bikeLightRow)).not.toBeEmpty();
    await expect(cartPage.price(bikeLightRow)).toHaveText(`$${products.bikeLight.price}`);
    await expect(cartPage.removeButtonInRow(bikeLightRow)).toBeVisible();

    // Item order matches the order the products were added in.
    await expect(cartPage.cartItems.nth(0)).toContainText(products.backpack.name);
    await expect(cartPage.cartItems.nth(1)).toContainText(products.bikeLight.name);
  });

  test('TC-CART-003 Continue Shopping returns to Products page and preserves cart', async ({
    loginPage,
    inventoryPage,
    cartPage,
  }) => {
    // 1. Preconditions: log in, add one item, navigate to /cart.html.
    await loginAsStandardUser(loginPage);
    await inventoryPage.addProductToCart(products.backpack.slug);
    await inventoryPage.goToCart();
    await expect(cartPage.cartItems).toHaveCount(1);

    // 2. Click the 'Continue Shopping' button.
    await cartPage.continueShopping();
    await expect(inventoryPage.page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });

  test('TC-CART-004 Checkout button navigates to Checkout Information with cart intact', async ({
    loginPage,
    inventoryPage,
    cartPage,
    checkoutInformationPage,
  }) => {
    // 1. Preconditions: log in, add at least one item, navigate to /cart.html.
    await loginAsStandardUser(loginPage);
    await inventoryPage.addProductToCart(products.backpack.slug);
    await inventoryPage.goToCart();
    await expect(cartPage.cartItems).toHaveCount(1);

    // 2. Click the 'Checkout' button.
    await cartPage.goToCheckout();
    await expect(checkoutInformationPage.page).toHaveURL(/checkout-step-one\.html/);
    await expect(checkoutInformationPage.title).toHaveText('Checkout: Your Information');
    await expect(checkoutInformationPage.cartBadge).toHaveText('1');
  });

  test('TC-CART-005 Removing an item updates the list and badge', async ({
    loginPage,
    inventoryPage,
    cartPage,
  }) => {
    // 1. Preconditions: log in, add 'Sauce Labs Backpack' and 'Sauce Labs Bike Light', navigate to /cart.html.
    await loginAsStandardUser(loginPage);
    await inventoryPage.addProductsToCart([products.backpack.slug, products.bikeLight.slug]);
    await inventoryPage.goToCart();
    await expect(cartPage.cartItems).toHaveCount(2);
    await expect(cartPage.cartBadge).toHaveText('2');

    // 2. Click 'Remove' on the Sauce Labs Backpack row.
    await cartPage.removeProductBySlug(products.backpack.slug);
    await expect(cartPage.itemRow(products.backpack.name)).toHaveCount(0);
    const bikeLightRow = cartPage.itemRow(products.bikeLight.name);
    await expect(cartPage.quantity(bikeLightRow)).toHaveText('1');
    await expect(cartPage.price(bikeLightRow)).toHaveText(`$${products.bikeLight.price}`);
    await expect(cartPage.cartBadge).toHaveText('1');
  });

  test('TC-CART-006-EmptyCart Cart page with zero items retains action buttons', async ({
    loginPage,
    inventoryPage,
    cartPage,
  }) => {
    // 1. Preconditions: log in as standard_user with a cart that has never had items added.
    await loginAsStandardUser(loginPage);
    await expect(inventoryPage.cartBadge).toHaveCount(0);

    // 2. Navigate to /cart.html.
    await cartPage.open();
    await expect(cartPage.cartQuantityLabel).toBeVisible();
    await expect(cartPage.cartDescLabel).toBeVisible();
    await expect(cartPage.cartItems).toHaveCount(0);
    await expect(cartPage.continueShoppingButton).toBeEnabled();
    // Confirmed live: Checkout remains clickable even with zero items (business-rule gap, see TC-CHECKOUT-ERROR-004).
    await expect(cartPage.checkoutButton).toBeEnabled();
  });
});
