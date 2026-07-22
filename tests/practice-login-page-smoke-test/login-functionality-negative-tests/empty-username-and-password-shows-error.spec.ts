import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/login-page';

test.describe('Login Functionality - Negative Tests', () => {
  test('TC-LOGIN-004 Empty username and password shows error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    // 1. Navigate to https://practicetestautomation.com/practice-test-login/
    await loginPage.navigateTo();
    
    // 2. Leave Username field empty (do not enter any text)
    await loginPage.usernameInput.fill('');
    
    // 3. Leave Password field empty (do not enter any text)
    await loginPage.passwordInput.fill('');
    
    // 4. Click the Submit button
    await loginPage.clickSubmit();
    
    // expect: Page does NOT navigate to a new URL
    // expect: Current URL remains https://practicetestautomation.com/practice-test-login/
    await expect(page).toHaveURL('https://practicetestautomation.com/practice-test-login/');
    
    // expect: Error message 'Your username is invalid!' is displayed
    const errorMessage = await loginPage.getErrorMessage();
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('Your username is invalid!');
    
    // expect: User remains on the login page
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });
});
