import { test, expect } from '@playwright/test';
import { DynamicControlsPage } from './page-objects/dynamic-controls.page';

test.describe('Dynamic Controls - Checkbox Widget Functionality', () => {
  let dynamicControlsPage: DynamicControlsPage;

  test.beforeEach(async ({ page }) => {
    dynamicControlsPage = new DynamicControlsPage(page);
    await dynamicControlsPage.navigate();
  });

  test('TC-DYNCTRL-003-RemoveCheckboxSuccessfully', async () => {
    // 1. Navigate to the Dynamic Controls page - expect: Checkbox visible with 'Remove' button
    await expect(dynamicControlsPage.checkbox).toBeVisible();
    await expect(dynamicControlsPage.removeAddButton).toHaveText('Remove');

    // 2. Click the 'Remove' button - expect: Loading spinner appears
    await dynamicControlsPage.removeAddButton.click();
    await expect(dynamicControlsPage.checkboxLoadingIndicator).toBeVisible();

    // 3. Wait for async operation to complete
    await dynamicControlsPage.waitForCheckboxRemoved();

    // expect: Checkbox removed from DOM, button changes to 'Add', message "It's gone!" appears
    await expect(dynamicControlsPage.checkbox).toHaveCount(0);
    await expect(dynamicControlsPage.removeAddButton).toHaveText('Add');
    await expect(dynamicControlsPage.checkboxMessage).toHaveText("It's gone!");

    // 4. Verify checkbox is no longer in DOM
    await expect(dynamicControlsPage.checkbox).toHaveCount(0);
  });

  test('TC-DYNCTRL-004-AddCheckboxBackSuccessfully', async () => {
    // 1. Navigate to page (done in beforeEach)

    // 2. Click 'Remove' and wait for completion - expect: Checkbox removed, 'Add' button visible
    await dynamicControlsPage.removeCheckboxAndWait();
    await expect(dynamicControlsPage.checkbox).toHaveCount(0);
    await expect(dynamicControlsPage.removeAddButton).toHaveText('Add');

    // 3. Click the 'Add' button
    await dynamicControlsPage.removeAddButton.click();

    // 4. Wait for async operation - expect: Checkbox restored, button changes to 'Remove', message "It's back!" appears
    await dynamicControlsPage.waitForCheckboxAdded();
    await expect(dynamicControlsPage.checkbox).toBeVisible();
    await expect(dynamicControlsPage.removeAddButton).toHaveText('Remove');
    await expect(dynamicControlsPage.checkboxMessage).toHaveText("It's back!");

    // 5. Verify checkbox state - expect: Checkbox visible and unchecked, clickable
    await expect(dynamicControlsPage.checkbox).toBeVisible();
    await expect(dynamicControlsPage.checkbox).not.toBeChecked();
  });

  test('TC-DYNCTRL-005-CheckboxTogglingWhenPresent', async () => {
    // 1. Navigate - expect: Checkbox visible and unchecked
    await expect(dynamicControlsPage.checkbox).toBeVisible();
    await expect(dynamicControlsPage.checkbox).not.toBeChecked();

    // 2. Click checkbox to check it - expect: Checkbox becomes checked immediately, no spinner, button remains 'Remove'
    await dynamicControlsPage.checkbox.check();
    await expect(dynamicControlsPage.checkbox).toBeChecked();
    await expect(dynamicControlsPage.checkboxLoadingIndicator).not.toBeVisible();
    await expect(dynamicControlsPage.removeAddButton).toHaveText('Remove');

    // 3. Click checkbox to uncheck - expect: Checkbox unchecked, no spinner, button remains 'Remove'
    await dynamicControlsPage.checkbox.uncheck();
    await expect(dynamicControlsPage.checkbox).not.toBeChecked();
    await expect(dynamicControlsPage.checkboxLoadingIndicator).not.toBeVisible();
    await expect(dynamicControlsPage.removeAddButton).toHaveText('Remove');
  });

  test('TC-DYNCTRL-006-RemoveAddCycleMultipleTimes', async () => {
    // 1. Navigate - expect: Checkbox visible
    await expect(dynamicControlsPage.checkbox).toBeVisible();

    // 2. Click 'Remove' wait for completion - expect: Checkbox removed, 'Add' button shown
    await dynamicControlsPage.removeCheckboxAndWait();
    await expect(dynamicControlsPage.checkbox).toHaveCount(0);
    await expect(dynamicControlsPage.removeAddButton).toHaveText('Add');

    // 3. Click 'Add' wait for completion - expect: Checkbox restored, 'Remove' button shown
    await dynamicControlsPage.addCheckboxAndWait();
    await expect(dynamicControlsPage.checkbox).toBeVisible();
    await expect(dynamicControlsPage.removeAddButton).toHaveText('Remove');

    // 4. Click 'Remove' again wait - expect: Checkbox removed, 'Add' shown
    await dynamicControlsPage.removeCheckboxAndWait();
    await expect(dynamicControlsPage.checkbox).toHaveCount(0);
    await expect(dynamicControlsPage.removeAddButton).toHaveText('Add');

    // 5. Click 'Add' again wait - expect: Checkbox restored, 'Remove' shown, widget still functional
    await dynamicControlsPage.addCheckboxAndWait();
    await expect(dynamicControlsPage.checkbox).toBeVisible();
    await expect(dynamicControlsPage.removeAddButton).toHaveText('Remove');
  });

  test('TC-DYNCTRL-007-CheckboxStatePersistsAfterRemoveAdd', async () => {
    // 1. Navigate - expect: Checkbox unchecked
    await expect(dynamicControlsPage.checkbox).toBeVisible();
    await expect(dynamicControlsPage.checkbox).not.toBeChecked();

    // 2. Check the checkbox - expect: Checkbox checked
    await dynamicControlsPage.checkbox.check();
    await expect(dynamicControlsPage.checkbox).toBeChecked();

    // 3. Click 'Remove' wait - expect: Checkbox removed from DOM
    await dynamicControlsPage.removeCheckboxAndWait();
    await expect(dynamicControlsPage.checkbox).toHaveCount(0);

    // 4. Click 'Add' wait - expect: Checkbox restored, in default unchecked state (state does not persist)
    await dynamicControlsPage.addCheckboxAndWait();
    await expect(dynamicControlsPage.checkbox).toBeVisible();
    await expect(dynamicControlsPage.checkbox).not.toBeChecked();
  });
});
