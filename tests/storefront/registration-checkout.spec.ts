import { test, expect } from '../../src/fixtures/pages.fixture';
import { generateCustomer } from '../../src/utils/randomData';

test('TC-REGISTER-001 / TC-CHECKOUT-008 register, checkout while logged in, and see the order in history', async ({
  registerPage,
  searchResultsPage,
  headerNav,
  cartPage,
  checkoutPage,
  orderHistoryPage,
}) => {
  const customer = generateCustomer();

  await registerPage.open();
  await registerPage.register(customer);
  await expect(registerPage.successHeading).toBeVisible();

  await headerNav.search('MacBook');
  await searchResultsPage.page.waitForLoadState('networkidle');
  await searchResultsPage.addToCart('MacBook');
  await expect(searchResultsPage.successAlert).toBeVisible();

  await cartPage.open();
  await cartPage.proceedToCheckout();

  await checkoutPage.fillLoggedInBillingDetails(customer);
  await checkoutPage.submitAddress();

  await checkoutPage.continueShippingMethodIfPresent();
  await checkoutPage.selectPaymentMethodIfPresent();
  await checkoutPage.agreeToTerms();
  await checkoutPage.placeOrder();

  await orderHistoryPage.open();
  await expect(orderHistoryPage.latestOrderRow).toContainText('$602.00');
});
