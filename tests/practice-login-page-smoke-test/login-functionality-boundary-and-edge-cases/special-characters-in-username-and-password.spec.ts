// spec: tests/practice-login-page-smoke-test/login-functionality-boundary-and-edge-cases/special-characters-in-username-and-password.spec.ts
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/login-page';

test.describe('Login Functionality - Boundary and Edge Cases', () => {
  test('TC-LOGIN-016 Special characters in username and password', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // 1. Navigate to https://practicetestautomation.com/practice-test-login/
    await page.goto('https://practicetestautomation.com/practice-test-login/');

    // 2. Enter 'student!@#$%' into the Username field
    await page.getByRole('textbox', { name: 'Username' }).fill('student!@#$%');

    // 3. Enter 'Pass@123!' into the Password field
    await page.getByRole('textbox', { name: 'Password' }).fill('Pass@123!');

    // 4. Click the Submit button
    await page.getByRole('button', { name: 'Submit' }).click();

    // Verify error message 'Your username is invalid!' is displayed
    await expect(page.locator('#error')).toBeVisible();

    // Verify user remains on the login page
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
  });
});
