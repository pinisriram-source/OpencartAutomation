import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/login-page';
import { SuccessPage } from '../page-objects/success-page';

test.describe('Login Functionality - Navigation Tests', () => {
  test('TC-LOGIN-011 Success page displays all required elements', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const successPage = new SuccessPage(page);

    // 1. Navigate to https://practicetestautomation.com/practice-test-login/
    await loginPage.navigate();
    
    // Verify: Page loads successfully
    await expect(page).toHaveTitle('Test Login | Practice Test Automation');

    // 2. Enter 'student' into the Username field and 'Password123' into the Password field
    await loginPage.enterUsername('student');
    await loginPage.enterPassword('Password123');
    
    // Verify: Both fields accept the input
    await expect(loginPage.usernameInput).toHaveValue('student');

    // 3. Click the Submit button
    await loginPage.clickSubmit();
    
    // Verify: Page navigates to success page
    await expect(page).toHaveURL('https://practicetestautomation.com/logged-in-successfully/');
    
    // Verify: Page title is 'Logged In Successfully | Practice Test Automation'
    await expect(page).toHaveTitle('Logged In Successfully | Practice Test Automation');
    
    // Verify: Heading 'Logged In Successfully' is displayed (h1 level)
    await expect(successPage.heading).toBeVisible();
    await expect(successPage.heading).toHaveText('Logged In Successfully');
    
    // Verify: Success message contains 'Congratulations student. You successfully logged in!'
    await expect(successPage.successMessage).toContainText('Congratulations student. You successfully logged in!');
    
    // Verify: Log out link is present and clickable
    await expect(successPage.logoutLink).toBeVisible();
    
    // Verify: Log out link href points to the login page
    await expect(successPage.logoutLink).toHaveAttribute('href', 'https://practicetestautomation.com/practice-test-login/');
  });
});
