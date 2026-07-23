import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/login-page';

test.describe('Practice Login Page Tests', () => {
  test('TC-LOGIN-002 Invalid Username Shows Error Message', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // 1. Navigate to https://practicetestautomation.com/practice-test-login/
    await loginPage.navigate();
    
    // Verify: Login page loads successfully
    await loginPage.verifyPageLoaded();

    // 2. Enter 'invaliduser' into Username field
    await loginPage.enterUsername('invaliduser');
    
    // Verify: Username field accepts the input
    await loginPage.verifyUsernameFieldAcceptsInput('invaliduser');

    // 3. Enter 'Password123' into Password field
    await loginPage.enterPassword('Password123');
    
    // Verify: Password field accepts the input
    await loginPage.verifyPasswordFieldMasked();

    // 4. Click Submit button
    const currentURL = page.url();
    await loginPage.clickSubmit();
    
    // Verify: Page remains on login page (URL unchanged)
    await expect(page).toHaveURL(currentURL);
    
    // Verify: Error message 'Your username is invalid!' is displayed
    await loginPage.verifyErrorMessage('Your username is invalid!');
    
    // Verify: Error message is visible to the user
    await expect(loginPage.errorMessage).toBeVisible();
    
    // Verify: Username and password fields are still present
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
  });
});
