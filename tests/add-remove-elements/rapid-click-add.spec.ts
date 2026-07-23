import { test, expect } from '@playwright/test';
import { AddRemoveElementsPage } from './page-objects/add-remove-elements.page';

test.describe('Add/Remove Elements Edge Cases and Boundary Conditions', () => {
  let addRemoveElementsPage: AddRemoveElementsPage;

  test.beforeEach(async ({ page }) => {
    addRemoveElementsPage = new AddRemoveElementsPage(page);
  });

  test('TC-ADDREMOVE-007: Rapid Clicking Add Element Button', async ({ page }) => {
    // 1. Navigate to the application URL
    await addRemoveElementsPage.navigate();

    // expect: Page loads successfully
    await expect(addRemoveElementsPage.addElementButton).toBeVisible();

    // 2. Rapidly click the 'Add Element' button 10 times in quick succession
    await page.evaluate(() => {
      const button = document.querySelector('button[onclick="addElement()"]') as HTMLButtonElement;
      for (let i = 0; i < 10; i++) {
        button.click();
      }
    });

    // expect: Exactly 10 Delete buttons are created
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(10);

    // expect: No buttons are lost or duplicated
    const count = await addRemoveElementsPage.getDeleteButtonCount();
    expect(count).toBe(10);

    // expect: All buttons are visible and functional
    for (let i = 0; i < 10; i++) {
      await expect(addRemoveElementsPage.deleteButtons.nth(i)).toBeVisible();
      await expect(addRemoveElementsPage.deleteButtons.nth(i)).toBeEnabled();
    }

    // 3. Verify DOM integrity
    // expect: Each Delete button has proper onclick handler
    const allHaveOnclick = await page.evaluate(() => {
      const buttons = document.querySelectorAll('#elements button.added-manually');
      return Array.from(buttons).every(btn => btn.getAttribute('onclick') === 'deleteElement()');
    });
    expect(allHaveOnclick).toBe(true);

    // expect: The button container structure is intact
    await expect(addRemoveElementsPage.elementsContainer).toBeVisible();
  });
});
