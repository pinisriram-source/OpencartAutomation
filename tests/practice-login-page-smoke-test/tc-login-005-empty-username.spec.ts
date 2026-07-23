import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/login-page';

test.describe('Practice Login Page Tests', () => {
  test('TC-LOGIN-005 Empty Username With Valid Password Shows Error', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // 1. Navigate to https://practicetestautomation.com/practice-test-login/
    await loginPage.navigate();
    
    // Verify: Login page loads successfully
    await loginPage.verifyPageLoaded();

    // 2. Leave Username field empty
    // Verify: Username field is empty
    await expect(loginPage.usernameInput).toHaveValue('');

    // 3. Enter 'Password123' into Password field
    await loginPage.enterPassword('Password123');
    
    // Verify: Password field accepts the input
    await expect(loginPage.passwordInput).toHaveValue('Password123');

    // 4. Click Submit button
    await loginPage.clickSubmit();
    
    // Verify: Page remains on login page
    await expect(page).toHaveURL('https://practicetestautomation.com/practice-test-login/');
    
    // Verify: Error message 'Your username is invalid!' is displayed
    await loginPage.verifyErrorMessage('Your username is invalid!');
  });
});
