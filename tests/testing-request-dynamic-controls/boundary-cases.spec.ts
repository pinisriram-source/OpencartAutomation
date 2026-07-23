import { test, expect } from '@playwright/test';
import { DynamicControlsPage } from './page-objects/dynamic-controls.page';

test.describe('Dynamic Controls - Boundary and Edge Cases', () => {
  let dynamicControlsPage: DynamicControlsPage;

  test.beforeEach(async ({ page }) => {
    dynamicControlsPage = new DynamicControlsPage(page);
    await dynamicControlsPage.navigate();
  });

  test('TC-DYNCTRL-020-RapidClickingRemoveButton', async ({ page }) => {
    // 1. Navigate - expect: Checkbox visible with 'Remove' button
    await expect(page.locator('input[type="checkbox"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Remove' })).toBeVisible();

    // 2. Click 'Remove' button multiple times in rapid succession
    const removeButton = page.locator('button[onclick*="swapCheckbox"]');
    await removeButton.click();
    await removeButton.click();
    await removeButton.click();

    // 3. Wait for operation to complete - expect: Checkbox removed successfully, widget state consistent
    await page.getByText("It's gone!").first().waitFor({ state: 'visible' });
    await expect(page.getByText("It's gone!")).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add' })).toBeVisible();
  });

  test('TC-DYNCTRL-021-RapidClickingEnableButton', async ({ page }) => {
    // 1. Navigate - expect: Text input disabled with 'Enable' button
    await expect(page.locator('input[type="text"]')).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Enable' })).toBeVisible();

    // 2. Click 'Enable' button multiple times in rapid succession
    const enableButton = page.locator('button[onclick*="swapInput"]');
    await enableButton.click();
    await enableButton.click();
    await enableButton.click();

    // 3. Wait for operation to complete - expect: Text input enabled successfully, widget state consistent
    await page.getByText("It's enabled!").first().waitFor({ state: 'visible' });
    await expect(page.getByText("It's enabled!")).toBeVisible();
    await expect(page.locator('input[type="text"]')).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Disable' })).toBeVisible();
  });

  test('TC-DYNCTRL-022-CheckboxInteractionDuringRemoval', async ({ page }) => {
    // 1. Navigate - expect: Checkbox visible and unchecked
    await expect(page.locator('input[type="checkbox"]')).toBeVisible();
    await expect(page.locator('input[type="checkbox"]')).not.toBeChecked();

    // 2. Click 'Remove' button - expect: Loading spinner appears
    await page.getByRole('button', { name: 'Remove' }).click();

    // 3. Immediately attempt to click the checkbox while removal in progress
    try {
      await page.locator('input[type="checkbox"]').click({ timeout: 500, force: true });
    } catch (error) {
      // Expected - element may be detaching
    }

    // Verify: No errors occur, removal operation completes successfully
    await expect(dynamicControlsPage.checkboxMessage).toHaveText("It's gone!");
    await expect(dynamicControlsPage.checkbox).toHaveCount(0);
  });

  test('TC-DYNCTRL-023-TypeInTextInputDuringDisable', async ({ page }) => {
    // 1. Navigate and enable the text input (click Enable, wait for completion)
    await page.locator('button[onclick*="swapInput"]').click();
    await page.getByText("It's enabled!").first().waitFor({ state: 'visible' });
    await expect(page.locator('input[type="text"]')).toBeEnabled();

    // 2. Type some text in field - expect: Text appears
    await page.locator('input[type="text"]').fill('Initial text');
    await expect(page.locator('input[type="text"]')).toHaveValue('Initial text');

    // 3. Click 'Disable' button - expect: Loading spinner appears
    await page.locator('button[onclick*="swapInput"]').click();

    // 4. Immediately attempt to continue typing while disable in progress
    try {
      await page.locator('input[type="text"]').fill('Initial text more text', { timeout: 500 });
    } catch (error) {
      // Expected - element may be transitioning to disabled
    }

    // Verify: No errors occur, disable operation completes successfully, text input becomes disabled
    await page.getByText("It's disabled!").first().waitFor({ state: 'visible' });
    await expect(page.locator('input[type="text"]')).toBeDisabled();
  });

  test('TC-DYNCTRL-024-PageRefreshPreservesNoState', async ({ page }) => {
    // 1. Navigate - expect: Initial state loaded
    await expect(page.locator('input[type="checkbox"]')).toBeVisible();
    await expect(page.locator('input[type="text"]')).toBeDisabled();

    // 2. Check the checkbox - expect: Checkbox checked
    await page.locator('input[type="checkbox"]').click();
    await expect(page.locator('input[type="checkbox"]')).toBeChecked();

    // 3. Enable the text input and type 'Test'
    await page.locator('button[onclick*="swapInput"]').click();
    await page.getByText("It's enabled!").first().waitFor({ state: 'visible' });
    await page.locator('input[type="text"]').fill('Test');
    await expect(page.locator('input[type="text"]')).toHaveValue('Test');

    // 4. Refresh the page
    await page.reload();

    // 5. Verify: Page reloads to initial state
    await expect(page.locator('input[type="checkbox"]')).toBeVisible();
    await expect(page.locator('input[type="checkbox"]')).not.toBeChecked();
    await expect(page.locator('input[type="text"]')).toBeDisabled();
    await expect(page.locator('input[type="text"]')).toHaveValue('');
  });

  test('TC-DYNCTRL-025-VerifyNoJavaScriptErrors', async ({ page }) => {
    // 1. Set up console error listener before navigation
    const jsErrors: string[] = [];
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });

    // Re-navigate to start fresh with the listener active
    await page.goto('https://the-internet.herokuapp.com/dynamic_controls');

    // 2. Perform all widget operations: remove checkbox
    await page.locator('button[onclick*="swapCheckbox"]').click();
    await page.getByText("It's gone!").first().waitFor({ state: 'visible' });

    // 3. Add checkbox back
    await page.locator('button[onclick*="swapCheckbox"]').click();
    await page.getByText("It's back!").first().waitFor({ state: 'visible' });

    // 4. Check checkbox
    await page.locator('input[type="checkbox"]').click();
    await expect(page.locator('input[type="checkbox"]')).toBeChecked();

    // 5. Enable input
    await page.locator('button[onclick*="swapInput"]').click();
    await page.getByText("It's enabled!").first().waitFor({ state: 'visible' });

    // 6. Type in input
    await page.locator('input[type="text"]').fill('Test text');
    await expect(page.locator('input[type="text"]')).toHaveValue('Test text');

    // 7. Disable input
    await page.locator('button[onclick*="swapInput"]').click();
    await page.getByText("It's disabled!").first().waitFor({ state: 'visible' });

    // 8. Assert no JavaScript errors occurred
    expect(jsErrors).toHaveLength(0);
  });
});
