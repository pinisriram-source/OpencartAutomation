import { test, expect } from '@playwright/test';
import { AddRemoveElementsPage } from './page-objects/add-remove-elements.page';

test.describe('Add/Remove Elements Core Functionality', () => {
  let addRemoveElementsPage: AddRemoveElementsPage;

  test.beforeEach(async ({ page }) => {
    addRemoveElementsPage = new AddRemoveElementsPage(page);
  });

  test('TC-ADDREMOVE-001: Initial Page Load State', async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/add_remove_elements/
    await addRemoveElementsPage.navigate();
    
    // expect: Page loads successfully
    // expect: Page title is 'The Internet'
    await expect(page).toHaveTitle('The Internet');
    
    // expect: Page URL is exactly 'https://the-internet.herokuapp.com/add_remove_elements/'
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/add_remove_elements/');

    // 2. Verify the presence of the 'Add Element' button
    // expect: The 'Add Element' button is visible
    await expect(addRemoveElementsPage.addElementButton).toBeVisible();
    
    // expect: The 'Add Element' button is enabled and clickable
    await expect(addRemoveElementsPage.addElementButton).toBeEnabled();

    // 3. Verify the absence of any 'Delete' buttons
    // expect: No 'Delete' buttons are present on the page
    await expect(addRemoveElementsPage.deleteButtons).toHaveCount(0);
    
    // expect: The Delete button container exists but is empty
    await expect(addRemoveElementsPage.elementsContainer).toBeVisible();
    await expect(addRemoveElementsPage.elementsContainer).toBeEmpty();

    // 4. Verify the page heading
    // expect: The heading 'Add/Remove Elements' is visible
    await expect(addRemoveElementsPage.pageHeading).toBeVisible();
  });
});
