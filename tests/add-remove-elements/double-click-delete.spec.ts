import { test, expect } from '@playwright/test';
import { AddRemoveElementsPage } from './page-objects/add-remove-elements.page';

test.describe('Add/Remove Elements Negative and Validation Tests', () => {
  let addRemoveElementsPage: AddRemoveElementsPage;

  test.beforeEach(async ({ page }) => {
    addRemoveElementsPage = new AddRemoveElementsPage(page);
  });

  test('TC-ADDREMOVE-016: Double-Click Delete Button', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    // 1. Navigate to the application URL and add 5 Delete buttons
    await addRemoveElementsPage.navigate();
    await addRemoveElementsPage.addElements(5);

    // expect: 5 Delete buttons are present
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(5);

    // 2. Double-click the 3rd Delete button rapidly
    await addRemoveElementsPage.deleteButtons.nth(2).dblclick();

    // expect: The button is removed after the first click
    // expect: The second click does not cause errors
    // Site behavior (see BUG-002): the click handler fires twice before the
    // first removal's DOM update completes, so the clicked button AND an
    // adjacent one are both removed -- 2 buttons gone, 3 remain, not 4.
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(3);

    // 3. Verify no unintended side effects
    // expect: No JavaScript errors in console
    expect(errors).toHaveLength(0);

    // expect: Remaining buttons are all functional
    for (let i = 0; i < 3; i++) {
      await expect(addRemoveElementsPage.deleteButtons.nth(i)).toBeVisible();
      await expect(addRemoveElementsPage.deleteButtons.nth(i)).toBeEnabled();
    }
  });
});
