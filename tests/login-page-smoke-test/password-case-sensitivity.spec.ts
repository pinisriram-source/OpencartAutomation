import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/login.page';

test.describe('Login Page - Password Case Sensitivity', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('TC-LOGIN-010: Password case-sensitive ("password123" fails)', { tag: '@functional' }, async ({ page }) => {
    // Perform login with incorrect case password
    await loginPage.login('student', 'password123');

    // Verify error message is displayed
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText('Your password is invalid!');

    // Verify still on login page
    await expect(page).toHaveURL('https://practicetestautomation.com/practice-test-login/');
  });
});
