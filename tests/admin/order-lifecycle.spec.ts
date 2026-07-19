import { test, expect } from '../../src/fixtures/pages.fixture';
import { generateCustomer } from '../../src/utils/randomData';

test('TC-ADMIN-ORD-002/003 admin order status update is reflected in the customer order history', async ({
  registerPage,
  headerNav,
  searchResultsPage,
  cartPage,
  checkoutPage,
  orderHistoryPage,
  loginPage,
  accountPage,
  adminOrderListPage,
  adminOrderDetailPage,
  page,
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

  await accountPage.logout();

  await adminOrderListPage.open();
  await adminOrderListPage.filterByCustomer(customer.firstName);
  await adminOrderListPage.openOrderByCustomer(customer.firstName);
  await adminOrderDetailPage.addHistory('Processing', 'QA automation: moving order to Processing');
  await expect(adminOrderDetailPage.historyTable).toContainText('QA automation: moving order to Processing');

  await loginPage.open();
  await loginPage.login(customer.email, customer.password);
  await orderHistoryPage.open();
  await expect(orderHistoryPage.latestOrderRow).toContainText('Processing');
});
