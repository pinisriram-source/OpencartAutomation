// spec: Practice Login Page Smoke Test
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/login-page';

test.describe('Login Functionality - Core Tests', () => {
  test('TC-LOGIN-003 Invalid password displays error message', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // 1. Navigate to https://practicetestautomation.com/practice-test-login/
    await loginPage.navigate();
    await loginPage.verifyPageLoaded();

    // 2. Enter 'student' into the Username field
    await loginPage.enterUsername('student');
    await loginPage.verifyUsernameFieldAcceptsInput('student');

    // 3. Enter 'wrongPassword' into the Password field
    await loginPage.enterPassword('wrongPassword');
    await expect(loginPage.passwordInput).toHaveValue('wrongPassword');

    // 4. Click the Submit button
    await loginPage.clickSubmit();

    // Verify: Page does NOT navigate to a new URL
    await expect(page).toHaveURL('https://practicetestautomation.com/practice-test-login/');

    // Verify: Error message 'Your password is invalid!' is displayed
    await loginPage.verifyErrorMessage('Your password is invalid!');

    // Verify: User remains on the login page
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
  });
});
