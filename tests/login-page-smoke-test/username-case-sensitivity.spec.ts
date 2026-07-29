import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/login.page';

test.describe('Login Page - Username Case Sensitivity', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('TC-LOGIN-009: Username case-sensitive ("Student" fails)', { tag: '@functional' }, async ({ page }) => {
    // Perform login with incorrect case username
    await loginPage.login('Student', 'Password123');

    // Verify error message is displayed
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText('Your username is invalid!');

    // Verify still on login page
    await expect(page).toHaveURL('https://practicetestautomation.com/practice-test-login/');
  });
});
