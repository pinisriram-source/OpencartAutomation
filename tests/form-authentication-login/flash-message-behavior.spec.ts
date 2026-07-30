import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/login.page';
import { SecurePage } from './page-objects/secure.page';

test.describe('Flash Message Behavior', () => {
  let loginPage: LoginPage;
  let securePage: SecurePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    securePage = new SecurePage(page);
  });

  test('TC-LOGIN-016: Flash message close button dismisses success message', { tag: '@sanity' }, async ({ page }) => {
    await loginPage.navigate();
    await loginPage.login('tomsmith', 'SuperSecretPassword!');

    await expect(page).toHaveURL(/\/secure/);
    await expect(securePage.flashMessage).toBeVisible();

    await securePage.flashCloseButton.click();

    await expect(securePage.flashMessage).not.toBeVisible();
    await expect(page).toHaveURL(/\/secure/);
    await expect(securePage.pageHeading).toBeVisible();
    await expect(securePage.logoutButton).toBeVisible();
  });

  test('TC-LOGIN-017: Flash message close button dismisses error message', { tag: '@sanity' }, async ({ page }) => {
    await loginPage.navigate();
    await loginPage.login('invalidUser', 'wrongPass');

    await expect(loginPage.flashMessage).toBeVisible();

    await loginPage.flashCloseButton.click();

    await expect(loginPage.flashMessage).not.toBeVisible();
    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.usernameField).toBeVisible();
    await expect(loginPage.passwordField).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('TC-LOGIN-018: Flash message persists until dismissed or page navigates', { tag: '@functional' }, async ({ page }) => {
    await loginPage.navigate();
    await loginPage.login('tomsmith', 'SuperSecretPassword!');

    await expect(page).toHaveURL(/\/secure/);
    await expect(securePage.flashMessage).toBeVisible();
    await expect(securePage.flashMessage).toContainText('You logged into a secure area!');
  });
});
