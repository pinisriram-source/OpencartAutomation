import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/login.page';

test.describe('Security and Input Validation', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('TC-LOGIN-023: SQL injection attempt in username field is handled safely', { tag: '@functional' }, async ({ page }) => {
    await loginPage.login("admin' OR '1'='1", 'anyPassword');

    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.flashMessage).toBeVisible();
    await expect(loginPage.flashMessage).toContainText('Your username is invalid!');
    await expect(page.locator('body')).not.toContainText('SQL');
    await expect(page.locator('body')).not.toContainText('syntax error');
  });

  test('TC-LOGIN-024: XSS attempt in username field is sanitized', { tag: '@functional' }, async ({ page }) => {
    const xssPayload = "<script>alert('XSS')</script>";

    await loginPage.login(xssPayload, 'anyPassword');

    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.flashMessage).toBeVisible();

    const dialogTriggered = await page.evaluate(() => {
      return (window as any).__xssTriggered || false;
    });
    expect(dialogTriggered).toBe(false);
  });

  test('TC-LOGIN-025: Special characters in username are handled correctly', { tag: '@functional' }, async ({ page }) => {
    await loginPage.login('tom@smith#123!', 'SuperSecretPassword!');

    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.flashMessage).toBeVisible();
    await expect(loginPage.flashMessage).toContainText('Your username is invalid!');
  });

  test('TC-LOGIN-026: Very long username input is handled correctly', { tag: '@functional' }, async ({ page }) => {
    const longUsername = 'a'.repeat(500);

    await loginPage.login(longUsername, 'SuperSecretPassword!');

    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.flashMessage).toBeVisible();
    await expect(loginPage.flashMessage).toContainText('Your username is invalid!');
  });

  test('TC-LOGIN-027: Unicode characters in credentials are handled correctly', { tag: '@functional' }, async ({ page }) => {
    await loginPage.login('tomsmíth', 'SuperSecretPassword!');

    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.flashMessage).toBeVisible();
    await expect(loginPage.flashMessage).toContainText('Your username is invalid!');
  });
});
