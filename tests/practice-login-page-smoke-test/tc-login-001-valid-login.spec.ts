// Test Plan: Practice Login Page Tests
// Seed: tests/practice-login-page-smoke-test/login-functionality-core-tests/successful-login-with-valid-credentials.spec.ts

import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/login-page';
import { SuccessPage } from './page-objects/success-page';

test.describe('Practice Login Page Tests', () => {
  test('TC-LOGIN-001 Valid Login Redirects To Success Page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const successPage = new SuccessPage(page);

    // 1. Navigate to https://practicetestautomation.com/practice-test-login/
    await loginPage.navigate();
    
    // expect: Login page loads successfully
    // expect: Page title is 'Test Login | Practice Test Automation'
    await loginPage.verifyPageLoaded();

    // 2. Enter 'student' into Username field
    await loginPage.enterUsername('student');
    
    // expect: Username field accepts the input
    await loginPage.verifyUsernameFieldAcceptsInput('student');

    // 3. Enter 'Password123' into Password field
    await loginPage.enterPassword('Password123');
    
    // expect: Password field accepts the input (masked)
    await loginPage.verifyPasswordFieldMasked();

    // 4. Click Submit button
    await loginPage.clickSubmit();
    
    // expect: Page navigates to success page
    // expect: URL is 'https://practicetestautomation.com/logged-in-successfully/'
    await successPage.verifyURL();
    
    // expect: Page title is 'Logged In Successfully | Practice Test Automation'
    await successPage.verifyPageTitle();
    
    // expect: Page displays heading 'Logged In Successfully'
    await successPage.verifyHeading();
    
    // expect: Page contains message 'Congratulations student. You successfully logged in!'
    await successPage.verifySuccessMessage('student');
    
    // expect: Log out link is visible and links to practice login page
    await successPage.verifyLogoutLinkVisible();
  });
});
