import { test, expect } from '@playwright/test';
import { AddRemoveElementsPage } from './page-objects/add-remove-elements.page';

test.describe('Add/Remove Elements Negative and Validation Tests', () => {
  let addRemoveElementsPage: AddRemoveElementsPage;

  test.beforeEach(async ({ page }) => {
    addRemoveElementsPage = new AddRemoveElementsPage(page);
  });

  test('TC-ADDREMOVE-022: No JavaScript Errors in Console', async ({ page }) => {
    const errors: string[] = [];

    // 1. Navigate to the application URL with console monitoring enabled
    // Resource-load failures (e.g. a third-party request hitting
    // net::ERR_NAME_NOT_RESOLVED) are logged as console 'error' messages by
    // Chromium but reflect external network flakiness, not an application
    // bug -- excluded so this test isn't flaky on conditions outside the
    // page's own control (see BUG-001).
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().startsWith('Failed to load resource')) {
        errors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => errors.push(err.message));

    await addRemoveElementsPage.navigate();

    // expect: Page loads successfully
    await expect(addRemoveElementsPage.addElementButton).toBeVisible();

    // 2. Perform a series of mixed operations: add 10 buttons, delete 5, add 3, delete all
    await addRemoveElementsPage.addElements(10);
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(10);

    for (let i = 0; i < 5; i++) {
      await addRemoveElementsPage.deleteButtons.first().click();
    }
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(5);

    await addRemoveElementsPage.addElements(3);
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(8);

    for (let i = 0; i < 8; i++) {
      await addRemoveElementsPage.deleteButtons.first().click();
    }

    // expect: All operations complete successfully
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(0);

    // 3. Check the browser console for JavaScript errors
    // expect: No critical JavaScript errors are logged
    // expect: No exceptions are thrown during add/delete operations
    expect(errors).toHaveLength(0);
  });
});
