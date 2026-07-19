import { test, expect } from '../../src/fixtures/pages.fixture';
import { generateCustomer, uniqueEmail } from '../../src/utils/randomData';

test.describe('Authentication', () => {
  test('TC-LOGIN-005 registered customer can log in with valid credentials', async ({
    registerPage,
    accountPage,
    loginPage,
    page,
  }) => {
    const customer = generateCustomer();

    await registerPage.open();
    await registerPage.register(customer);
    await expect(registerPage.successHeading).toBeVisible();
    await accountPage.logout();

    await loginPage.open();
    await loginPage.login(customer.email, customer.password);

    await expect(page).toHaveURL(/route=account\/account/);
    await expect(page.getByRole('heading', { name: 'My Account', level: 2 })).toBeVisible();
  });

  test('TC-LOGIN-006-InvalidCredentials login rejects an incorrect password', async ({
    registerPage,
    accountPage,
    loginPage,
    page,
  }) => {
    const customer = generateCustomer();

    await registerPage.open();
    await registerPage.register(customer);
    await expect(registerPage.successHeading).toBeVisible();
    await accountPage.logout();

    await loginPage.open();
    await loginPage.login(customer.email, `${customer.password}Wrong`);

    await expect(loginPage.errorAlert).toHaveText('Warning: No match for E-Mail Address and/or Password.');
    await expect(page).toHaveURL(/route=account\/login/);
  });

  test('TC-LOGIN-014-EmptyCredentials login submitted with both fields empty is rejected', async ({
    loginPage,
    page,
  }) => {
    await loginPage.open();
    await loginPage.login('', '');

    await expect(loginPage.errorAlert).toHaveText('Warning: No match for E-Mail Address and/or Password.');
    await expect(page).toHaveURL(/route=account\/login/);
  });

  test('TC-LOGIN-015-Logout logout ends the customer session', async ({ registerPage, accountPage, page }) => {
    const customer = generateCustomer();

    await registerPage.open();
    await registerPage.register(customer);
    await expect(registerPage.successHeading).toBeVisible();

    await accountPage.logout();
    await expect(page.getByRole('heading', { name: 'Account Logout' })).toBeVisible();

    await accountPage.open();
    await expect(page).toHaveURL(/route=account\/login/);
  });

  test('TC-FORGOT-016 forgotten password accepts a registered email', async ({
    registerPage,
    accountPage,
    forgottenPasswordPage,
    page,
  }) => {
    const customer = generateCustomer();

    await registerPage.open();
    await registerPage.register(customer);
    await expect(registerPage.successHeading).toBeVisible();
    await accountPage.logout();

    await forgottenPasswordPage.open();
    await forgottenPasswordPage.requestReset(customer.email);

    await expect(page).toHaveURL(/route=account\/login/);
    await expect(forgottenPasswordPage.successAlert).toHaveText(
      'An email with a confirmation link has been sent your email address.'
    );
  });

  test('TC-FORGOT-017-UnregisteredEmail forgotten password rejects an email with no matching account', async ({
    forgottenPasswordPage,
    page,
  }) => {
    await forgottenPasswordPage.open();
    await forgottenPasswordPage.requestReset(uniqueEmail('unregistered'));

    await expect(forgottenPasswordPage.dangerAlert).toHaveText(
      'Warning: The E-Mail Address was not found in our records, please try again!'
    );
    await expect(page).toHaveURL(/route=account\/forgotten/);
  });

  test('TC-FORGOT-018-RedirectsWhenAuthenticated forgotten password page is inaccessible while logged in', async ({
    registerPage,
    forgottenPasswordPage,
    page,
  }) => {
    const customer = generateCustomer();

    await registerPage.open();
    await registerPage.register(customer);
    await expect(registerPage.successHeading).toBeVisible();

    await forgottenPasswordPage.open();

    await expect(page).toHaveURL(/route=account\/account/);
  });
});
