import { test, expect } from '@playwright/test';
import { DynamicControlsPage } from './page-objects/dynamic-controls.page';

test.describe('Dynamic Controls - Initial State', () => {
  let dynamicControlsPage: DynamicControlsPage;

  test.beforeEach(async ({ page }) => {
    dynamicControlsPage = new DynamicControlsPage(page);
    await dynamicControlsPage.navigate();
  });

  test('TC-DYNCTRL-001-VerifyCheckboxWidgetInitialState', async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/dynamic_controls
    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/dynamic_controls');
    
    // expect: Page title is 'The Internet'
    await expect(page).toHaveTitle('The Internet');
    
    // expect: Main heading 'Dynamic Controls' is visible
    await expect(dynamicControlsPage.pageHeading).toBeVisible();

    // 2. Locate the checkbox widget section under 'Remove/add' heading
    // expect: Section heading 'Remove/add' is visible
    await expect(dynamicControlsPage.checkboxSectionHeading).toBeVisible();
    
    // expect: A checkbox labeled 'A checkbox' is present and visible
    await expect(dynamicControlsPage.checkbox).toBeVisible();
    await expect(dynamicControlsPage.checkboxLabel).toContainText('A checkbox');
    
    // expect: The checkbox is not checked by default
    await expect(dynamicControlsPage.checkbox).not.toBeChecked();
    
    // expect: A button labeled 'Remove' is visible and enabled
    await expect(dynamicControlsPage.removeAddButton).toBeVisible();
    await expect(dynamicControlsPage.removeAddButton).toBeEnabled();
    await expect(dynamicControlsPage.removeAddButton).toHaveText('Remove');

    // 3. Verify no loading indicator is shown on initial load
    // expect: No loading spinner or 'Wait for it...' message is displayed in the checkbox widget section
    await expect(dynamicControlsPage.checkboxLoadingIndicator).not.toBeVisible();
  });

  test('TC-DYNCTRL-002-VerifyTextInputWidgetInitialState', async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/dynamic_controls
    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/dynamic_controls');

    // 2. Locate the text input widget section under 'Enable/disable' heading
    // expect: Section heading 'Enable/disable' is visible
    await expect(dynamicControlsPage.inputSectionHeading).toBeVisible();

    // expect: A text input field is present and visible
    await expect(dynamicControlsPage.textInput).toBeVisible();

    // expect: The text input field is disabled (not editable)
    await expect(dynamicControlsPage.textInput).toBeDisabled();

    // expect: A button labeled 'Enable' is visible and enabled
    await expect(dynamicControlsPage.enableDisableButton).toBeVisible();
    await expect(dynamicControlsPage.enableDisableButton).toBeEnabled();
    await expect(dynamicControlsPage.enableDisableButton).toHaveText('Enable');

    // 3. Verify no loading indicator is shown on initial load
    // expect: No loading spinner or 'Wait for it...' message is displayed in the text input widget section
    await expect(dynamicControlsPage.inputLoadingIndicator).not.toBeVisible();
  });
});
