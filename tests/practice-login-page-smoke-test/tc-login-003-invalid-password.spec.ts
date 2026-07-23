// spec: Practice Login Page Tests
// seed: tests/practice-login-page-smoke-test/login-functionality-core-tests/successful-login-with-valid-credentials.spec.ts

import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/login-page';
import { SuccessPage } from './page-objects/success-page';

test.describe('Practice Login Page Tests', () => {
  test('TC-LOGIN-003 Invalid Password Shows Error Message', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // 1. Navigate to https://practicetestautomation.com/practice-test-login/
    await loginPage.navigate();
    
    // expect: Login page loads successfully
    await expect(page.getByRole('heading', { name: 'Test login' })).toBeVisible();

    // 2. Enter 'student' into Username field
    await page.getByRole('textbox', { name: 'Username' }).pressSequentially('student');
    
    // expect: Username field accepts the input
    await expect(page.getByRole('textbox', { name: 'Username' })).toHaveValue('student');

    // 3. Enter 'wrongpassword' into Password field
    await page.getByRole('textbox', { name: 'Password' }).pressSequentially('incorrectPassword');
    
    // expect: Password field accepts the input
    await expect(page.getByRole('textbox', { name: 'Password' })).toHaveValue('incorrectPassword');

    // 4. Click Submit button
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // expect: Page remains on login page (URL unchanged)
    await expect(page).toHaveURL('https://practicetestautomation.com/practice-test-login/');
    
    // expect: Error message 'Your password is invalid!' is displayed and visible to the user
    await loginPage.verifyErrorMessage('Your password is invalid!');
    
    // expect: Username and password fields are still present
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
  });
});
