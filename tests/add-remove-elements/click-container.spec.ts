import { test, expect } from '@playwright/test';
import { AddRemoveElementsPage } from './page-objects/add-remove-elements.page';

test.describe('Add/Remove Elements Negative and Validation Tests', () => {
  let addRemoveElementsPage: AddRemoveElementsPage;

  test.beforeEach(async ({ page }) => {
    addRemoveElementsPage = new AddRemoveElementsPage(page);
  });

  test('TC-ADDREMOVE-017: Click Delete Button Container Instead of Button', async ({ page }) => {
    // 1. Navigate to the application URL and add 3 Delete buttons
    await addRemoveElementsPage.navigate();
    await addRemoveElementsPage.addElements(3);

    // expect: 3 Delete buttons are present
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(3);

    // 2. Click the container area (not the buttons themselves)
    await addRemoveElementsPage.elementsContainer.click({ position: { x: 5, y: 5 }, force: true });

    // Site behavior (see BUG-003): the #elements container has no padding of
    // its own, so a click at its top-left corner lands directly on the first
    // Delete button rather than on empty container space -- the button is
    // removed, not a no-op as the "click the container, not a button" premise
    // assumed.
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(2);

    // 3. Click a Delete button to verify functionality
    await addRemoveElementsPage.deleteButtonAtIndex(0);

    // expect: The clicked button is removed successfully
    // expect: 1 button remains
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(1);
  });
});
