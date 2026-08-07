import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/login.page';

test.describe('Initial Page State', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
  });

  test('TC-LOGIN-001: Verify login page loads with all required elements', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
    await loginPage.navigate();

    await expect(page).toHaveURL('https://the-internet.herokuapp.com/login');
    await expect(page).toHaveTitle('The Internet');
    await expect(loginPage.pageHeading).toBeVisible();
    await expect(loginPage.usernameField).toBeVisible();
    await expect(loginPage.usernameField).toBeEnabled();
    await expect(loginPage.passwordField).toBeVisible();
    await expect(loginPage.passwordField).toBeEnabled();
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.loginButton).toBeEnabled();
    await expect(loginPage.flashMessage).not.toBeVisible();
  });

  test('TC-LOGIN-002: Verify instruction text is displayed on page load', { tag: ['@sanity', '@regression'] }, async () => {
    await loginPage.navigate();

    await expect(loginPage.instructionText).toBeVisible();
    await expect(loginPage.instructionText).toContainText('tomsmith');
    await expect(loginPage.instructionText).toContainText('SuperSecretPassword!');
    await expect(loginPage.instructionText).toContainText('error messages');
  });

  test('TC-LOGIN-003: Verify input fields are empty on initial page load', { tag: ['@sanity', '@regression'] }, async () => {
    await loginPage.navigate();

    await expect(loginPage.usernameField).toHaveValue('');
    await expect(loginPage.passwordField).toHaveValue('');
  });
});
