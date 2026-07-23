import { test, expect } from '@playwright/test';
import { AddRemoveElementsPage } from './page-objects/add-remove-elements.page';

test.describe('Add/Remove Elements Core Functionality', () => {
  let addRemoveElementsPage: AddRemoveElementsPage;

  test.beforeEach(async ({ page }) => {
    addRemoveElementsPage = new AddRemoveElementsPage(page);
  });

  test('TC-ADDREMOVE-002: Add Single Element', async ({ page }) => {
    // 1. Navigate to the application URL
    await addRemoveElementsPage.navigate();

    // expect: Page loads with no Delete buttons present
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(0);

    // 2. Click the 'Add Element' button once
    await addRemoveElementsPage.addElementButton.click();

    // expect: Exactly one 'Delete' button appears on the page
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(1);

    // expect: The 'Delete' button is visible and clickable
    await expect(addRemoveElementsPage.deleteButtons.first()).toBeVisible();
    await expect(addRemoveElementsPage.deleteButtons.first()).toBeEnabled();

    // expect: The 'Add Element' button remains visible and clickable
    await expect(addRemoveElementsPage.addElementButton).toBeVisible();
    await expect(addRemoveElementsPage.addElementButton).toBeEnabled();

    // 3. Verify the page URL
    // expect: The URL remains 'https://the-internet.herokuapp.com/add_remove_elements/'
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/add_remove_elements/');
  });
});
