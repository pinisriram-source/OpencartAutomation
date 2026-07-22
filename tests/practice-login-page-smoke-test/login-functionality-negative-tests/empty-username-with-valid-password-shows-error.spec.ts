import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page-objects/login-page';

test.describe('Login Functionality - Negative Tests', () => {
  test('TC-LOGIN-005 Empty username with valid password shows error', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // 1. Navigate to https://practicetestautomation.com/practice-test-login/
    await loginPage.navigateTo();
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();

    // 2. Leave Username field empty (do not enter any text)
    await loginPage.usernameInput.fill('');
    await expect(loginPage.usernameInput).toHaveValue('');

    // 3. Enter 'Password123' into the Password field
    await loginPage.enterPassword('Password123');
    await expect(loginPage.passwordInput).toHaveValue('Password123');

    // 4. Click the Submit button
    await loginPage.clickSubmit();

    // Verify page does NOT navigate to a new URL
    await expect(page).toHaveURL('https://practicetestautomation.com/practice-test-login/');

    // Verify error message 'Your username is invalid!' is displayed
    const errorMessage = await loginPage.getErrorMessage();
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('Your username is invalid!');

    // Verify user remains on the login page
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });
});
