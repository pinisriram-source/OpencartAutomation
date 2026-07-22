// Test Plan: Login Functionality - UI Verification
// Test Case: TC-LOGIN-008 Login page loads with all required elements

import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/login-page';

test.describe('Login Functionality - UI Verification', () => {
  test('TC-LOGIN-008 Login page loads with all required elements', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    // 1. Navigate to https://practicetestautomation.com/practice-test-login/
    await loginPage.navigate();
    
    // expect: Page loads successfully within 5 seconds (Playwright default timeout)
    // expect: Page title is 'Test Login | Practice Test Automation'
    await expect(page).toHaveTitle('Test Login | Practice Test Automation');
    
    // expect: Page heading 'Test login' is visible
    await expect(page.getByRole('heading', { name: 'Test login' })).toBeVisible();
    
    // expect: Username textbox is present and enabled
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.usernameInput).toBeEnabled();
    
    // expect: Username label/text is visible
    await expect(page.locator('text=Username').first()).toBeVisible();
    
    // expect: Password textbox is present and enabled
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeEnabled();
    
    // expect: Password label/text is visible
    await expect(page.locator('text=Password').first()).toBeVisible();
    
    // expect: Submit button is present and enabled
    await expect(loginPage.submitButton).toBeVisible();
    await expect(loginPage.submitButton).toBeEnabled();
    
    // expect: Instructions text about test credentials is visible on the page
    await expect(page.locator('text=Use next credentials to execute Login')).toBeVisible();
    await expect(page.locator('text=Username: student')).toBeVisible();
    await expect(page.locator('text=Password: Password123')).toBeVisible();
  });
});
