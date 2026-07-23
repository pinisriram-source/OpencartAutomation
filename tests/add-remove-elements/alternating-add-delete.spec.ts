import { test, expect } from '@playwright/test';
import { AddRemoveElementsPage } from './page-objects/add-remove-elements.page';

test.describe('Add/Remove Elements Edge Cases and Boundary Conditions', () => {
  let addRemoveElementsPage: AddRemoveElementsPage;

  test.beforeEach(async ({ page }) => {
    addRemoveElementsPage = new AddRemoveElementsPage(page);
  });

  test('TC-ADDREMOVE-014: Alternating Add and Delete Operations', async ({ page }) => {
    // 1. Navigate to the application URL
    await addRemoveElementsPage.navigate();

    // expect: Page loads with 0 Delete buttons
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(0);

    // 2. Add 1 button, delete 1 button (repeat 5 times)
    for (let i = 0; i < 5; i++) {
      await addRemoveElementsPage.addElementButton.click();

      // expect: After each add, count is 1
      await expect(addRemoveElementsPage.deleteButtons).toHaveCount(1);

      await addRemoveElementsPage.deleteButtons.first().click();

      // expect: After each delete, count is 0
      await expect(addRemoveElementsPage.deleteButtons).toHaveCount(0);
    }

    // 3. Perform a final add operation
    await addRemoveElementsPage.addElementButton.click();

    // expect: Exactly 1 Delete button remains
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(1);

    // expect: The button is functional
    await expect(addRemoveElementsPage.deleteButtons.first()).toBeEnabled();

    // 4. Verify page state
    // expect: 'Add Element' button remains functional throughout
    await expect(addRemoveElementsPage.addElementButton).toBeEnabled();

    // expect: URL has never changed
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/add_remove_elements/');
  });
});
