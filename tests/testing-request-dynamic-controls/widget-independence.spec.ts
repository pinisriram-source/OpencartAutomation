import { test, expect } from '@playwright/test';
import { DynamicControlsPage } from './page-objects/dynamic-controls.page';

test.describe('Dynamic Controls - Widget Independence', () => {
  let dynamicControlsPage: DynamicControlsPage;

  test.beforeEach(async ({ page }) => {
    dynamicControlsPage = new DynamicControlsPage(page);
    await dynamicControlsPage.navigate();
  });

  test('TC-DYNCTRL-013-CheckboxWidgetDoesNotAffectTextInput', async ({ page }) => {
    // 1. Navigate - expect: Both widgets in initial state
    // Verified in beforeEach

    // 2. Verify initial state of text input - expect: Text input disabled, 'Enable' button shown
    await expect(dynamicControlsPage.textInput).toBeDisabled();
    await expect(dynamicControlsPage.enableDisableButton).toHaveText('Enable');

    // 3. Click 'Remove' on checkbox widget and wait for completion - expect: Checkbox removed
    await dynamicControlsPage.clickRemoveButton();
    await dynamicControlsPage.waitForCheckboxRemoved();

    // 4. Check text input widget state - expect: Text input still disabled, 'Enable' button still shown, unchanged
    await expect(dynamicControlsPage.textInput).toBeDisabled();
    await expect(dynamicControlsPage.enableDisableButton).toHaveText('Enable');

    // 5. Click 'Add' on checkbox widget and wait for completion - expect: Checkbox restored
    await dynamicControlsPage.clickAddButton();
    await dynamicControlsPage.waitForCheckboxAdded();

    // 6. Check text input widget state again - expect: Text input still disabled, 'Enable' button still shown, unchanged
    await expect(dynamicControlsPage.textInput).toBeDisabled();
    await expect(dynamicControlsPage.enableDisableButton).toHaveText('Enable');
  });

  test('TC-DYNCTRL-014-TextInputWidgetDoesNotAffectCheckbox', async ({ page }) => {
    // 1. Navigate - expect: Both widgets in initial state
    // Verified in beforeEach

    // 2. Check the checkbox - expect: Checkbox is checked
    await dynamicControlsPage.checkbox.check();
    await expect(dynamicControlsPage.checkbox).toBeChecked();

    // 3. Click 'Enable' on text input widget and wait - expect: Text input enabled
    await dynamicControlsPage.clickEnableButton();
    await dynamicControlsPage.waitForInputEnabled();

    // 4. Check checkbox widget state - expect: Checkbox still present and checked, 'Remove' button still shown, unchanged
    await expect(dynamicControlsPage.checkbox).toBeVisible();
    await expect(dynamicControlsPage.checkbox).toBeChecked();
    await expect(dynamicControlsPage.removeAddButton).toHaveText('Remove');

    // 5. Click 'Disable' on text input widget and wait - expect: Text input disabled
    await dynamicControlsPage.clickDisableButton();
    await dynamicControlsPage.waitForInputDisabled();

    // 6. Check checkbox widget state again - expect: Checkbox still present and checked, 'Remove' button still shown, unchanged
    await expect(dynamicControlsPage.checkbox).toBeVisible();
    await expect(dynamicControlsPage.checkbox).toBeChecked();
    await expect(dynamicControlsPage.removeAddButton).toHaveText('Remove');
  });

  test('TC-DYNCTRL-015-SimultaneousOperationsOnBothWidgets', async ({ page }) => {
    // 1. Navigate - expect: Both widgets in initial state
    // Verified in beforeEach

    // 2. Click 'Remove' on checkbox widget and immediately click 'Enable' on text input widget (do NOT await between the two clicks)
    //    - expect: Both loading spinners appear independently
    //    - expect: Both operations complete successfully
    await dynamicControlsPage.removeAddButton.click();
    await dynamicControlsPage.enableDisableButton.click();

    // Wait for both operations to complete
    await expect(dynamicControlsPage.checkbox).toHaveCount(0);
    await expect(dynamicControlsPage.textInput).toBeEnabled();

    // 3. Verify final state
    //    - expect: Checkbox removed with 'Add' button shown
    //    - expect: Text input enabled with 'Disable' button shown
    //    - expect: Both widgets operated independently and correctly
    await expect(dynamicControlsPage.removeAddButton).toHaveText('Add');
    await expect(dynamicControlsPage.enableDisableButton).toHaveText('Disable');
    await expect(dynamicControlsPage.checkboxMessage).toHaveText("It's gone!");
    await expect(dynamicControlsPage.inputMessage).toHaveText("It's enabled!");
  });
});
