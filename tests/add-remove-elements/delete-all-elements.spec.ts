// spec: TC-ADDREMOVE-005: Delete All Elements Sequentially
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { AddRemoveElementsPage } from './page-objects/add-remove-elements.page';

test.describe('Add/Remove Elements Core Functionality', () => {
  let addRemoveElementsPage: AddRemoveElementsPage;

  test.beforeEach(async ({ page }) => {
    addRemoveElementsPage = new AddRemoveElementsPage(page);
    await addRemoveElementsPage.navigate();
  });

  test('TC-ADDREMOVE-005: Delete All Elements Sequentially', async ({ page }) => {
    // 1. Navigate to the application URL and add 5 Delete buttons
    await addRemoveElementsPage.addElements(5);
    
    // expect: 5 Delete buttons are present
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(5);

    // 2. Click each Delete button one by one until all are removed
    // expect: Each click removes exactly one Delete button
    // expect: The count decreases by 1 after each deletion: 5→4→3→2→1→0
    
    // Delete first button (5 → 4)
    await addRemoveElementsPage.deleteButtonAtIndex(0);
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(4);
    
    // Delete second button (4 → 3)
    await addRemoveElementsPage.deleteButtonAtIndex(0);
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(3);
    
    // Delete third button (3 → 2)
    await addRemoveElementsPage.deleteButtonAtIndex(0);
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(2);
    
    // Delete fourth button (2 → 1)
    await addRemoveElementsPage.deleteButtonAtIndex(0);
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(1);
    
    // Delete fifth button (1 → 0)
    await addRemoveElementsPage.deleteButtonAtIndex(0);
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(0);

    // 3. Verify final state after all deletions
    // expect: Zero Delete buttons are present
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(0);
    
    // expect: Only the 'Add Element' button remains visible
    await expect(addRemoveElementsPage.addElementButton).toBeVisible();
    
    // expect: The page has returned to its initial state
    await expect(addRemoveElementsPage.elementsContainer).toBeEmpty();

    // 4. Verify the 'Add Element' button still functions
    // expect: Clicking 'Add Element' successfully adds a new Delete button
    await addRemoveElementsPage.addElementButton.click();
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(1);

    // 5. Verify the page URL
    // expect: The URL remains unchanged throughout all operations
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/add_remove_elements/');
  });
});
