// spec: specs/add-remove-elements-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { AddRemoveElementsPage } from './page-objects/add-remove-elements.page';

test.describe('Add/Remove Elements Edge Cases and Boundary Conditions', () => {
  let addRemoveElementsPage: AddRemoveElementsPage;

  test.beforeEach(async ({ page }) => {
    addRemoveElementsPage = new AddRemoveElementsPage(page);
  });

  test('TC-ADDREMOVE-008: Rapid Clicking Delete Buttons', async ({ page }) => {
    // 1. Navigate to the application URL and add 10 Delete buttons
    await addRemoveElementsPage.navigate();
    await addRemoveElementsPage.addElements(10);
    
    // expect: 10 Delete buttons are present
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(10);
    const initialCount = await addRemoveElementsPage.getDeleteButtonCount();
    expect(initialCount).toBe(10);

    // 2. Rapidly click multiple Delete buttons in quick succession
    // expect: Each clicked button is removed immediately
    // expect: No race condition causes extra or missing deletions
    // expect: Remaining buttons stay functional
    // NOTE: Click 5 buttons rapidly using dispatchEvent for synchronous execution
    const deleteButtonsToClick = 5;
    for (let i = 0; i < deleteButtonsToClick; i++) {
      await addRemoveElementsPage.deleteButtonAtIndex(0);
    }

    // 3. Verify final count matches expected deletions
    // expect: Button count is accurate
    const expectedRemainingCount = 10 - deleteButtonsToClick;
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(expectedRemainingCount);
    
    const finalCount = await addRemoveElementsPage.getDeleteButtonCount();
    expect(finalCount).toBe(expectedRemainingCount);
    
    // expect: No orphaned or ghost buttons remain in the DOM
    await expect(addRemoveElementsPage.elementsContainer).toBeVisible();
    
    // Verify remaining buttons are still functional by deleting one more
    await addRemoveElementsPage.deleteButtonAtIndex(0);
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(expectedRemainingCount - 1);
  });
});
