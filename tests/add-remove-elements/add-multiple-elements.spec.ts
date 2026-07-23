import { test, expect } from '@playwright/test';
import { AddRemoveElementsPage } from './page-objects/add-remove-elements.page';

test.describe('Add/Remove Elements Core Functionality', () => {
  let addRemoveElementsPage: AddRemoveElementsPage;

  test.beforeEach(async ({ page }) => {
    addRemoveElementsPage = new AddRemoveElementsPage(page);
  });

  test('TC-ADDREMOVE-003: Add Multiple Elements Sequentially', async ({ page }) => {
    // 1. Navigate to the application URL
    await addRemoveElementsPage.navigate();
    
    // expect: Page loads with no Delete buttons present
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(0);

    // 2. Click the 'Add Element' button 5 times
    await addRemoveElementsPage.addElements(5);
    
    // expect: Exactly 5 'Delete' buttons appear on the page
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(5);
    
    // expect: All 5 'Delete' buttons are visible and clickable
    const deleteCount = await addRemoveElementsPage.getDeleteButtonCount();
    expect(deleteCount).toBe(5);
    
    for (let i = 0; i < 5; i++) {
      await expect(addRemoveElementsPage.deleteButtons.nth(i)).toBeVisible();
      await expect(addRemoveElementsPage.deleteButtons.nth(i)).toBeEnabled();
    }
    
    // expect: The 'Add Element' button remains functional after each click
    await expect(addRemoveElementsPage.addElementButton).toBeVisible();
    await expect(addRemoveElementsPage.addElementButton).toBeEnabled();

    // 3. Count the number of Delete buttons
    const finalCount = await addRemoveElementsPage.getDeleteButtonCount();
    
    // expect: The count equals exactly 5
    expect(finalCount).toBe(5);
    
    // expect: Each button is independently clickable
    for (let i = 0; i < 5; i++) {
      await expect(addRemoveElementsPage.deleteButtons.nth(i)).toBeEnabled();
    }

    // 4. Verify the page state
    // expect: The URL remains unchanged
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/add_remove_elements/');
    
    // expect: The page has not reloaded (verify by checking the buttons still exist)
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(5);
  });
});
