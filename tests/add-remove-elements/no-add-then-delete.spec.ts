// spec: Add/Remove Elements Negative and Validation Tests
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { AddRemoveElementsPage } from './page-objects/add-remove-elements.page';

test.describe('Add/Remove Elements Negative and Validation Tests', () => {
  test('TC-ADDREMOVE-018: Add Zero Elements Then Delete', async ({ page }) => {
    const addRemoveElementsPage = new AddRemoveElementsPage(page);

    // 1. Navigate to the application URL
    await addRemoveElementsPage.navigate();
    
    // expect: No Delete buttons are present
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(0);

    // 2. Attempt to locate and click a Delete button using selector
    // expect: No Delete button is found
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(0);
    
    // expect: No action is performed
    // expect: No errors occur
    // (This is implicitly verified - no click is attempted on non-existent element)

    // 3. Verify page state remains stable
    // expect: 'Add Element' button is still functional
    await expect(addRemoveElementsPage.addElementButton).toBeVisible();

    // expect: Page is in initial state
    // expect: Add one element to confirm Add Element still works after no-op delete attempt
    await addRemoveElementsPage.addElementButton.click();
    
    // Verify one Delete button was successfully added
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(1);
  });
});
