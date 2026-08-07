import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/login.page';

test.describe('Login Page - Initial Load', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('TC-LOGIN-001: Verify initial page load and form elements visible', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
    // Verify page loads correctly
    await expect(page).toHaveURL('https://practicetestautomation.com/practice-test-login/');
    await expect(page).toHaveTitle('Test Login | Practice Test Automation');

    // Verify page heading is visible
    await expect(loginPage.pageHeading).toBeVisible();

    // Verify username field is visible
    await expect(loginPage.usernameField).toBeVisible();

    // Verify password field is visible
    await expect(loginPage.passwordField).toBeVisible();

    // Verify submit button is visible
    await expect(loginPage.submitButton).toBeVisible();
  });
});
