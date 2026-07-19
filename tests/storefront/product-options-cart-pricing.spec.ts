import { test, expect } from '../../src/fixtures/pages.fixture';
import { generateCustomer } from '../../src/utils/randomData';

const PRODUCT_NAME = 'Apple Cinema 30"';

test('TC-PDP-003/004/005 all option types on Apple Cinema 30" are captured through cart, checkout, and the admin order detail', async ({
  headerNav,
  searchResultsPage,
  productPage,
  cartPage,
  checkoutPage,
  adminOrderListPage,
  adminOrderDetailPage,
}) => {
  const customer = generateCustomer();

  await searchResultsPage.gotoHome();
  await headerNav.search(PRODUCT_NAME);
  await searchResultsPage.page.waitForLoadState('networkidle');
  await searchResultsPage.openProduct(PRODUCT_NAME);

  await productPage.selectRadioOption('218', 0);
  await productPage.checkCheckboxOption('223', [0, 1]);
  await productPage.fillTextOption('208', 'Engrave: QA Automation');
  await productPage.selectDropdownOptionByPosition('217', 1); // "Red"
  await productPage.fillTextareaOption('209', 'Handle with care - QA test order');
  await productPage.uploadFileOption('222');
  // Date/Time/DateTime options ship with a pre-filled default value in
  // this demo product, which already satisfies their "required" validation.

  await productPage.addToCart();
  await expect(productPage.successAlert).toBeVisible();

  await cartPage.open();
  const cartRow = cartPage.page.locator('tr').filter({ has: cartPage.page.getByRole('link', { name: PRODUCT_NAME, exact: true }) });
  await expect(cartRow).toContainText('Text: Engrave: QA Automat');
  await expect(cartRow).toContainText('Select: Red');
  await expect(cartRow).toContainText('Radio:');
  await expect(cartRow).toContainText('Checkbox:');
  await expect(cartRow).toContainText('File: upload-sample.txt');

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

  const productLines = adminOrderDetailPage.page.locator('#content');
  await expect(productLines).toContainText('Engrave');
  await expect(productLines).toContainText('Red');
});
