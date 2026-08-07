import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/login.page';
import { SuccessPage } from './page-objects/success.page';

test.describe('Login Page - Valid Login', () => {
  let loginPage: LoginPage;
  let successPage: SuccessPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    successPage = new SuccessPage(page);
    await loginPage.navigate();
  });

  test('TC-LOGIN-002: Successful login with valid credentials', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
    // Perform login with valid credentials
    await loginPage.login('student', 'Password123');

    // Verify navigation to success page
    await expect(page).toHaveURL(/.*logged-in-successfully.*/);
    await expect(page).toHaveTitle('Logged In Successfully | Practice Test Automation');

    // Verify success page heading is visible
    await expect(successPage.pageHeading).toBeVisible();

    // Verify success message is visible
    await expect(successPage.successMessage).toBeVisible();
    await expect(successPage.successMessage).toContainText('Congratulations');
    await expect(successPage.successMessage).toContainText('successfully logged in');

    // Verify logout link is visible
    await expect(successPage.logoutLink).toBeVisible();
  });
});
