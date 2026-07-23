import { test, expect } from '@playwright/test';
import { AddRemoveElementsPage } from './page-objects/add-remove-elements.page';

test.describe('Add/Remove Elements Edge Cases and Boundary Conditions', () => {
  let addRemoveElementsPage: AddRemoveElementsPage;

  test.beforeEach(async ({ page }) => {
    addRemoveElementsPage = new AddRemoveElementsPage(page);
  });

  test('TC-ADDREMOVE-011: Add After Delete Operations', async ({ page }) => {
    // 1. Navigate to the application URL and add 5 Delete buttons
    await addRemoveElementsPage.navigate();
    await addRemoveElementsPage.addElements(5);

    // expect: 5 Delete buttons are present
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(5);

    // 2. Delete 3 buttons (first 3)
    await addRemoveElementsPage.deleteButtonAtIndex(0);
    await addRemoveElementsPage.deleteButtonAtIndex(0);
    await addRemoveElementsPage.deleteButtonAtIndex(0);

    // expect: 2 Delete buttons remain
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(2);

    // 3. Click 'Add Element' button 4 times
    await addRemoveElementsPage.addElements(4);

    // expect: 4 new Delete buttons are added
    // expect: Total Delete button count is now 6 (2 + 4)
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(6);

    // expect: All 6 buttons are functional
    for (let i = 0; i < 6; i++) {
      await expect(addRemoveElementsPage.deleteButtons.nth(i)).toBeEnabled();
    }

    // 4. Delete 2 of the original buttons (first 2 remaining)
    await addRemoveElementsPage.deleteButtonAtIndex(0);
    await addRemoveElementsPage.deleteButtonAtIndex(0);

    // expect: 4 Delete buttons remain
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(4);

    // 5. Add 1 more button
    await addRemoveElementsPage.addElements(1);

    // expect: Total count is 5
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(5);

    // expect: 'Add Element' button continues to work correctly after mixed operations
    await expect(addRemoveElementsPage.addElementButton).toBeEnabled();
  });
});
