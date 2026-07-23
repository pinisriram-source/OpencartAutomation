import { test, expect } from '@playwright/test';
import { AddRemoveElementsPage } from './page-objects/add-remove-elements.page';

test.describe('Add/Remove Elements Edge Cases and Boundary Conditions', () => {
  let addRemoveElementsPage: AddRemoveElementsPage;

  test.beforeEach(async ({ page }) => {
    addRemoveElementsPage = new AddRemoveElementsPage(page);
  });

  test('TC-ADDREMOVE-009: Add Large Number of Elements', async ({ page }) => {
    // 1. Navigate to the application URL
    await addRemoveElementsPage.navigate();

    // expect: Page loads successfully
    await expect(addRemoveElementsPage.addElementButton).toBeVisible();

    // 2. Add 100 Delete buttons using JavaScript click loop
    await page.evaluate(() => {
      const button = document.querySelector('button[onclick="addElement()"]') as HTMLButtonElement;
      for (let i = 0; i < 100; i++) {
        button.click();
      }
    });

    // expect: Exactly 100 Delete buttons are created
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(100);

    // expect: The page does not crash or become unresponsive
    await expect(addRemoveElementsPage.addElementButton).toBeVisible();

    // 3. Verify a sample of buttons remains clickable
    // expect: The first Delete button is clickable
    await expect(addRemoveElementsPage.deleteButtons.first()).toBeEnabled();

    // expect: A middle Delete button (50th) is clickable
    await expect(addRemoveElementsPage.deleteButtons.nth(49)).toBeEnabled();

    // expect: The last Delete button is clickable
    await expect(addRemoveElementsPage.deleteButtons.last()).toBeEnabled();

    // 4. Delete all 100 buttons
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('#elements button.added-manually');
      buttons.forEach(btn => (btn as HTMLButtonElement).click());
    });

    // expect: All buttons can be successfully removed
    // expect: The page returns to initial state with zero Delete buttons
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(0);
  });
});
