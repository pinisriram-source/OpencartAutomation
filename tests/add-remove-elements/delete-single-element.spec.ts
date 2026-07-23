// spec: specs/add-remove-elements-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { AddRemoveElementsPage } from './page-objects/add-remove-elements.page';

test.describe('Add/Remove Elements Core Functionality', () => {
  test('TC-ADDREMOVE-004: Delete Single Element from Middle Position', async ({ page }) => {
    const addRemovePage = new AddRemoveElementsPage(page);

    // 1. Navigate to the application URL and add 5 Delete buttons
    await addRemovePage.navigate();
    await addRemovePage.addElements(5);
    
    // expect: 5 Delete buttons are present
    await expect(addRemovePage.deleteButtons).toHaveCount(5);

    // 2. Click the 3rd Delete button (middle position)
    await addRemovePage.deleteButtonAtIndex(2);

    // expect: Exactly 4 Delete buttons remain visible
    await expect(addRemovePage.deleteButtons).toHaveCount(4);

    // expect: The remaining buttons maintain their relative order
    const buttonCount = await addRemovePage.getDeleteButtonCount();
    expect(buttonCount).toBe(4);

    // 3. Verify other buttons remain functional
    // expect: The first Delete button is still clickable
    await expect(addRemovePage.deleteButtons.first()).toBeVisible();
    await expect(addRemovePage.deleteButtons.first()).toBeEnabled();

    // expect: The last Delete button is still clickable
    await expect(addRemovePage.deleteButtons.last()).toBeVisible();
    await expect(addRemovePage.deleteButtons.last()).toBeEnabled();

    // expect: The 'Add Element' button remains functional
    await expect(addRemovePage.addElementButton).toBeVisible();
    await expect(addRemovePage.addElementButton).toBeEnabled();
    
    // Verify Add Element button still works by adding one more button
    await addRemovePage.addElementButton.click();
    await expect(addRemovePage.deleteButtons).toHaveCount(5);

    // 4. Verify the page URL
    // expect: The URL remains unchanged
    expect(page.url()).toBe(addRemovePage.url);
  });
});
