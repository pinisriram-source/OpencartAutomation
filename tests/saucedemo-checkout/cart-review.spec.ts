// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/checkout/seed.spec.ts

import { test, expect, loginAsStandardUser } from './fixtures/saucedemo.fixture';
import products from './test-data/products.json';

test.describe('Cart Review (AC1)', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginAsStandardUser(loginPage);
  });

  test('TC-CHECKOUT-001 cart displays a single item with correct name, description, price and quantity', async ({
    inventoryPage,
    cartPage,
  }) => {
    // 3. Click the 'Add to cart' button on the Sauce Labs Backpack tile
    await inventoryPage.addToCart(products.sauceLabsBackpack.slug);
    await expect(inventoryPage.removeButton(products.sauceLabsBackpack.slug)).toBeVisible();
    await expect(inventoryPage.header.cartBadge).toHaveText('1');

    // 4. Click the cart icon in the header
    await inventoryPage.header.goToCart();
    await expect(cartPage.page).toHaveURL(/cart\.html/);
    await expect(cartPage.pageTitle).toHaveText('Your Cart');

    // 5. Inspect the single cart line item
    const row = cartPage.itemByName(products.sauceLabsBackpack.name);
    await expect(row.locator('[data-test="item-quantity"]')).toHaveText('1');
    await expect(row.locator('[data-test="inventory-item-name"]')).toHaveText(products.sauceLabsBackpack.name);
    await expect(row.locator('[data-test="inventory-item-desc"]')).not.toBeEmpty();
    await expect(row.locator('[data-test="inventory-item-price"]')).toHaveText(`$${products.sauceLabsBackpack.price}`);
    await expect(cartPage.continueShoppingButton).toBeVisible();
    await expect(cartPage.checkoutButton).toBeVisible();
  });

  test('TC-CHECKOUT-002 cart displays multiple items with correct details and an accurate badge count', async ({
    inventoryPage,
    cartPage,
  }) => {
    // 1. Log in as standard_user and land on /inventory.html
    await expect(inventoryPage.header.cartBadge).toHaveCount(0);

    // 2. Click 'Add to cart' for Sauce Labs Backpack
    await inventoryPage.addToCart(products.sauceLabsBackpack.slug);
    await expect(inventoryPage.header.cartBadge).toHaveText('1');

    // 3. Click 'Add to cart' for Sauce Labs Bike Light
    await inventoryPage.addToCart(products.sauceLabsBikeLight.slug);
    await expect(inventoryPage.header.cartBadge).toHaveText('2');

    // 4. Open the cart page (/cart.html)
    await inventoryPage.header.goToCart();
    await expect(cartPage.cartItems).toHaveCount(2);

    const backpackRow = cartPage.itemByName(products.sauceLabsBackpack.name);
    await expect(backpackRow.locator('[data-test="item-quantity"]')).toHaveText('1');
    await expect(backpackRow.locator('[data-test="inventory-item-price"]')).toHaveText(
      `$${products.sauceLabsBackpack.price}`,
    );

    const bikeLightRow = cartPage.itemByName(products.sauceLabsBikeLight.name);
    await expect(bikeLightRow.locator('[data-test="item-quantity"]')).toHaveText('1');
    await expect(bikeLightRow.locator('[data-test="inventory-item-price"]')).toHaveText(
      `$${products.sauceLabsBikeLight.price}`,
    );
  });

  test("TC-CHECKOUT-003 'Continue Shopping' button returns the user to the Products page and preserves cart contents", async ({
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.addToCart(products.sauceLabsBackpack.slug);
    await inventoryPage.header.goToCart();

    // 1. From /cart.html, click 'Continue Shopping'
    await cartPage.continueShoppingButton.click();
    await expect(inventoryPage.page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.pageTitle).toHaveText('Products');

    // 2. Observe the previously added product's button and the cart badge
    await expect(inventoryPage.removeButton(products.sauceLabsBackpack.slug)).toBeVisible();
    await expect(inventoryPage.header.cartBadge).toHaveText('1');
  });

  test("TC-CHECKOUT-004 'Remove' button removes an item from the cart and decrements the badge", async ({
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.addToCart(products.sauceLabsBackpack.slug);
    await inventoryPage.addToCart(products.sauceLabsBikeLight.slug);
    await inventoryPage.header.goToCart();

    // 1. On /cart.html, click 'Remove' under the Sauce Labs Bike Light row
    await cartPage.removeItem(products.sauceLabsBikeLight.slug);

    await expect(cartPage.itemByName(products.sauceLabsBikeLight.name)).toHaveCount(0);
    await expect(cartPage.header.cartBadge).toHaveText('1');
    await expect(cartPage.itemByName(products.sauceLabsBackpack.name)).toHaveCount(1);
  });

  test("TC-CHECKOUT-005 'Checkout' button navigates from Cart to the Checkout Information page", async ({
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
  }) => {
    await inventoryPage.addToCart(products.sauceLabsBackpack.slug);
    await inventoryPage.header.goToCart();

    // 1. On /cart.html, click 'Checkout'
    await cartPage.checkoutButton.click();

    await expect(checkoutStepOnePage.page).toHaveURL(/checkout-step-one\.html/);
    await expect(checkoutStepOnePage.pageTitle).toHaveText('Checkout: Your Information');
    await expect(checkoutStepOnePage.firstNameInput).toBeVisible();
    await expect(checkoutStepOnePage.lastNameInput).toBeVisible();
    await expect(checkoutStepOnePage.postalCodeInput).toBeVisible();
    await expect(checkoutStepOnePage.cancelButton).toBeVisible();
    await expect(checkoutStepOnePage.continueButton).toBeVisible();
  });

  test("TC-CHECKOUT-006-EmptyCart clicking 'Checkout' with an empty cart is not blocked (edge case / Business Rule 3 deviation)", async ({
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
  }) => {
    // 1. Navigate to /cart.html with 0 items in the cart
    await inventoryPage.header.goToCart();
    await expect(cartPage.cartItems).toHaveCount(0);
    await expect(cartPage.header.cartBadge).toHaveCount(0);

    // 2. Click 'Checkout'
    await cartPage.checkoutButton.click();

    // ACTUAL BEHAVIOR (documented deviation from Business Rule 3): the empty cart is allowed through
    // to checkout with no warning, rather than being blocked.
    await expect(checkoutStepOnePage.page).toHaveURL(/checkout-step-one\.html/);
  });
});
