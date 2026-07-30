import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/login.page';
import { SecurePage } from './page-objects/secure.page';

test.describe('Valid Login Flow', () => {
  let loginPage: LoginPage;
  let securePage: SecurePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    securePage = new SecurePage(page);
  });

  test('TC-LOGIN-004: Successful login with valid credentials navigates to secure area', { tag: '@smoke' }, async ({ page }) => {
    await loginPage.navigate();

    await loginPage.usernameField.fill('tomsmith');
    await expect(loginPage.usernameField).toHaveValue('tomsmith');

    await loginPage.passwordField.fill('SuperSecretPassword!');
    await expect(loginPage.passwordField).toHaveValue('SuperSecretPassword!');

    await loginPage.loginButton.click();

    await expect(page).toHaveURL('https://the-internet.herokuapp.com/secure');
    await expect(securePage.pageHeading).toBeVisible();
    await expect(securePage.pageHeading).toHaveText('Secure Area');
    await expect(securePage.flashMessage).toBeVisible();
    await expect(securePage.flashMessage).toContainText('You logged into a secure area!');
    await expect(securePage.logoutButton).toBeVisible();
  });

  test('TC-LOGIN-005: Secure area displays welcome message and logout button', { tag: '@sanity' }, async ({ page }) => {
    await loginPage.navigate();
    await loginPage.login('tomsmith', 'SuperSecretPassword!');

    await expect(page).toHaveURL(/\/secure/);
    await expect(securePage.pageHeading).toBeVisible();
    await expect(securePage.pageHeading).toHaveText('Secure Area');
    await expect(securePage.welcomeMessage).toBeVisible();
    await expect(securePage.welcomeMessage).toContainText('Welcome to the Secure Area. When you are done click logout below.');
    await expect(securePage.logoutButton).toBeVisible();
  });
});
