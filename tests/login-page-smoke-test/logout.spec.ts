import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/login.page';
import { SuccessPage } from './page-objects/success.page';

test.describe('Login Page - Logout', () => {
  let loginPage: LoginPage;
  let successPage: SuccessPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    successPage = new SuccessPage(page);
    await loginPage.navigate();
  });

  test('TC-LOGIN-008: Log out link navigates back to login page', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
    // Perform login with valid credentials
    await loginPage.login('student', 'Password123');

    // Verify navigation to success page
    await expect(page).toHaveURL(/.*logged-in-successfully.*/);

    // Click logout link
    await successPage.logout();

    // Verify navigation back to login page
    await expect(page).toHaveURL('https://practicetestautomation.com/practice-test-login/');
    await expect(loginPage.pageHeading).toBeVisible();
  });
});
