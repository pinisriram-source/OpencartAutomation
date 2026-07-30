import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/login.page';
import { SecurePage } from './page-objects/secure.page';

test.describe('Logout Flow', () => {
  let loginPage: LoginPage;
  let securePage: SecurePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    securePage = new SecurePage(page);
  });

  test('TC-LOGIN-019: Clicking Logout navigates back to login page with flash message', { tag: '@smoke' }, async ({ page }) => {
    await loginPage.navigate();
    await loginPage.login('tomsmith', 'SuperSecretPassword!');
    await expect(page).toHaveURL(/\/secure/);

    await securePage.logout();

    await expect(page).toHaveURL('https://the-internet.herokuapp.com/login');
    await expect(loginPage.flashMessage).toBeVisible();
    await expect(loginPage.flashMessage).toContainText('You logged out of the secure area!');
    await expect(loginPage.usernameField).toBeVisible();
    await expect(loginPage.passwordField).toBeVisible();
    await expect(loginPage.usernameField).toHaveValue('');
    await expect(loginPage.passwordField).toHaveValue('');
  });

  test('TC-LOGIN-020: After logout, attempting to navigate back to secure area redirects to login', { tag: '@functional' }, async ({ page }) => {
    await loginPage.navigate();
    await loginPage.login('tomsmith', 'SuperSecretPassword!');
    await expect(page).toHaveURL(/\/secure/);
    await securePage.logout();
    await expect(page).toHaveURL(/\/login/);

    await page.goto('https://the-internet.herokuapp.com/secure');

    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.flashMessage).toBeVisible();
    await expect(loginPage.flashMessage).toContainText('You must login to view the secure area!');
  });
});
