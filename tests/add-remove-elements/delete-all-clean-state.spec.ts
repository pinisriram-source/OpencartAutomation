import { test, expect } from '@playwright/test';
import { AddRemoveElementsPage } from './page-objects/add-remove-elements.page';

test.describe('Add/Remove Elements Edge Cases and Boundary Conditions', () => {
  let addRemoveElementsPage: AddRemoveElementsPage;

  test.beforeEach(async ({ page }) => {
    addRemoveElementsPage = new AddRemoveElementsPage(page);
  });

  test('TC-ADDREMOVE-015: Delete All Then Verify Clean State', async ({ page }) => {
    // 1. Navigate to the application URL and add 20 Delete buttons
    await addRemoveElementsPage.navigate();
    await addRemoveElementsPage.addElements(20);
    
    // expect: 20 Delete buttons are present
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(20);

    // 2. Delete all 20 buttons using any deletion pattern
    // Delete from the end (index 19) down to index 0
    for (let i = 19; i >= 0; i--) {
      await addRemoveElementsPage.deleteButtonAtIndex(i);
    }
    
    // expect: All buttons are successfully removed
    // expect: Button count reaches 0
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(0);

    // 3. Verify the page has returned to initial state
    // expect: No Delete buttons are visible in the UI
    await expect(addRemoveElementsPage.deleteButtons).not.toBeVisible();
    
    // expect: No Delete button elements exist in the DOM
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(0);
    
    // expect: The Delete button container is empty
    // Not asserting toBeVisible() here: the #elements container has zero
    // rendered height when empty, so Playwright correctly reports it as
    // not visible even though it's present in the DOM (see BUG-001).
    await expect(addRemoveElementsPage.elementsContainer).toBeAttached();
    await expect(addRemoveElementsPage.elementsContainer).toBeEmpty();
    
    // expect: Only the 'Add Element' button is present
    await expect(addRemoveElementsPage.addElementButton).toBeVisible();
    await expect(addRemoveElementsPage.addElementButton).toBeEnabled();

    // 4. Add a new Delete button
    await addRemoveElementsPage.addElements(1);
    
    // expect: The new button appears correctly
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(1);
    await expect(addRemoveElementsPage.deleteButtons).toBeVisible();
    
    // expect: 'Add Element' functionality is fully restored
    await expect(addRemoveElementsPage.addElementButton).toBeVisible();
    await expect(addRemoveElementsPage.addElementButton).toBeEnabled();
  });
});
