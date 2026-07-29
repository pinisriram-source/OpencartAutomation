import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/login.page';

test.describe('Login Page - Invalid Username', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('TC-LOGIN-003: Invalid username shows error "Your username is invalid!"', { tag: '@sanity' }, async ({ page }) => {
    // Perform login with invalid username
    await loginPage.login('incorrectUser', 'Password123');

    // Verify error message is displayed
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText('Your username is invalid!');

    // Verify still on login page
    await expect(page).toHaveURL('https://practicetestautomation.com/practice-test-login/');
  });
});
