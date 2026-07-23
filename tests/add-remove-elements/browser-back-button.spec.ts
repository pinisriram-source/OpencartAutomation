// spec: Add/Remove Elements Negative and Validation Tests
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { AddRemoveElementsPage } from './page-objects/add-remove-elements.page';

test.describe('Add/Remove Elements Negative and Validation Tests', () => {
  test('TC-ADDREMOVE-020: Browser Back Button Does Not Affect State', async ({ page }) => {
    const addRemoveElementsPage = new AddRemoveElementsPage(page);

    // 1. Navigate to the application URL and add 5 Delete buttons
    await addRemoveElementsPage.navigate();
    await addRemoveElementsPage.addElements(5);

    // expect: 5 Delete buttons are present
    const initialCount = await addRemoveElementsPage.getDeleteButtonCount();
    expect(initialCount).toBe(5);

    // 2. Navigate to a different page (e.g., https://the-internet.herokuapp.com/)
    await page.goto('https://the-internet.herokuapp.com/');

    // expect: Navigation is successful
    await expect(page.getByRole('heading', { name: 'Welcome to the-internet' })).toBeVisible();

    // 3. Click the browser back button to return to /add_remove_elements/
    await page.goBack();

    // expect: The page reloads to its initial state
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/add_remove_elements/');

    // expect: No Delete buttons are present (state is not persisted)
    const countAfterBack = await addRemoveElementsPage.getDeleteButtonCount();
    expect(countAfterBack).toBe(0);

    // expect: Only the 'Add Element' button is visible
    await expect(addRemoveElementsPage.addElementButton).toBeVisible();
    await expect(addRemoveElementsPage.pageHeading).toBeVisible();

    // 4. Verify functionality after back navigation
    // expect: 'Add Element' button works correctly
    await addRemoveElementsPage.addElements(1);
    const countAfterAdd = await addRemoveElementsPage.getDeleteButtonCount();
    expect(countAfterAdd).toBe(1);

    // expect: Delete buttons can be added and removed normally
    await addRemoveElementsPage.deleteButtonAtIndex(0);
    const countAfterDelete = await addRemoveElementsPage.getDeleteButtonCount();
    expect(countAfterDelete).toBe(0);
  });
});
