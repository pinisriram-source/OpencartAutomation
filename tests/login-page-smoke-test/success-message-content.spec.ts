import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/login.page';
import { SuccessPage } from './page-objects/success.page';

test.describe('Login Page - Success Message Content', () => {
  let loginPage: LoginPage;
  let successPage: SuccessPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    successPage = new SuccessPage(page);
    await loginPage.navigate();
  });

  test('TC-LOGIN-014: Success page shows personalized message', { tag: '@functional' }, async ({ page }) => {
    // Perform login with valid credentials
    await loginPage.login('student', 'Password123');

    // Verify navigation to success page
    await expect(page).toHaveURL(/.*logged-in-successfully.*/);

    // Verify success message contains username
    const messageText = await successPage.getSuccessMessageText();
    expect(messageText).toContain('Congratulations');
    expect(messageText).toContain('student');
    expect(messageText).toContain('successfully logged in');

    // Verify exact message
    await expect(successPage.successMessage).toHaveText('Congratulations student. You successfully logged in!');
  });
});
