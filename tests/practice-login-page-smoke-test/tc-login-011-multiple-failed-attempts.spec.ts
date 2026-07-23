import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/login-page';
import { SuccessPage } from './page-objects/success-page';

test.describe('Practice Login Page Tests', () => {
  test('TC-LOGIN-011 Multiple Failed Login Attempts Are Allowed', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const successPage = new SuccessPage(page);

    // 1. Navigate to https://practicetestautomation.com/practice-test-login/
    await loginPage.navigate();
    
    // expect: Login page loads successfully
    await loginPage.verifyPageLoaded();

    // 2. Enter 'wronguser' into Username field and 'Password123' into Password field
    await loginPage.enterUsername('wronguser');
    await loginPage.enterPassword('Password123');
    
    // expect: Fields accept the input
    await loginPage.verifyUsernameFieldAcceptsInput('wronguser');

    // 3. Click Submit button
    await loginPage.clickSubmit();
    
    // expect: Error message 'Your username is invalid!' is displayed
    await loginPage.verifyErrorMessage('Your username is invalid!');
    
    // expect: User remains on login page
    await expect(page.getByRole('heading', { name: 'Test login' })).toBeVisible();

    // 4. Enter 'student' into Username field and 'wrongpass' into Password field
    await loginPage.enterUsername('student');
    await loginPage.enterPassword('wrongpass');
    
    // expect: Fields accept the new input
    await loginPage.verifyUsernameFieldAcceptsInput('student');

    // 5. Click Submit button
    await loginPage.clickSubmit();
    
    // expect: Error message 'Your password is invalid!' is displayed
    await loginPage.verifyErrorMessage('Your password is invalid!');
    
    // expect: User remains on login page
    await expect(page.getByRole('heading', { name: 'Test login' })).toBeVisible();
    
    // expect: No account lockout or rate limiting is enforced

    // 6. Enter 'student' into Username field and 'Password123' into Password field
    await loginPage.enterUsername('student');
    await loginPage.enterPassword('Password123');
    
    // expect: Fields accept the valid input
    await loginPage.verifyUsernameFieldAcceptsInput('student');

    // 7. Click Submit button
    await loginPage.clickSubmit();
    
    // expect: Login succeeds
    // expect: User is navigated to success page
    await successPage.verifySuccessfulLogin('student');
  });
});
