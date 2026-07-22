// Test Plan: Practice Login Page Smoke Test - Login Functionality - Negative Tests
// Seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/login-page';

test.describe('Login Functionality - Negative Tests', () => {
  test('TC-LOGIN-007 Both invalid username and password shows username error', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // 1. Navigate to https://practicetestautomation.com/practice-test-login/
    await page.goto('https://practicetestautomation.com/practice-test-login/');
    await expect(page).toHaveURL('https://practicetestautomation.com/practice-test-login/');
    await expect(page.getByRole('heading', { name: 'Test login' })).toBeVisible();

    // 2. Enter 'wrongUser' into the Username field
    await page.getByRole('textbox', { name: 'Username' }).fill('wrongUser');
    await expect(page.getByRole('textbox', { name: 'Username' })).toHaveValue('wrongUser');

    // 3. Enter 'wrongPassword' into the Password field
    await page.getByRole('textbox', { name: 'Password' }).fill('wrongPassword');
    await expect(page.getByRole('textbox', { name: 'Password' })).toHaveValue('wrongPassword');

    // 4. Click the Submit button
    await page.getByRole('button', { name: 'Submit' }).click();

    // Verify Page does NOT navigate to a new URL
    await expect(page).toHaveURL('https://practicetestautomation.com/practice-test-login/');

    // Verify error message 'Your username is invalid!' is displayed (username is validated first)
    await expect(page.locator('#error')).toHaveText('Your username is invalid!');

    // Verify user remains on the login page
    await expect(page.getByRole('heading', { name: 'Test login' })).toBeVisible();
  });
});
