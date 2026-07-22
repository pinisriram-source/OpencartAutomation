import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/login-page';

test.describe('Login Functionality - Boundary and Edge Cases', () => {
  test('TC-LOGIN-015 Very long username input', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    // 1. Navigate to https://practicetestautomation.com/practice-test-login/
    await page.goto('https://practicetestautomation.com/practice-test-login/');
    await expect(page.getByRole('heading', { name: 'Test login' })).toBeVisible();
    
    // 2. Enter a very long string (1000 characters of 'a') into the Username field
    const longUsername = 'a'.repeat(1000);
    await loginPage.usernameInput.click();
    await page.evaluate((username) => {
      const usernameField = document.querySelector('input[id="username"]') as HTMLInputElement;
      if (usernameField) {
        usernameField.value = username;
      }
    }, longUsername);
    
    // 3. Enter 'Password123' into the Password field
    await loginPage.passwordInput.fill('Password123');
    await expect(loginPage.passwordInput).toHaveValue('Password123');
    
    // 4. Click the Submit button
    await loginPage.submitButton.click();
    
    // Verify error message 'Your username is invalid!' is displayed
    await expect(page.getByText('Your username is invalid!')).toBeVisible();
    
    // Verify page handles long input gracefully without crashing
    await expect(page.getByRole('heading', { name: 'Test login' })).toBeVisible();
    
    // Verify user remains on the login page
    await expect(page).toHaveURL('https://practicetestautomation.com/practice-test-login/');
  });
});
