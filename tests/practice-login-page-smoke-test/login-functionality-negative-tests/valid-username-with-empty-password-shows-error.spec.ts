// Test Suite: Login Functionality - Negative Tests
// Test Case: TC-LOGIN-006 Valid username with empty password shows error
// Seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page-objects/login-page';

test.describe('Login Functionality - Negative Tests', () => {
  test('TC-LOGIN-006 Valid username with empty password shows error', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // 1. Navigate to https://practicetestautomation.com/practice-test-login/
    await loginPage.navigateTo();
    await expect(page.getByRole('heading', { name: 'Test login' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();

    // 2. Enter 'student' into the Username field
    await loginPage.enterUsername('student');
    await expect(page.getByRole('textbox', { name: 'Username' })).toHaveValue('student');

    // 3. Leave Password field empty (do not enter any text)
    await expect(page.getByRole('textbox', { name: 'Password' })).toHaveValue('');

    // 4. Click the Submit button
    await loginPage.clickSubmit();

    // Verify page does NOT navigate to a new URL
    await expect(page).toHaveURL('https://practicetestautomation.com/practice-test-login/');

    // Verify error message 'Your password is invalid!' is displayed
    await expect(page.getByText('Your password is invalid!')).toBeVisible();

    // Verify user remains on the login page
    await expect(page.getByRole('heading', { name: 'Test login' })).toBeVisible();
  });
});
