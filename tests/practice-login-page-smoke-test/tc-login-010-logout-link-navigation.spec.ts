import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/login-page';
import { SuccessPage } from './page-objects/success-page';

test.describe('Practice Login Page Tests', () => {
  test('TC-LOGIN-010 Success Page Has Link Back To Practice Page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const successPage = new SuccessPage(page);

    // 1. Navigate to https://practicetestautomation.com/practice-test-login/
    await loginPage.navigate();
    
    // expect: Login page loads successfully
    await loginPage.verifyPageLoaded();

    // 2. Enter 'student' into Username field
    await loginPage.enterUsername('student');
    
    // expect: Username field accepts the input
    await loginPage.verifyUsernameFieldAcceptsInput('student');

    // 3. Enter 'Password123' into Password field
    await loginPage.enterPassword('Password123');
    
    // expect: Password field accepts the input
    await expect(page.getByRole('textbox', { name: 'Password' })).toHaveValue('Password123');

    // 4. Click Submit button
    await loginPage.clickSubmit();
    
    // expect: Success page loads with 'Logged In Successfully' heading
    await successPage.verifyHeading();

    // 5. Verify Log out link is present
    // expect: Log out link is visible
    await successPage.verifyLogoutLinkVisible();
    
    // expect: Log out link has href 'https://practicetestautomation.com/practice-test-login/'
    const logoutHref = await successPage.logoutLink.getAttribute('href');
    expect(logoutHref).toBe('https://practicetestautomation.com/practice-test-login/');

    // 6. Click Log out link
    await successPage.clickLogout();
    
    // expect: User is navigated back to login page
    // expect: URL is 'https://practicetestautomation.com/practice-test-login/'
    await expect(page).toHaveURL('https://practicetestautomation.com/practice-test-login/');
    
    // expect: Login form is displayed and ready for new login attempt
    await loginPage.verifyPageLoaded();
  });
});
