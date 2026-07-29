import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/login.page';

test.describe('Login Page - Password Masking', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('TC-LOGIN-011: Password field has type="password"', { tag: '@functional' }, async () => {
    // Verify password field type attribute
    const passwordFieldType = await loginPage.getPasswordFieldType();
    expect(passwordFieldType).toBe('password');

    // Verify password field is visible
    await expect(loginPage.passwordField).toBeVisible();
  });
});
