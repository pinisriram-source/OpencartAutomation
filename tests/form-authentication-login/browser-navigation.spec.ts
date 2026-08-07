import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/login.page';
import { SecurePage } from './page-objects/secure.page';

test.describe('Browser Navigation Behavior', () => {
  let loginPage: LoginPage;
  let securePage: SecurePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    securePage = new SecurePage(page);
  });

  test('TC-LOGIN-028: Browser back button after successful login returns to login page', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    await loginPage.navigate();
    await loginPage.login('tomsmith', 'SuperSecretPassword!');
    await expect(page).toHaveURL(/\/secure/);

    await page.goBack();

    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.usernameField).toBeVisible();
    await expect(securePage.pageHeading).not.toBeVisible();
  });

  test('TC-LOGIN-029: Browser forward button after logout navigates forward', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    await loginPage.navigate();
    await loginPage.login('tomsmith', 'SuperSecretPassword!');
    await expect(page).toHaveURL(/\/secure/);
    await securePage.logout();
    await expect(page).toHaveURL(/\/login/);

    await page.goBack();
    await page.goForward();

    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.usernameField).toBeVisible();
  });

  test('TC-LOGIN-030: Page refresh on login page clears form state', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    await loginPage.navigate();

    await loginPage.usernameField.fill('testuser');
    await expect(loginPage.usernameField).toHaveValue('testuser');

    await page.reload();

    await expect(loginPage.usernameField).toHaveValue('');
    await expect(loginPage.passwordField).toHaveValue('');
  });
});
