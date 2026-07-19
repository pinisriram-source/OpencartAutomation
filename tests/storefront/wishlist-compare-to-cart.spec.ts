import { test, expect } from '../../src/fixtures/pages.fixture';
import { generateCustomer } from '../../src/utils/randomData';

test('TC-WISH-001/003 logged-in customer can wishlist a product and move it to cart', async ({
  registerPage,
  headerNav,
  searchResultsPage,
  productPage,
  wishlistPage,
  cartPage,
}) => {
  const customer = generateCustomer();
  await registerPage.open();
  await registerPage.register(customer);
  await expect(registerPage.successHeading).toBeVisible();

  await headerNav.search('MacBook');
  await searchResultsPage.page.waitForLoadState('networkidle');
  await searchResultsPage.openProduct('MacBook');
  await productPage.addToWishlist();
  await expect(productPage.successAlert).toBeVisible();

  await wishlistPage.open();
  await expect(wishlistPage.hasProduct('MacBook')).toBeVisible();

  await wishlistPage.addToCart('MacBook');
  await cartPage.open();
  await expect(cartPage.page.getByRole('link', { name: 'MacBook', exact: true }).first()).toBeVisible();
});

test('TC-COMPARE-004/005 products can be added to and removed from the comparison list', async ({
  headerNav,
  searchResultsPage,
  productPage,
  comparePage,
}) => {
  await searchResultsPage.gotoHome();
  await headerNav.search('MacBook');
  await searchResultsPage.page.waitForLoadState('networkidle');
  await searchResultsPage.openProduct('MacBook');
  await productPage.addToCompare();
  await expect(productPage.successAlert).toBeVisible();

  await comparePage.open();
  await expect(comparePage.columnFor('MacBook')).toBeVisible();

  await comparePage.removeProduct('MacBook');
  await expect(comparePage.emptyMessage).toBeVisible();
});
