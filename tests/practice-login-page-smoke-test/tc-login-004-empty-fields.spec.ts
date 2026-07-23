import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/login-page';

test.describe('Practice Login Page Tests', () => {
  test('TC-LOGIN-004 Empty Username And Password Shows Error', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // 1. Navigate to https://practicetestautomation.com/practice-test-login/
    await loginPage.navigate();
    
    // expect: Login page loads successfully
    await loginPage.verifyPageLoaded();

    // 2. Leave Username field empty
    // expect: Username field is empty
    await expect(loginPage.usernameInput).toHaveValue('');

    // 3. Leave Password field empty
    // expect: Password field is empty
    await expect(loginPage.passwordInput).toHaveValue('');

    // 4. Click Submit button
    await loginPage.clickSubmit();
    
    // expect: Page remains on login page
    await expect(page).toHaveURL('https://practicetestautomation.com/practice-test-login/');
    await expect(page.getByRole('heading', { name: 'Test login' })).toBeVisible();
    
    // expect: Error message is displayed
    await expect(loginPage.errorMessage).toBeVisible();
    
    // expect: User cannot proceed with empty credentials
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
  });
});
