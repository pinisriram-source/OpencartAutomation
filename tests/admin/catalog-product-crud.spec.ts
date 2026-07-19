import { test, expect } from '../../src/fixtures/pages.fixture';

const ORIGINAL_PRICE = '500.0000';
const TEST_PRICE = '550.0000';

test('TC-ADMIN-CAT-003 admin updates a product price and the storefront reflects it', async ({
  adminProductListPage,
  adminProductFormPage,
  productPage,
}) => {
  await adminProductListPage.open();
  await adminProductListPage.filterByName('MacBook');
  await adminProductListPage.editByName('MacBook');

  await adminProductFormPage.setPrice(TEST_PRICE);
  await adminProductFormPage.save();

  await productPage.openById('43');
  await expect(productPage.price).toContainText('$662.00');

  // Restore the original price so other specs relying on MacBook's $602.00
  // total (subtotal $500 + tax) keep passing.
  await adminProductListPage.open();
  await adminProductListPage.filterByName('MacBook');
  await adminProductListPage.editByName('MacBook');
  await adminProductFormPage.setPrice(ORIGINAL_PRICE);
  await adminProductFormPage.save();

  await productPage.openById('43');
  await expect(productPage.price).toContainText('$602.00');
});
