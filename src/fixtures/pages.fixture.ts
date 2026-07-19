import { test as base } from '@playwright/test';
import { HomePage } from '../pages/storefront/HomePage';
import { HeaderNav } from '../pages/storefront/HeaderNav';
import { CategoryPage } from '../pages/storefront/CategoryPage';
import { SearchResultsPage } from '../pages/storefront/SearchResultsPage';
import { ProductPage } from '../pages/storefront/ProductPage';
import { CartPage } from '../pages/storefront/CartPage';
import { CheckoutPage } from '../pages/storefront/CheckoutPage';
import { OrderConfirmationPage } from '../pages/storefront/OrderConfirmationPage';
import { RegisterPage } from '../pages/storefront/RegisterPage';
import { LoginPage } from '../pages/storefront/LoginPage';
import { ForgottenPasswordPage } from '../pages/storefront/ForgottenPasswordPage';
import { AccountPage } from '../pages/storefront/AccountPage';
import { OrderHistoryPage } from '../pages/storefront/OrderHistoryPage';
import { AddressBookPage } from '../pages/storefront/AddressBookPage';
import { WishlistPage } from '../pages/storefront/WishlistPage';
import { ComparePage } from '../pages/storefront/ComparePage';
import { SpecialsPage } from '../pages/storefront/SpecialsPage';
import { ManufacturerPage } from '../pages/storefront/ManufacturerPage';
import { VoucherPage } from '../pages/storefront/VoucherPage';
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { ProductListPage } from '../pages/admin/ProductListPage';
import { ProductFormPage } from '../pages/admin/ProductFormPage';
import { OrderListPage } from '../pages/admin/OrderListPage';
import { OrderDetailPage } from '../pages/admin/OrderDetailPage';
import { CouponListPage } from '../pages/admin/CouponListPage';
import { CouponFormPage } from '../pages/admin/CouponFormPage';
import { ReturnListPage } from '../pages/admin/ReturnListPage';
import { ReturnDetailPage } from '../pages/admin/ReturnDetailPage';
import { CustomerListPage } from '../pages/admin/CustomerListPage';
import { UserGroupListPage } from '../pages/admin/UserGroupListPage';

type Pages = {
  homePage: HomePage;
  headerNav: HeaderNav;
  categoryPage: CategoryPage;
  searchResultsPage: SearchResultsPage;
  productPage: ProductPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  orderConfirmationPage: OrderConfirmationPage;
  registerPage: RegisterPage;
  loginPage: LoginPage;
  forgottenPasswordPage: ForgottenPasswordPage;
  accountPage: AccountPage;
  orderHistoryPage: OrderHistoryPage;
  addressBookPage: AddressBookPage;
  wishlistPage: WishlistPage;
  comparePage: ComparePage;
  specialsPage: SpecialsPage;
  manufacturerPage: ManufacturerPage;
  voucherPage: VoucherPage;
  adminLoginPage: AdminLoginPage;
  /** Logs into admin and returns the user_token, for admin POMs that need it. */
  adminToken: string;
  adminProductListPage: ProductListPage;
  adminProductFormPage: ProductFormPage;
  adminOrderListPage: OrderListPage;
  adminOrderDetailPage: OrderDetailPage;
  adminCouponListPage: CouponListPage;
  adminCouponFormPage: CouponFormPage;
  adminReturnListPage: ReturnListPage;
  adminReturnDetailPage: ReturnDetailPage;
  adminCustomerListPage: CustomerListPage;
  adminUserGroupListPage: UserGroupListPage;
};

export const test = base.extend<Pages>({
  homePage: async ({ page }, use) => use(new HomePage(page)),
  headerNav: async ({ page }, use) => use(new HeaderNav(page)),
  categoryPage: async ({ page }, use) => use(new CategoryPage(page)),
  searchResultsPage: async ({ page }, use) => use(new SearchResultsPage(page)),
  productPage: async ({ page }, use) => use(new ProductPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  orderConfirmationPage: async ({ page }, use) => use(new OrderConfirmationPage(page)),
  registerPage: async ({ page }, use) => use(new RegisterPage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  forgottenPasswordPage: async ({ page }, use) => use(new ForgottenPasswordPage(page)),
  accountPage: async ({ page }, use) => use(new AccountPage(page)),
  orderHistoryPage: async ({ page }, use) => use(new OrderHistoryPage(page)),
  addressBookPage: async ({ page }, use) => use(new AddressBookPage(page)),
  wishlistPage: async ({ page }, use) => use(new WishlistPage(page)),
  comparePage: async ({ page }, use) => use(new ComparePage(page)),
  specialsPage: async ({ page }, use) => use(new SpecialsPage(page)),
  manufacturerPage: async ({ page }, use) => use(new ManufacturerPage(page)),
  voucherPage: async ({ page }, use) => use(new VoucherPage(page)),
  adminLoginPage: async ({ page }, use) => use(new AdminLoginPage(page)),

  adminToken: async ({ page }, use) => {
    const adminLoginPage = new AdminLoginPage(page);
    await adminLoginPage.open();
    const token = await adminLoginPage.login();
    await use(token);
  },

  adminProductListPage: async ({ page, adminToken }, use) => use(new ProductListPage(page, adminToken)),
  adminProductFormPage: async ({ page, adminToken }, use) => use(new ProductFormPage(page, adminToken)),
  adminOrderListPage: async ({ page, adminToken }, use) => use(new OrderListPage(page, adminToken)),
  adminOrderDetailPage: async ({ page, adminToken }, use) => use(new OrderDetailPage(page, adminToken)),
  adminCouponListPage: async ({ page, adminToken }, use) => use(new CouponListPage(page, adminToken)),
  adminCouponFormPage: async ({ page, adminToken }, use) => use(new CouponFormPage(page, adminToken)),
  adminReturnListPage: async ({ page, adminToken }, use) => use(new ReturnListPage(page, adminToken)),
  adminReturnDetailPage: async ({ page, adminToken }, use) => use(new ReturnDetailPage(page, adminToken)),
  adminCustomerListPage: async ({ page, adminToken }, use) => use(new CustomerListPage(page, adminToken)),
  adminUserGroupListPage: async ({ page, adminToken }, use) => use(new UserGroupListPage(page, adminToken)),
});

export { expect } from '@playwright/test';
