import { test, expect } from '@playwright/test';
import { AddRemoveElementsPage } from './page-objects/add-remove-elements.page';

test.describe('Add/Remove Elements Core Functionality', () => {
  let addRemoveElementsPage: AddRemoveElementsPage;

  test.beforeEach(async ({ page }) => {
    addRemoveElementsPage = new AddRemoveElementsPage(page);
  });

  test('TC-ADDREMOVE-006: URL Stability During All Operations', async ({ page }) => {
    const expectedUrl = 'https://the-internet.herokuapp.com/add_remove_elements/';

    // 1. Navigate to the application URL
    await addRemoveElementsPage.navigate();

    // expect: Initial URL is correct
    await expect(page).toHaveURL(expectedUrl);

    // 2. Add 3 Delete buttons
    await addRemoveElementsPage.addElements(3);

    // expect: URL remains unchanged
    await expect(page).toHaveURL(expectedUrl);

    // 3. Delete 1 button
    await addRemoveElementsPage.deleteButtonAtIndex(0);

    // expect: URL remains unchanged
    await expect(page).toHaveURL(expectedUrl);

    // 4. Add 2 more buttons
    await addRemoveElementsPage.addElements(2);

    // expect: URL remains unchanged
    await expect(page).toHaveURL(expectedUrl);

    // 5. Delete all remaining buttons
    const count = await addRemoveElementsPage.getDeleteButtonCount();
    for (let i = 0; i < count; i++) {
      await addRemoveElementsPage.deleteButtons.first().click();
    }

    // expect: URL remains correct
    await expect(page).toHaveURL(expectedUrl);

    // expect: The pathname is exactly '/add_remove_elements/'
    const url = new URL(page.url());
    expect(url.pathname).toBe('/add_remove_elements/');

    // expect: No query parameters or hash fragments have been added
    expect(url.search).toBe('');
    expect(url.hash).toBe('');
  });
});
