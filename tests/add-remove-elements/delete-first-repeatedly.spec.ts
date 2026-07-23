import { test, expect } from '@playwright/test';
import { AddRemoveElementsPage } from './page-objects/add-remove-elements.page';

test.describe('Add/Remove Elements Edge Cases and Boundary Conditions', () => {
  let addRemoveElementsPage: AddRemoveElementsPage;

  test.beforeEach(async ({ page }) => {
    addRemoveElementsPage = new AddRemoveElementsPage(page);
  });

  test('TC-ADDREMOVE-012: Delete First Button Multiple Times', async ({ page }) => {
    // 1. Navigate to the application URL and add 10 Delete buttons
    await addRemoveElementsPage.navigate();
    await addRemoveElementsPage.addElements(10);

    // expect: 10 Delete buttons are present
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(10);

    // 2. Repeatedly click the first Delete button 5 times
    for (let expected = 9; expected >= 5; expected--) {
      // expect: Each click removes the current first button
      await addRemoveElementsPage.deleteButtonAtIndex(0);

      // expect: Button count decreases by 1
      await expect(addRemoveElementsPage.deleteButtons).toHaveCount(expected);
    }

    // expect: After 5 deletions, exactly 5 buttons remain
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(5);

    // 3. Verify remaining buttons
    // expect: The 5 remaining buttons are the original 6th through 10th buttons
    // expect: All remaining buttons are functional
    for (let i = 0; i < 5; i++) {
      await expect(addRemoveElementsPage.deleteButtons.nth(i)).toBeVisible();
      await expect(addRemoveElementsPage.deleteButtons.nth(i)).toBeEnabled();
    }
  });
});
