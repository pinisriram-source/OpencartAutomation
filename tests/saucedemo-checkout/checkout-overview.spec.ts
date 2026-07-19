// spec: specs/saucedemo-checkout-test-plan.md (section 3. Order Overview)
// seed: tests/seed.spec.ts

import { test, expect } from './fixtures/saucedemo.fixture';
import products from './test-data/products.json';
import customer from './test-data/customer.json';
import messages from './test-data/messages.json';
import { calculateTax, calculateTotal, formatMoney } from './utils/pricing';

const allProducts = Object.values(products);

test.describe('Order Overview', () => {
  test('TC-CHECKOUT-OVERVIEW-001 - Overview page shows item summary matching cart contents', async ({ loggedInPage, cartPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
    // Preconditions: add Backpack and Bike Light to cart, proceed to Checkout, enter valid info, click Continue.
    await loggedInPage.addProductToCart(products.backpack.id);
    await loggedInPage.addProductToCart(products.bikeLight.id);
    await loggedInPage.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutStepOnePage.fillInfo(customer.valid.firstName, customer.valid.lastName, customer.valid.postalCode);
    await checkoutStepOnePage.continueToOverview();
    await expect(checkoutStepTwoPage.page).toHaveURL(/\/checkout-step-two\.html$/);

    // 1. Verify page heading and item rows.
    await expect(checkoutStepTwoPage.heading).toHaveText('Checkout: Overview');
    await expect(checkoutStepTwoPage.cartItems).toHaveCount(2);

    await expect(checkoutStepTwoPage.itemQty(products.backpack.name)).toHaveText('1');
    await expect(checkoutStepTwoPage.itemDescription(products.backpack.name)).toHaveText(products.backpack.description);
    await expect(checkoutStepTwoPage.itemPrice(products.backpack.name)).toHaveText(formatMoney(products.backpack.price));

    await expect(checkoutStepTwoPage.itemQty(products.bikeLight.name)).toHaveText('1');
    await expect(checkoutStepTwoPage.itemDescription(products.bikeLight.name)).toHaveText(products.bikeLight.description);
    await expect(checkoutStepTwoPage.itemPrice(products.bikeLight.name)).toHaveText(formatMoney(products.bikeLight.price));
  });

  test('TC-CHECKOUT-OVERVIEW-002 - Overview page shows Payment and Shipping Information sections', async ({ loggedInPage, cartPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
    // Preconditions: reach /checkout-step-two.html with at least one item in cart.
    await loggedInPage.addProductToCart(products.backpack.id);
    await loggedInPage.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutStepOnePage.fillInfo(customer.valid.firstName, customer.valid.lastName, customer.valid.postalCode);
    await checkoutStepOnePage.continueToOverview();

    // 1. Locate the Payment Information section.
    await expect(checkoutStepTwoPage.paymentInfoLabel).toHaveText('Payment Information:');
    await expect(checkoutStepTwoPage.paymentInfoValue).toHaveText(messages.paymentInfo);

    // 2. Locate the Shipping Information section.
    await expect(checkoutStepTwoPage.shippingInfoLabel).toHaveText('Shipping Information:');
    await expect(checkoutStepTwoPage.shippingInfoValue).toHaveText(messages.shippingInfo);
  });

  test('TC-CHECKOUT-OVERVIEW-003 - Price Total block computes Item total, Tax, and Total correctly for a single item', async ({ loggedInPage, cartPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
    // Preconditions: add only Sauce Labs Backpack, proceed through checkout info with valid data.
    await loggedInPage.addProductToCart(products.backpack.id);
    await loggedInPage.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutStepOnePage.fillInfo(customer.valid.firstName, customer.valid.lastName, customer.valid.postalCode);
    await checkoutStepOnePage.continueToOverview();
    await expect(checkoutStepTwoPage.cartItems).toHaveCount(1);

    const itemTotal = products.backpack.price;
    const tax = calculateTax(itemTotal);
    const total = calculateTotal(itemTotal);

    // 1. Read the 'Item total' value.
    await expect(checkoutStepTwoPage.subtotalLabel).toHaveText(`Item total: ${formatMoney(itemTotal)}`);
    // 2. Read the 'Tax' value.
    await expect(checkoutStepTwoPage.taxLabel).toHaveText(`Tax: ${formatMoney(tax)}`);
    // 3. Read the 'Total' value.
    await expect(checkoutStepTwoPage.totalLabel).toHaveText(`Total: ${formatMoney(total)}`);
    expect(formatMoney(itemTotal)).toBe('$29.99');
    expect(formatMoney(tax)).toBe('$2.40');
    expect(formatMoney(total)).toBe('$32.39');
  });

  test('TC-CHECKOUT-OVERVIEW-004 - Price Total block computes correctly for multiple items', async ({ loggedInPage, cartPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
    // Preconditions: add Backpack and Bike Light, proceed through checkout info with valid data.
    await loggedInPage.addProductToCart(products.backpack.id);
    await loggedInPage.addProductToCart(products.bikeLight.id);
    await loggedInPage.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutStepOnePage.fillInfo(customer.valid.firstName, customer.valid.lastName, customer.valid.postalCode);
    await checkoutStepOnePage.continueToOverview();
    await expect(checkoutStepTwoPage.cartItems).toHaveCount(2);

    const itemTotal = products.backpack.price + products.bikeLight.price;
    const tax = calculateTax(itemTotal);
    const total = calculateTotal(itemTotal);

    // 1. Read the 'Item total' value.
    await expect(checkoutStepTwoPage.subtotalLabel).toHaveText(`Item total: ${formatMoney(itemTotal)}`);
    // 2. Read the 'Tax' value.
    await expect(checkoutStepTwoPage.taxLabel).toHaveText(`Tax: ${formatMoney(tax)}`);
    // 3. Read the 'Total' value.
    await expect(checkoutStepTwoPage.totalLabel).toHaveText(`Total: ${formatMoney(total)}`);
    expect(formatMoney(itemTotal)).toBe('$39.98');
    expect(formatMoney(tax)).toBe('$3.20');
    expect(formatMoney(total)).toBe('$43.18');
  });

  test('TC-CHECKOUT-OVERVIEW-005 - Overview page presents Cancel and Finish options', async ({ loggedInPage, cartPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
    // Preconditions: reach /checkout-step-two.html with at least one item in cart.
    await loggedInPage.addProductToCart(products.backpack.id);
    await loggedInPage.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutStepOnePage.fillInfo(customer.valid.firstName, customer.valid.lastName, customer.valid.postalCode);
    await checkoutStepOnePage.continueToOverview();

    // 1. Verify action buttons.
    await expect(checkoutStepTwoPage.cancelButton).toBeVisible();
    await expect(checkoutStepTwoPage.cancelButton).toBeEnabled();
    await expect(checkoutStepTwoPage.finishButton).toBeVisible();
    await expect(checkoutStepTwoPage.finishButton).toBeEnabled();
  });

  test('TC-CHECKOUT-OVERVIEW-006-AllProducts - Overview correctly totals the maximum available product set (6 items)', async ({ loggedInPage, cartPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
    // Preconditions: standard_user with an empty cart.
    await expect(loggedInPage.cartBadge).toBeHidden();

    // 1. Add all 6 available products to the cart.
    for (const product of allProducts) {
      await loggedInPage.addProductToCart(product.id);
    }
    await expect(loggedInPage.cartBadge).toHaveText('6');

    // 2. Proceed to Checkout, enter valid info, click Continue to reach the Overview page.
    await loggedInPage.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutStepOnePage.fillInfo(customer.valid.firstName, customer.valid.lastName, customer.valid.postalCode);
    await checkoutStepOnePage.continueToOverview();
    await expect(checkoutStepTwoPage.cartItems).toHaveCount(6);
    for (const product of allProducts) {
      await expect(checkoutStepTwoPage.itemQty(product.name)).toHaveText('1');
      await expect(checkoutStepTwoPage.itemPrice(product.name)).toHaveText(formatMoney(product.price));
    }

    // 3. Verify totals.
    const itemTotal = allProducts.reduce((sum, p) => sum + p.price, 0);
    const tax = calculateTax(itemTotal);
    const total = calculateTotal(itemTotal);
    expect(formatMoney(itemTotal)).toBe('$129.94');

    await expect(checkoutStepTwoPage.subtotalLabel).toHaveText(`Item total: ${formatMoney(itemTotal)}`);
    await expect(checkoutStepTwoPage.taxLabel).toHaveText(`Tax: ${formatMoney(tax)}`);
    await expect(checkoutStepTwoPage.totalLabel).toHaveText(`Total: ${formatMoney(total)}`);
  });
});
