import { test, expect } from '@playwright/test';
import { SuccessPage } from './page-objects/success.page';

test.describe('Login Page - Direct Success Page Access', () => {
  let successPage: SuccessPage;

  test.beforeEach(async ({ page }) => {
    successPage = new SuccessPage(page);
  });

  test('TC-LOGIN-015: Direct navigation to success page without login', { tag: '@functional' }, async ({ page }) => {
    // Attempt to navigate directly to success page
    await successPage.navigate();

    // Verify the URL (application behavior may vary - this documents actual behavior)
    await expect(page).toHaveURL(/.*logged-in-successfully.*/);

    // Note: This test documents that the success page is accessible without authentication.
    // In a production application, this would typically redirect to login.
    // The test verifies current behavior for regression detection.
  });
});
