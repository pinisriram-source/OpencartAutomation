// Test Suite: Practice Login Page Tests
// Test Case: TC-LOGIN-006 Valid Username With Empty Password Shows Error
// Seed: tests/practice-login-page-smoke-test/login-functionality-core-tests/successful-login-with-valid-credentials.spec.ts

import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/login-page';

test.describe('Practice Login Page Tests', () => {
  test('TC-LOGIN-006 Valid Username With Empty Password Shows Error', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // 1. Navigate to https://practicetestautomation.com/practice-test-login/
    await loginPage.navigate();
    
    // Verify: Login page loads successfully
    await loginPage.verifyPageLoaded();

    // 2. Enter 'student' into Username field
    await loginPage.enterUsername('student');
    
    // Verify: Username field accepts the input
    await loginPage.verifyUsernameFieldAcceptsInput('student');

    // 3. Leave Password field empty
    // Verify: Password field is empty
    await expect(loginPage.passwordInput).toHaveValue('');

    // 4. Click Submit button
    await loginPage.clickSubmit();
    
    // Verify: Page remains on login page
    await expect(page).toHaveURL('https://practicetestautomation.com/practice-test-login/');
    
    // Verify: Error message 'Your password is invalid!' is displayed
    await loginPage.verifyErrorMessage('Your password is invalid!');
  });
});
