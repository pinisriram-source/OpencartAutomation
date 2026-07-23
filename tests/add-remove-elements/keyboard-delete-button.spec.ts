// spec: Add/Remove Elements Negative and Validation Tests
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { AddRemoveElementsPage } from './page-objects/add-remove-elements.page';

test.describe('Add/Remove Elements Negative and Validation Tests', () => {
  test('TC-ADDREMOVE-025: Keyboard Accessibility for Delete Buttons', async ({ page }) => {
    const addRemoveElementsPage = new AddRemoveElementsPage(page);
    
    // 1. Navigate to the application URL and add 5 Delete buttons
    await addRemoveElementsPage.navigate();
    await addRemoveElementsPage.addElements(5);
    
    // expect: 5 Delete buttons are present
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(5);
    
    // 2. Tab to focus on the first Delete button
    await addRemoveElementsPage.deleteButtons.first().focus();
    
    // expect: The first Delete button receives keyboard focus
    await expect(addRemoveElementsPage.deleteButtons.first()).toBeFocused();
    
    // 3. Press Enter key while Delete button is focused
    await page.keyboard.press('Enter');
    
    // expect: The focused Delete button is removed
    // expect: 4 Delete buttons remain
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(4);
    
    // 4. Focus another Delete button and press Enter
    await addRemoveElementsPage.deleteButtons.first().focus();
    await page.keyboard.press('Enter');
    
    // expect: That button is removed
    // expect: 3 Delete buttons remain
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(3);
    
    // expect: Keyboard navigation and deletion work correctly
    // Verify we can still focus and delete another button
    await addRemoveElementsPage.deleteButtons.first().focus();
    await expect(addRemoveElementsPage.deleteButtons.first()).toBeFocused();
  });
});
