import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/login.page';

test.describe('Invalid Username', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('TC-LOGIN-006: Login with invalid username shows error message', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
    await loginPage.usernameField.fill('invalidUser');
    await expect(loginPage.usernameField).toHaveValue('invalidUser');

    await loginPage.passwordField.fill('somePassword');
    await expect(loginPage.passwordField).toHaveValue('somePassword');

    await loginPage.loginButton.click();

    await expect(page).toHaveURL('https://the-internet.herokuapp.com/login');
    await expect(loginPage.flashMessage).toBeVisible();
    await expect(loginPage.flashMessage).toContainText('Your username is invalid!');
    await expect(loginPage.usernameField).toBeVisible();
    await expect(loginPage.passwordField).toBeVisible();
  });

  test('TC-LOGIN-007: Login with invalid username case variation shows error', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    await loginPage.usernameField.fill('TomSmith');
    await expect(loginPage.usernameField).toHaveValue('TomSmith');

    await loginPage.passwordField.fill('SuperSecretPassword!');

    await loginPage.loginButton.click();

    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.flashMessage).toBeVisible();
    await expect(loginPage.flashMessage).toContainText('Your username is invalid!');
  });

  test('TC-LOGIN-008: Login with whitespace-padded username shows error', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    await loginPage.usernameField.fill(' tomsmith ');
    await expect(loginPage.usernameField).toHaveValue(' tomsmith ');

    await loginPage.passwordField.fill('SuperSecretPassword!');

    await loginPage.loginButton.click();

    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.flashMessage).toBeVisible();
    await expect(loginPage.flashMessage).toContainText('Your username is invalid!');
  });
});
