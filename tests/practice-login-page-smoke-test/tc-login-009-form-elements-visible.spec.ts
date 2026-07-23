import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/login-page';

test.describe('Practice Login Page Tests', () => {
  test('TC-LOGIN-009 Login Form Elements Are Visible On Page Load', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // 1. Navigate to https://practicetestautomation.com/practice-test-login/
    await loginPage.navigate();
    
    // Verify: Login page loads successfully
    await expect(page).toHaveTitle('Test Login | Practice Test Automation');
    
    // Verify: Page heading 'Test login' is displayed
    await expect(page.getByRole('heading', { name: 'Test login' })).toBeVisible();
    
    // Verify: Username field is visible and enabled
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.usernameInput).toBeEnabled();
    
    // Verify: Username field has label 'Username'
    await expect(page.getByText('Username', { exact: true })).toBeVisible();
    
    // Verify: Password field is visible and enabled
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeEnabled();
    
    // Verify: Password field has label 'Password'
    await expect(page.getByText('Password', { exact: true })).toBeVisible();
    
    // Verify: Submit button is visible and enabled
    await expect(loginPage.submitButton).toBeVisible();
    await expect(loginPage.submitButton).toBeEnabled();
    
    // Verify: Credential instructions are displayed ('Username: student', 'Password: Password123')
    await expect(page.getByText('Username: student')).toBeVisible();
    await expect(page.getByText('Password: Password123')).toBeVisible();
    
    // Verify: Test case descriptions are visible on the page
    await expect(page.getByText('Test case 1')).toBeVisible();
  });
});
