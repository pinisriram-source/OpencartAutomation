import { test, expect } from '@playwright/test';
import { DynamicControlsPage } from './page-objects/dynamic-controls.page';

test.describe('Dynamic Controls - Loading Indicators', () => {
  let dynamicControlsPage: DynamicControlsPage;

  test.beforeEach(async ({ page }) => {
    dynamicControlsPage = new DynamicControlsPage(page);
    await dynamicControlsPage.navigate();
  });

  test('TC-DYNCTRL-016-LoadingSpinnerAppearsOnCheckboxRemove', async ({ page }) => {
    // 1. Navigate - expect: No loading spinner visible
    await expect(dynamicControlsPage.checkboxLoadingIndicator).not.toBeVisible();

    // 2. Click 'Remove' button on checkbox widget - expect: Loading spinner appears immediately
    await dynamicControlsPage.removeAddButton.click();
    const loadingEl = page.locator('#checkbox-example #loading').last();
    await expect(loadingEl).toBeVisible();
    await expect(loadingEl).toContainText('Wait for it...');

    // 3. Wait for operation to complete - expect: Loading spinner disappears
    await dynamicControlsPage.waitForCheckboxRemoved();
    await expect(loadingEl).not.toBeVisible();
  });

  test('TC-DYNCTRL-017-LoadingSpinnerAppearsOnCheckboxAdd', async ({ page }) => {
    // 1. Navigate - expect: Checkbox visible
    await expect(dynamicControlsPage.checkbox).toBeVisible();

    // 2. Remove the checkbox and wait for completion - expect: Checkbox removed
    await dynamicControlsPage.removeCheckboxAndWait();
    await expect(dynamicControlsPage.checkboxMessage).toHaveText("It's gone!");

    // 3. Click the 'Add' button - expect: Loading spinner appears immediately
    await dynamicControlsPage.removeAddButton.click();
    const loadingEl = page.locator('#checkbox-example #loading').filter({ hasText: 'Wait for it...' });
    await expect(loadingEl.first()).toBeVisible();

    // 4. Wait for operation to complete - expect: Loading spinner disappears
    await dynamicControlsPage.waitForCheckboxAdded();
    await expect(dynamicControlsPage.checkboxMessage).toHaveText("It's back!");
  });

  test('TC-DYNCTRL-018-LoadingSpinnerAppearsOnTextInputEnable', async ({ page }) => {
    // 1. Navigate - expect: No loading spinner visible in text input section
    await expect(dynamicControlsPage.inputLoadingIndicator).not.toBeVisible();

    // 2. Click 'Enable' button on text input widget - expect: Loading spinner appears immediately
    await dynamicControlsPage.enableDisableButton.click();
    const loadingEl = page.locator('#input-example #loading').last();
    await expect(loadingEl).toBeVisible();
    await expect(loadingEl).toContainText('Wait for it...');

    // 3. Wait for operation to complete - expect: Loading spinner disappears
    await dynamicControlsPage.waitForInputEnabled();
    await expect(loadingEl).not.toBeVisible();
  });

  test('TC-DYNCTRL-019-LoadingSpinnerAppearsOnTextInputDisable', async ({ page }) => {
    // 1. Navigate - expect: Text input disabled
    await expect(dynamicControlsPage.textInput).toBeDisabled();

    // 2. Enable the text input and wait for completion - expect: Text input enabled
    await dynamicControlsPage.enableInputAndWait();
    await expect(dynamicControlsPage.textInput).toBeEnabled();

    // 3. Click 'Disable' button - expect: Loading spinner appears immediately
    await dynamicControlsPage.enableDisableButton.click();
    const loadingEl = page.locator('#input-example #loading').filter({ hasText: 'Wait for it...' });
    await expect(loadingEl.first()).toBeVisible();

    // 4. Wait for operation to complete - expect: Loading spinner disappears
    await dynamicControlsPage.waitForInputDisabled();
    await expect(dynamicControlsPage.inputMessage).toHaveText("It's disabled!");
  });
});
