// spec: Add/Remove Elements Negative and Validation Tests
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { AddRemoveElementsPage } from './page-objects/add-remove-elements.page';

test.describe('Add/Remove Elements Negative and Validation Tests', () => {
  test('TC-ADDREMOVE-024: Keyboard Accessibility for Add Element Button', async ({ page }) => {
    const addRemoveElementsPage = new AddRemoveElementsPage(page);

    // 1. Navigate to the application URL
    await addRemoveElementsPage.navigate();
    await expect(addRemoveElementsPage.pageHeading).toBeVisible();

    // 2. Tab to focus on the 'Add Element' button
    await page.keyboard.press('Tab');
    
    // Verify the 'Add Element' button receives keyboard focus
    const focusedElement = await page.evaluate(() => {
      const activeElement = document.activeElement;
      return {
        tagName: activeElement?.tagName,
        textContent: activeElement?.textContent?.trim(),
        isAddElementButton: activeElement?.textContent?.trim() === 'Add Element'
      };
    });
    expect(focusedElement.tagName).toBe('BUTTON');
    expect(focusedElement.textContent).toBe('Add Element');
    expect(focusedElement.isAddElementButton).toBe(true);

    // 3. Press Enter key while 'Add Element' is focused
    const initialCount = await addRemoveElementsPage.getDeleteButtonCount();
    await page.keyboard.press('Enter');
    
    // Verify a Delete button is added
    await expect(addRemoveElementsPage.deleteButtons.first()).toBeVisible();
    const countAfterFirstPress = await addRemoveElementsPage.getDeleteButtonCount();
    expect(countAfterFirstPress).toBe(initialCount + 1);

    // 4. Repeat key press 2 more times (press Enter twice more)
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    
    // Verify total of 3 Delete buttons are added via keyboard
    const finalCount = await addRemoveElementsPage.getDeleteButtonCount();
    expect(finalCount).toBe(initialCount + 3);
  });
});
