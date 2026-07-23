// spec: tests/testing-request-dynamic-controls/test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { DynamicControlsPage } from './page-objects/dynamic-controls.page';

test.describe('Dynamic Controls - Text Input Widget Functionality', () => {
  let dynamicControlsPage: DynamicControlsPage;

  test.beforeEach(async ({ page }) => {
    dynamicControlsPage = new DynamicControlsPage(page);
    await dynamicControlsPage.navigate();
  });

  test('TC-DYNCTRL-008-EnableTextInputSuccessfully', async ({ page }) => {
    // 1. Navigate - expect: Text input visible and disabled, 'Enable' button visible
    await expect(dynamicControlsPage.textInput).toBeVisible();
    await expect(dynamicControlsPage.textInput).toBeDisabled();
    await expect(dynamicControlsPage.enableDisableButton).toHaveText('Enable');

    // 2. Click 'Enable' button - expect: Loading spinner appears, 'Wait for it...' displayed
    await dynamicControlsPage.clickEnableButton();
    await expect(dynamicControlsPage.inputLoadingIndicator).toBeVisible();

    // 3. Wait for async operation - expect: Spinner disappears, text input enabled, button changes to 'Disable', message "It's enabled!" appears
    await dynamicControlsPage.waitForInputEnabled();
    await expect(dynamicControlsPage.textInput).toBeEnabled();
    await expect(dynamicControlsPage.enableDisableButton).toHaveText('Disable');
    await expect(dynamicControlsPage.inputMessage).toHaveText("It's enabled!");

    // 4. Type text into enabled input - expect: Input accepts keyboard input, typed text appears in field
    await dynamicControlsPage.textInput.fill('Test input text');
    await expect(dynamicControlsPage.textInput).toHaveValue('Test input text');
  });

  test('TC-DYNCTRL-009-DisableTextInputSuccessfully', async ({ page }) => {
    // 1. Navigate - expect: Text input disabled
    await expect(dynamicControlsPage.textInput).toBeDisabled();

    // 2. Click 'Enable' wait for completion - expect: Text input enabled, 'Disable' button visible
    await dynamicControlsPage.enableInputAndWait();
    await expect(dynamicControlsPage.textInput).toBeEnabled();
    await expect(dynamicControlsPage.enableDisableButton).toHaveText('Disable');

    // 3. Type some text - expect: Text entered successfully
    await dynamicControlsPage.textInput.fill('Test content');
    await expect(dynamicControlsPage.textInput).toHaveValue('Test content');

    // 4. Click 'Disable' button - expect: Loading spinner appears, 'Wait for it...' displayed
    await dynamicControlsPage.clickDisableButton();
    await expect(dynamicControlsPage.inputLoadingIndicator).toBeVisible();

    // 5. Wait for async operation - expect: Spinner disappears, text input disabled again, button changes to 'Enable', message "It's disabled!" appears, previously entered text remains visible in disabled field
    await dynamicControlsPage.waitForInputDisabled();
    await expect(dynamicControlsPage.textInput).toBeDisabled();
    await expect(dynamicControlsPage.enableDisableButton).toHaveText('Enable');
    await expect(dynamicControlsPage.inputMessage).toHaveText("It's disabled!");
    await expect(dynamicControlsPage.textInput).toHaveValue('Test content');
  });

  test('TC-DYNCTRL-010-EnableDisableCycleMultipleTimes', async ({ page }) => {
    // 1. Navigate - expect: Text input disabled
    await expect(dynamicControlsPage.textInput).toBeDisabled();

    // 2. Click 'Enable' wait - expect: Input enabled, 'Disable' button
    await dynamicControlsPage.enableInputAndWait();
    await expect(dynamicControlsPage.textInput).toBeEnabled();
    await expect(dynamicControlsPage.enableDisableButton).toHaveText('Disable');

    // 3. Click 'Disable' wait - expect: Input disabled, 'Enable' button
    await dynamicControlsPage.disableInputAndWait();
    await expect(dynamicControlsPage.textInput).toBeDisabled();
    await expect(dynamicControlsPage.enableDisableButton).toHaveText('Enable');

    // 4. Click 'Enable' again wait - expect: Input enabled again, 'Disable' button
    await dynamicControlsPage.enableInputAndWait();
    await expect(dynamicControlsPage.textInput).toBeEnabled();
    await expect(dynamicControlsPage.enableDisableButton).toHaveText('Disable');

    // 5. Click 'Disable' again wait - expect: Input disabled again, 'Enable' button, widget still functional
    await dynamicControlsPage.disableInputAndWait();
    await expect(dynamicControlsPage.textInput).toBeDisabled();
    await expect(dynamicControlsPage.enableDisableButton).toHaveText('Enable');
  });

  test('TC-DYNCTRL-011-TextInputContentPersistsAcrossEnableDisable', async ({ page }) => {
    // 1. Navigate - expect: Text input disabled and empty
    await expect(dynamicControlsPage.textInput).toBeDisabled();
    await expect(dynamicControlsPage.textInput).toHaveValue('');

    // 2. Click 'Enable' wait - expect: Text input enabled
    await dynamicControlsPage.enableInputAndWait();
    await expect(dynamicControlsPage.textInput).toBeEnabled();

    // 3. Type 'Test content' into input - expect: Text 'Test content' displayed in field
    await dynamicControlsPage.textInput.fill('Test content');
    await expect(dynamicControlsPage.textInput).toHaveValue('Test content');

    // 4. Click 'Disable' wait - expect: Input disabled, text 'Test content' still visible
    await dynamicControlsPage.disableInputAndWait();
    await expect(dynamicControlsPage.textInput).toBeDisabled();
    await expect(dynamicControlsPage.textInput).toHaveValue('Test content');

    // 5. Click 'Enable' wait - expect: Input enabled, text 'Test content' still present and editable
    await dynamicControlsPage.enableInputAndWait();
    await expect(dynamicControlsPage.textInput).toBeEnabled();
    await expect(dynamicControlsPage.textInput).toHaveValue('Test content');
  });

  test('TC-DYNCTRL-012-CannotTypeWhenDisabled', async ({ page }) => {
    // 1. Navigate - expect: Text input disabled
    await expect(dynamicControlsPage.textInput).toBeDisabled();

    // 2. Attempt to click on disabled text input - expect: Input field does not gain focus
    await dynamicControlsPage.textInput.click({ force: true });

    // 3. Attempt to type text using keyboard - expect: No text entered into disabled field, field remains empty and disabled
    await dynamicControlsPage.page.keyboard.type('test text');
    await expect(dynamicControlsPage.textInput).toHaveValue('');
    await expect(dynamicControlsPage.textInput).toBeDisabled();
  });
});
