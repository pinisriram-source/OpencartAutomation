import { test, expect } from '@playwright/test';
import { AddRemoveElementsPage } from './page-objects/add-remove-elements.page';

test.describe('Add/Remove Elements Negative and Validation Tests', () => {
  let addRemoveElementsPage: AddRemoveElementsPage;

  test.beforeEach(async ({ page }) => {
    addRemoveElementsPage = new AddRemoveElementsPage(page);
  });

  test('TC-ADDREMOVE-021: Page Refresh Resets State', async ({ page }) => {
    // 1. Navigate to the application URL and add 10 Delete buttons
    await addRemoveElementsPage.navigate();
    await addRemoveElementsPage.addElements(10);
    
    // expect: 10 Delete buttons are present
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(10);

    // 2. Refresh the page (use page.reload())
    await page.reload();
    
    // expect: The page reloads to its initial state
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/add_remove_elements/');
    await expect(addRemoveElementsPage.pageHeading).toBeVisible();
    
    // expect: All previously added Delete buttons are gone
    // expect: No Delete buttons are present
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(0);
    
    // expect: Only the 'Add Element' button remains
    await expect(addRemoveElementsPage.addElementButton).toBeVisible();
    await expect(addRemoveElementsPage.addElementButton).toBeEnabled();
    
    // expect: The Delete button container exists but is empty
    await expect(addRemoveElementsPage.elementsContainer).toBeVisible();
    await expect(addRemoveElementsPage.elementsContainer).toBeEmpty();

    // 3. Verify functionality after refresh
    // expect: 'Add Element' button functions correctly
    await addRemoveElementsPage.addElements(2);
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(2);
    
    // expect: New Delete buttons can be added and removed
    await expect(addRemoveElementsPage.deleteButtons.first()).toBeVisible();
    await expect(addRemoveElementsPage.deleteButtons.first()).toBeEnabled();
    
    // Remove one button to verify delete functionality
    await addRemoveElementsPage.deleteButtonAtIndex(0);
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(1);
  });
});
