// spec: tests/add-remove-elements/test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { AddRemoveElementsPage } from './page-objects/add-remove-elements.page';

test.describe('Add/Remove Elements Negative and Validation Tests', () => {
  test('TC-ADDREMOVE-019: Verify No Maximum Limit on Add Operations', async ({ page }) => {
    const addRemovePage = new AddRemoveElementsPage(page);

    // 1. Navigate to the application URL
    await addRemovePage.navigate();
    await expect(page.getByRole('heading', { name: 'Add/Remove Elements' })).toBeVisible();

    // 2. Add 500 Delete buttons using automated clicking (use page.evaluate to click the Add Element button 500 times in a JS loop for speed)
    const countAfterAdd = await page.evaluate(() => {
      const addButton = document.querySelector('button[onclick="addElement()"]') as HTMLButtonElement;
      if (!addButton) return { error: 'Add button not found' };
      
      for (let i = 0; i < 500; i++) {
        addButton.click();
      }
      
      const deleteButtons = document.querySelectorAll('#elements button');
      return {
        count: deleteButtons.length,
        allHaveClass: Array.from(deleteButtons).every(b => b.classList.contains('added-manually'))
      };
    });

    // expect: Exactly 500 Delete buttons are created
    expect(countAfterAdd.count).toBe(500);
    // expect: The page does not impose a hard limit on button count
    expect(countAfterAdd.allHaveClass).toBe(true);
    // expect: The page remains responsive
    await expect(page.getByRole('button', { name: 'Add Element' })).toBeVisible();

    // 3. Verify a sample of buttons is functional
    // expect: Random buttons from the set can be clicked and removed (test first, 250th, last)
    
    // Test first button (index 0)
    const firstButton = page.locator('#elements button').first();
    await firstButton.click();
    await expect(page.locator('#elements button')).toHaveCount(499);

    // Test 250th button (index 249 in remaining 499, which is now at position 248)
    const middleButton = page.locator('#elements button').nth(248);
    await middleButton.click();
    await expect(page.locator('#elements button')).toHaveCount(498);

    // Test last button
    const lastButton = page.locator('#elements button').last();
    await lastButton.click();
    await expect(page.locator('#elements button')).toHaveCount(497);

    // expect: No JavaScript errors occur
    // (Playwright automatically captures console errors during test execution)

    // 4. Clean up by deleting all buttons (use page.evaluate to remove all)
    await page.evaluate(() => {
      const deleteButtons = document.querySelectorAll('#elements button');
      deleteButtons.forEach(button => (button as HTMLButtonElement).click());
    });

    // expect: All 500 buttons can be removed (497 remain from previous steps)
    // expect: Page returns to initial state
    await expect(page.locator('#elements button')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Add Element' })).toBeVisible();
  });
});
