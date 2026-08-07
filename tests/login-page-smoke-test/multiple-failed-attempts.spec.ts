import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/login.page';
import { SuccessPage } from './page-objects/success.page';

test.describe('Login Page - Multiple Failed Attempts', () => {
  let loginPage: LoginPage;
  let successPage: SuccessPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    successPage = new SuccessPage(page);
    await loginPage.navigate();
  });

  test('TC-LOGIN-013: Multiple failed logins, then success works', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // First failed attempt - invalid username
    await loginPage.login('wrongUser', 'Password123');
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText('Your username is invalid!');

    // Second failed attempt - invalid password
    await loginPage.login('student', 'wrongPassword');
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText('Your password is invalid!');

    // Third attempt - successful login
    await loginPage.login('student', 'Password123');
    await expect(page).toHaveURL(/.*logged-in-successfully.*/);
    await expect(successPage.pageHeading).toBeVisible();
    await expect(successPage.successMessage).toContainText('successfully logged in');
  });
});
