import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/login.page';

test.describe('Invalid Password', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('TC-LOGIN-009: Login with valid username but invalid password shows error', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
    await loginPage.usernameField.fill('tomsmith');
    await expect(loginPage.usernameField).toHaveValue('tomsmith');

    await loginPage.passwordField.fill('wrongPassword');
    await expect(loginPage.passwordField).toHaveValue('wrongPassword');

    await loginPage.loginButton.click();

    await expect(page).toHaveURL('https://the-internet.herokuapp.com/login');
    await expect(loginPage.flashMessage).toBeVisible();
    await expect(loginPage.flashMessage).toContainText('Your password is invalid!');
    await expect(loginPage.usernameField).toBeVisible();
    await expect(loginPage.passwordField).toBeVisible();
  });

  test('TC-LOGIN-010: Login with valid username and incorrect password case shows error', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    await loginPage.usernameField.fill('tomsmith');

    await loginPage.passwordField.fill('supersecretpassword!');

    await loginPage.loginButton.click();

    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.flashMessage).toBeVisible();
    await expect(loginPage.flashMessage).toContainText('Your password is invalid!');
  });

  test('TC-LOGIN-011: Login with valid username and whitespace-padded password shows error', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    await loginPage.usernameField.fill('tomsmith');

    await loginPage.passwordField.fill(' SuperSecretPassword! ');

    await loginPage.loginButton.click();

    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.flashMessage).toBeVisible();
    await expect(loginPage.flashMessage).toContainText('Your password is invalid!');
  });
});
