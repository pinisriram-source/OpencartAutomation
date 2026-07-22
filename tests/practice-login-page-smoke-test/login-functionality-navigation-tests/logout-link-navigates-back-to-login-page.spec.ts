// spec: Practice Login Page Smoke Test
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/login-page';
import { SuccessPage } from '../page-objects/success-page';

test.describe('Login Functionality - Navigation Tests', () => {
  test('TC-LOGIN-010 Logout link navigates back to login page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const successPage = new SuccessPage(page);

    // 1. Navigate to https://practicetestautomation.com/practice-test-login/
    await page.goto('https://practicetestautomation.com/practice-test-login/');

    // 2. Enter 'student' into the Username field
    await loginPage.enterUsername('student');

    // 3. Enter 'Password123' into the Password field
    await loginPage.enterPassword('Password123');

    // 4. Click the Submit button
    await loginPage.clickSubmit();

    // Verify user is successfully logged in
    await expect(successPage.successHeading).toBeVisible();
    await expect(successPage.logoutLink).toBeVisible();

    // 5. Click the 'Log out' link
    await successPage.clickLogout();

    // Verify page navigates back to login page
    await expect(page).toHaveURL('https://practicetestautomation.com/practice-test-login/');
    
    // Verify login form is visible again
    await expect(loginPage.submitButton).toBeVisible();
    
    // Verify Username and Password fields are empty/cleared
    await expect(loginPage.usernameInput).toHaveValue('');
    await expect(loginPage.passwordInput).toHaveValue('');
    
    // Verify no success message is displayed
    await expect(successPage.successHeading).not.toBeVisible();
  });
});
