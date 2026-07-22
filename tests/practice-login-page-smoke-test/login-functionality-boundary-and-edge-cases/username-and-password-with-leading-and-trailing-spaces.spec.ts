import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/login-page';

test.describe('Login Functionality - Boundary and Edge Cases', () => {
  test('TC-LOGIN-014 Username and password with leading and trailing spaces', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    // 1. Navigate to https://practicetestautomation.com/practice-test-login/
    await page.goto('https://practicetestautomation.com/practice-test-login/');
    
    // Verify page loads successfully
    await expect(page.getByRole('heading', { name: 'Test login' })).toBeVisible();
    
    // 2. Enter ' student ' (with leading and trailing spaces) into the Username field
    // Note: Using page.evaluate to set the value directly as Playwright's fill() method may trigger
    // JavaScript event handlers that trim the spaces
    await page.evaluate(() => {
      const input = document.querySelector('input[name="username"]') as HTMLInputElement;
      input.value = ' student ';
    });
    
    // Verify username field accepts the input with spaces
    const usernameValue = await page.evaluate(() => {
      const input = document.querySelector('input[name="username"]') as HTMLInputElement;
      return { value: input.value, length: input.value.length };
    });
    expect(usernameValue.value).toBe(' student ');
    expect(usernameValue.length).toBe(9);
    
    // 3. Enter ' Password123 ' (with leading and trailing spaces) into the Password field
    await page.evaluate(() => {
      const input = document.querySelector('input[name="password"]') as HTMLInputElement;
      input.value = ' Password123 ';
    });
    
    // Verify password field accepts the input with spaces
    const passwordValue = await page.evaluate(() => {
      const input = document.querySelector('input[name="password"]') as HTMLInputElement;
      return { value: input.value, length: input.value.length };
    });
    expect(passwordValue.value).toBe(' Password123 ');
    expect(passwordValue.length).toBe(13);
    
    // 4. Click the Submit button
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Verify error message is displayed (spaces are not trimmed, so credentials don't match)
    await expect(page.locator('#error')).toHaveText('Your username is invalid!');
    
    // Verify user remains on the login page
    await expect(page.getByRole('heading', { name: 'Test login' })).toBeVisible();
    
    // Verify current URL remains https://practicetestautomation.com/practice-test-login/
    const currentUrl = await page.evaluate(() => window.location.href);
    expect(currentUrl).toBe('https://practicetestautomation.com/practice-test-login/');
  });
});
