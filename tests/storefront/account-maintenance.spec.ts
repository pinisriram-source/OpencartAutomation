import { test, expect } from '../../src/fixtures/pages.fixture';
import { generateCustomer } from '../../src/utils/randomData';

test('TC-ACCOUNT-007/008/009/011 account edits, password change, address book, and newsletter preference all persist', async ({
  registerPage,
  accountPage,
  addressBookPage,
  loginPage,
  page,
}) => {
  const customer = generateCustomer();
  const newPassword = 'NewPassw0rd!45';

  await registerPage.open();
  await registerPage.register(customer);
  await expect(registerPage.successHeading).toBeVisible();

  // Edit profile
  await accountPage.goToEditAccount();
  await accountPage.editLastName('UpdatedLastName');
  await expect(accountPage.successAlert).toBeVisible();
  await accountPage.goToEditAccount();
  await expect(page.locator('#input-lastname')).toHaveValue('UpdatedLastName');

  // Address book
  await addressBookPage.open();
  await addressBookPage.addNewAddress(customer, true);
  await expect(addressBookPage.successAlert).toBeVisible();

  // Newsletter
  await accountPage.goToNewsletter();
  await accountPage.setNewsletterSubscription(true);
  await expect(accountPage.successAlert).toBeVisible();

  // Password change
  await accountPage.goToPasswordPage();
  await accountPage.changePassword(newPassword);
  await expect(accountPage.successAlert).toBeVisible();

  // Log out and back in with the new password to confirm it took effect
  await accountPage.logout();
  await loginPage.open();
  await loginPage.login(customer.email, newPassword);
  await expect(page).toHaveURL(/route=account\/account/);

  // Newsletter preference persisted across the session
  await accountPage.goToNewsletter();
  await expect(page.locator('input[name="newsletter"][value="1"]')).toBeChecked();
});
