import { test, expect } from '../../src/fixtures/pages.fixture';
import { generateCustomer } from '../../src/utils/randomData';

test('TC-CHECKOUT-001 guest can search, add MacBook to cart, and complete checkout', async ({
  homePage,
  headerNav,
  searchResultsPage,
  cartPage,
  checkoutPage,
  orderConfirmationPage,
}) => {
  const customer = generateCustomer();

  await homePage.open();
  await headerNav.search('MacBook');
  await searchResultsPage.page.waitForLoadState('networkidle');

  await searchResultsPage.addToCart('MacBook');
  await expect(searchResultsPage.successAlert).toBeVisible();

  await cartPage.open();
  await expect(cartPage.page.getByRole('link', { name: 'MacBook', exact: true }).first()).toBeVisible();

  await cartPage.proceedToCheckout();
  await checkoutPage.chooseGuestCheckout();
  await checkoutPage.fillGuestBillingDetails(customer);
  await checkoutPage.submitGuestBillingDetails();

  await checkoutPage.continueShippingMethodIfPresent();
  await checkoutPage.selectPaymentMethodIfPresent();
  await checkoutPage.agreeToTerms();
  await checkoutPage.placeOrder();

  await expect(orderConfirmationPage.page).toHaveURL(/route=checkout\/success/);
});
