import { test, expect } from '@playwright/test';
import { AddRemoveElementsPage } from './page-objects/add-remove-elements.page';

test.describe('Add/Remove Elements Edge Cases and Boundary Conditions', () => {
  let addRemoveElementsPage: AddRemoveElementsPage;

  test.beforeEach(async ({ page }) => {
    addRemoveElementsPage = new AddRemoveElementsPage(page);
  });

  test('TC-ADDREMOVE-010: Delete in Non-Sequential Order', async ({ page }) => {
    // 1. Navigate to the application URL and add 10 Delete buttons
    await addRemoveElementsPage.navigate();
    await addRemoveElementsPage.addElements(10);

    // expect: 10 Delete buttons are present
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(10);

    // 2. Delete the 8th button (index 7)
    await addRemoveElementsPage.deleteButtonAtIndex(7);

    // expect: Only the 8th button is removed
    // expect: 9 buttons remain
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(9);

    // 3. Delete the 1st button (index 0)
    await addRemoveElementsPage.deleteButtonAtIndex(0);

    // expect: Only the 1st button is removed
    // expect: 8 buttons remain
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(8);

    // 4. Delete the last button
    await addRemoveElementsPage.deleteButtons.last().click();

    // expect: Only the last button is removed
    // expect: 7 buttons remain
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(7);

    // 5. Delete the 3rd button from the remaining set (index 2)
    await addRemoveElementsPage.deleteButtonAtIndex(2);

    // expect: Only that button is removed
    // expect: 6 buttons remain
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(6);

    // expect: All remaining buttons are still functional
    for (let i = 0; i < 6; i++) {
      await expect(addRemoveElementsPage.deleteButtons.nth(i)).toBeEnabled();
    }

    // 6. Verify button indices remain stable
    // expect: Each remaining button can still be independently clicked and removed
    await addRemoveElementsPage.deleteButtonAtIndex(0);
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(5);

    // expect: No index confusion or incorrect targeting occurs
    await addRemoveElementsPage.deleteButtons.last().click();
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(4);
  });
});
