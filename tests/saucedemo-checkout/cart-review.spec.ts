// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from './fixtures/saucedemo.fixture';
import testData from './test-data/checkout-data.json';

const { credentials, products } = testData;
const backpack = products.backpack;
const bikeLight = products.bikeLight;
const boltTShirt = products.boltTShirt;
const fleeceJacket = products.fleeceJacket;
const onesie = products.onesie;
const redShirt = products.redShirt;
const allProducts = [backpack, bikeLight, boltTShirt, fleeceJacket, onesie, redShirt];

test.describe('1. Cart Review', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login(credentials.standardUser.username, credentials.standardUser.password);
  });

  test('TC-CART-001: Cart displays all added items with name, description, and price', async ({ inventoryPage, cartPage }) => {
    // 1. Login as standard_user / secret_sauce
    await expect(inventoryPage.page).toHaveURL(/inventory\.html/);

    // 2. Add 'Sauce Labs Backpack' and 'Sauce Labs Bike Light' to cart from the Products page
    const backpackDesc = await inventoryPage.description(backpack.name).textContent();
    const bikeLightDesc = await inventoryPage.description(bikeLight.name).textContent();
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.addToCart(bikeLight.name);
    await expect(inventoryPage.cartBadge).toHaveText('2');
    await expect(inventoryPage.removeButton(backpack.name)).toBeVisible();
    await expect(inventoryPage.removeButton(bikeLight.name)).toBeVisible();

    // 3. Navigate to the Cart page (click cart icon)
    await inventoryPage.openCart();
    await expect(cartPage.page).toHaveURL(/cart\.html/);
    await expect(cartPage.title).toHaveText('Your Cart');
    await expect(cartPage.name(backpack.name)).toHaveText(backpack.name);
    await expect(cartPage.description(backpack.name)).toHaveText(backpackDesc ?? '');
    await expect(cartPage.price(backpack.name)).toHaveText(backpack.price);
    await expect(cartPage.name(bikeLight.name)).toHaveText(bikeLight.name);
    await expect(cartPage.description(bikeLight.name)).toHaveText(bikeLightDesc ?? '');
    await expect(cartPage.price(bikeLight.name)).toHaveText(bikeLight.price);
  });

  test('TC-CART-002: Cart shows correct quantity per line item', async ({ inventoryPage, cartPage }) => {
    // 1. Login and add one item to the cart, then open the Cart page
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.openCart();
    await expect(cartPage.quantity(backpack.name)).toHaveText('1');
  });

  test('TC-CART-003: \'Continue Shopping\' button returns to Products page', async ({ inventoryPage, cartPage }) => {
    // 1. Login, add an item to cart, open Cart page, click 'Continue Shopping'
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.openCart();
    await cartPage.continueShopping();
    await expect(inventoryPage.page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });

  test('TC-CART-004: \'Checkout\' button navigates to Checkout Information page', async ({ inventoryPage, cartPage, checkoutStepOnePage }) => {
    // 1. Login, add an item to cart, open Cart page, click 'Checkout'
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.openCart();
    await cartPage.checkout();
    await expect(checkoutStepOnePage.page).toHaveURL(/checkout-step-one\.html/);
    await expect(checkoutStepOnePage.title).toHaveText('Checkout: Your Information');
  });

  test('TC-CART-005: Removing an item from the cart updates the list and badge count', async ({ inventoryPage, cartPage }) => {
    // 1. Login and add two different items to cart, open Cart page
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.addToCart(bikeLight.name);
    await inventoryPage.openCart();
    await expect(cartPage.cartBadge).toHaveText('2');
    await expect(cartPage.lineItem(backpack.name)).toHaveCount(1);
    await expect(cartPage.lineItem(bikeLight.name)).toHaveCount(1);

    // 2. Click 'Remove' on one of the line items
    await cartPage.removeItem(bikeLight.name);
    await expect(cartPage.lineItem(bikeLight.name)).toHaveCount(0);
    await expect(cartPage.cartBadge).toHaveText('1');
  });

  test('TC-CART-006-EmptyCart: Cart page renders correctly with zero items', async ({ cartPage }) => {
    // 1. Login with a fresh session (no items ever added), navigate directly to /cart.html
    await cartPage.open();
    await expect(cartPage.title).toHaveText('Your Cart');
    await expect(cartPage.cartItems).toHaveCount(0);
    await expect(cartPage.cartBadge).toHaveCount(0);
    await expect(cartPage.continueShoppingButton).toBeVisible();
    await expect(cartPage.continueShoppingButton).toBeEnabled();
    await expect(cartPage.checkoutButton).toBeVisible();
    await expect(cartPage.checkoutButton).toBeEnabled();
  });

  test('TC-CART-007: Cart persists across navigation to a product detail page and back', async ({ page, inventoryPage, cartPage }) => {
    // 1. Login, add an item to cart, click into a product's detail page, then navigate back to the Cart page
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.openCart();
    await cartPage.openProductDetail(backpack.name);
    await expect(page).toHaveURL(/inventory-item\.html/);

    await page.goBack();
    await expect(cartPage.page).toHaveURL(/cart\.html/);
    await expect(cartPage.lineItem(backpack.name)).toHaveCount(1);
    await expect(cartPage.price(backpack.name)).toHaveText(backpack.price);
  });

  test('TC-CART-008: Cart contents persist after a full page refresh', async ({ page, inventoryPage, cartPage }) => {
    // 1. Login, add two items to cart, open Cart page, refresh the browser
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.addToCart(bikeLight.name);
    await inventoryPage.openCart();
    await expect(cartPage.cartBadge).toHaveText('2');

    await page.reload();
    await expect(cartPage.lineItem(backpack.name)).toHaveCount(1);
    await expect(cartPage.lineItem(bikeLight.name)).toHaveCount(1);
    await expect(cartPage.cartBadge).toHaveText('2');
  });

  test('TC-CART-009-AllProducts: Adding all six catalog products displays each correctly in cart', async ({ inventoryPage, cartPage }) => {
    // 1. Login and click 'Add to cart' for all six products on the Products page
    for (const product of allProducts) {
      await inventoryPage.addToCart(product.name);
    }
    await expect(inventoryPage.cartBadge).toHaveText('6');

    // 2. Open the Cart page
    await inventoryPage.openCart();
    await expect(cartPage.cartItems).toHaveCount(6);
    for (const product of allProducts) {
      await expect(cartPage.lineItem(product.name)).toHaveCount(1);
      await expect(cartPage.price(product.name)).toHaveText(product.price);
    }
  });

  test('TC-CART-010: Cart item name is a clickable link to its Product Detail page', async ({ inventoryPage, cartPage, productDetailPage }) => {
    // 1. Login, add an item to cart, open Cart page, click the item's name link
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.openCart();
    await cartPage.openProductDetail(backpack.name);
    await expect(productDetailPage.page).toHaveURL(/inventory-item\.html/);
    await expect(productDetailPage.name).toHaveText(backpack.name);
    await expect(productDetailPage.price).toHaveText(backpack.price);
  });

  test('TC-CART-011-NoTotalOnCartPage: Cart page does not display a subtotal/total price (AC1 discrepancy)', async ({ inventoryPage, cartPage }) => {
    // 1. Login, add two items with known prices to the cart, open the Cart page
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.addToCart(bikeLight.name);
    await inventoryPage.openCart();

    // Actual app behavior: no subtotal/tax/total element is rendered anywhere on the Cart page -
    // the total first appears later on the Order Overview page, contradicting AC1's stated
    // expectation that cart review includes 'the total price calculation'.
    await expect(cartPage.subtotalLabel).toHaveCount(0);
    await expect(cartPage.taxLabel).toHaveCount(0);
    await expect(cartPage.totalLabel).toHaveCount(0);
  });
});
