import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/login-page';
import { SuccessPage } from '../page-objects/success-page';

test.describe('Login Functionality - Core Tests', () => {
  test('TC-LOGIN-001 Successful login with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const successPage = new SuccessPage(page);

    // 1. Navigate to https://practicetestautomation.com/practice-test-login/
    await loginPage.navigate();
    
    // Verify: The page loads successfully
    // Verify: Page title is 'Test Login | Practice Test Automation'
    // Verify: Login form with Username and Password fields is visible
    // Verify: Submit button is present
    await loginPage.verifyPageLoaded();

    // 2. Enter 'student' into the Username field
    await loginPage.enterUsername('student');
    
    // Verify: Username field accepts the input
    // Verify: Entered text is visible in the field
    await loginPage.verifyUsernameFieldAcceptsInput('student');

    // 3. Enter 'Password123' into the Password field
    await loginPage.enterPassword('Password123');
    
    // Verify: Password field accepts the input
    // Verify: Entered text is masked/hidden
    await loginPage.verifyPasswordFieldMasked();

    // 4. Click the Submit button
    await loginPage.clickSubmit();
    
    // Verify: Page navigates to a new URL
    // Verify: New URL is https://practicetestautomation.com/logged-in-successfully/
    await successPage.verifyURL();
    
    // Verify: Page title changes to 'Logged In Successfully | Practice Test Automation'
    await successPage.verifyPageTitle();
    
    // Verify: Page displays heading 'Logged In Successfully'
    await successPage.verifyHeading();
    
    // Verify: Success message 'Congratulations student. You successfully logged in!' is displayed
    await successPage.verifySuccessMessage('student');
    
    // Verify: Log out link is visible and present on the page
    await successPage.verifyLogoutLinkVisible();
  });
});
