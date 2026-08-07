import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/login.page';
import { SuccessPage } from './page-objects/success.page';

test.describe('Login Page - Submit with Enter Key', () => {
  let loginPage: LoginPage;
  let successPage: SuccessPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    successPage = new SuccessPage(page);
    await loginPage.navigate();
  });

  test('TC-LOGIN-012: Enter key submits the form', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // Perform login using Enter key
    await loginPage.loginWithEnter('student', 'Password123');

    // Verify navigation to success page
    await expect(page).toHaveURL(/.*logged-in-successfully.*/);
    await expect(successPage.pageHeading).toBeVisible();
    await expect(successPage.successMessage).toContainText('successfully logged in');
  });
});
