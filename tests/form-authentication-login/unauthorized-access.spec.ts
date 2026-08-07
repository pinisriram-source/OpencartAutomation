import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/login.page';
import { SecurePage } from './page-objects/secure.page';

test.describe('Unauthorized Access', () => {
  let loginPage: LoginPage;
  let securePage: SecurePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    securePage = new SecurePage(page);
  });

  test('TC-LOGIN-021: Direct navigation to secure area without login redirects to login page', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
    await securePage.navigate();

    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.flashMessage).toBeVisible();
    await expect(loginPage.flashMessage).toContainText('You must login to view the secure area!');
    await expect(loginPage.usernameField).toBeVisible();
    await expect(loginPage.passwordField).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('TC-LOGIN-022: Multiple failed login attempts still allow successful login', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    await loginPage.navigate();

    await loginPage.login('wrongUser', 'wrongPass');
    await expect(loginPage.flashMessage).toBeVisible();
    await expect(loginPage.flashMessage).toContainText('Your username is invalid!');

    await loginPage.login('anotherWrong', 'anotherPass');
    await expect(loginPage.flashMessage).toBeVisible();
    await expect(loginPage.flashMessage).toContainText('Your username is invalid!');

    await loginPage.login('tomsmith', 'SuperSecretPassword!');
    await expect(page).toHaveURL(/\/secure/);
    await expect(securePage.flashMessage).toBeVisible();
    await expect(securePage.flashMessage).toContainText('You logged into a secure area!');
  });
});
