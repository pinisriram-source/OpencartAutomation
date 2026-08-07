import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/login.page';

test.describe('Login Page - Empty Username', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('TC-LOGIN-006: Empty username, valid password shows "Your username is invalid!"', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // Perform login with empty username and valid password
    await loginPage.login('', 'Password123');

    // Verify error message is displayed
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText('Your username is invalid!');

    // Verify still on login page
    await expect(page).toHaveURL('https://practicetestautomation.com/practice-test-login/');
  });
});
