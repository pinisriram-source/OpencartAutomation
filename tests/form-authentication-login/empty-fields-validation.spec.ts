import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/login.page';

test.describe('Empty Fields Validation', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('TC-LOGIN-012: Submitting form with both fields empty shows username error', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
    await expect(loginPage.usernameField).toHaveValue('');
    await expect(loginPage.passwordField).toHaveValue('');

    await loginPage.loginButton.click();

    await expect(page).toHaveURL('https://the-internet.herokuapp.com/login');
    await expect(loginPage.flashMessage).toBeVisible();
    await expect(loginPage.flashMessage).toContainText('Your username is invalid!');
  });

  test('TC-LOGIN-013: Submitting form with empty username and valid password shows error', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    await expect(loginPage.usernameField).toHaveValue('');

    await loginPage.passwordField.fill('SuperSecretPassword!');

    await loginPage.loginButton.click();

    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.flashMessage).toBeVisible();
    await expect(loginPage.flashMessage).toContainText('Your username is invalid!');
  });

  test('TC-LOGIN-014: Submitting form with valid username and empty password shows error', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    await loginPage.usernameField.fill('tomsmith');
    await expect(loginPage.usernameField).toHaveValue('tomsmith');
    await expect(loginPage.passwordField).toHaveValue('');

    await loginPage.loginButton.click();

    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.flashMessage).toBeVisible();
    await expect(loginPage.flashMessage).toContainText('Your password is invalid!');
  });

  test('TC-LOGIN-015: Submitting form with whitespace-only username shows error', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    await loginPage.usernameField.fill('   ');

    await loginPage.passwordField.fill('SuperSecretPassword!');

    await loginPage.loginButton.click();

    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.flashMessage).toBeVisible();
    await expect(loginPage.flashMessage).toContainText('Your username is invalid!');
  });
});
