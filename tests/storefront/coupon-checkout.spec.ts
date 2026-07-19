import { test, expect } from '../../src/fixtures/pages.fixture';
import { generateCustomer, uniqueCode } from '../../src/utils/randomData';

test('TC-CART-004 / TC-ADMIN-MKT-001 admin-created coupon discounts the storefront cart and shows on the admin order', async ({
  adminCouponFormPage,
  headerNav,
  searchResultsPage,
  cartPage,
  checkoutPage,
  adminOrderListPage,
  adminOrderDetailPage,
}) => {
  const couponCode = uniqueCode('QA10');
  const customer = generateCustomer();

  await adminCouponFormPage.openForAdd();
  await adminCouponFormPage.fill({
    name: `QA Automation ${couponCode}`,
    code: couponCode,
    type: 'Percentage',
    discount: '10',
    usesTotal: '',
    usesCustomer: '',
  });
  await adminCouponFormPage.save();

  await searchResultsPage.gotoHome();
  await headerNav.search('MacBook');
  await searchResultsPage.page.waitForLoadState('networkidle');
  await searchResultsPage.addToCart('MacBook');
  await expect(searchResultsPage.successAlert).toBeVisible();

  await cartPage.open();
  await cartPage.applyCoupon(couponCode);
  await expect(cartPage.orderTotalTable).toContainText('Coupon');
  await expect(cartPage.orderTotalTable).toContainText('$-50.00');

  await cartPage.proceedToCheckout();
  await checkoutPage.chooseGuestCheckout();
  await checkoutPage.fillGuestBillingDetails(customer);
  await checkoutPage.submitGuestBillingDetails();
  await checkoutPage.continueShippingMethodIfPresent();
  await checkoutPage.selectPaymentMethodIfPresent();
  await checkoutPage.agreeToTerms();
  await checkoutPage.placeOrder();

  await adminOrderListPage.open();
  await adminOrderListPage.filterByCustomer(customer.firstName);
  await adminOrderListPage.openOrderByCustomer(customer.firstName);
  const orderContent = adminOrderDetailPage.page.locator('#content');
  await expect(orderContent).toContainText('Coupon');
});
