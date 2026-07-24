import { test, expect } from '@playwright/test';
import { KeyPressesPage } from './pages/key-presses.page';

test.describe('Modifier Keys and Function Keys', () => {
  let keyPressesPage: KeyPressesPage;

  test.beforeEach(async ({ page }) => {
    keyPressesPage = new KeyPressesPage(page);
    await keyPressesPage.goto();
  });

  test('TC-KEYPRESS-018 Shift modifier key detection displays SHIFT', async ({ page }) => {
    // Navigate to the Key Presses page
    // (Already navigated in beforeEach hook)

    // Click on the input field to focus it
    await keyPressesPage.focusInput();

    // Press the Shift key alone (not in combination)
    await keyPressesPage.pressKey('Shift');

    // Verify result message displays 'You entered: SHIFT'
    const resultMessage = await keyPressesPage.getResultMessage();
    expect(resultMessage).toBe('You entered: SHIFT');

    // Verify URL remains unchanged
    expect(page.url()).toBe('https://the-internet.herokuapp.com/key_presses');
  });

  test('TC-KEYPRESS-019 Control modifier key detection displays CONTROL', async ({ page }) => {
    // Navigate to the Key Presses page
    // (Already navigated in beforeEach hook)

    // Click on the input field to focus it
    await keyPressesPage.focusInput();

    // Press the Control key alone
    await keyPressesPage.pressKey('Control');

    // Verify result message displays 'You entered: CONTROL'
    const resultMessage = await keyPressesPage.getResultMessage();
    expect(resultMessage).toBe('You entered: CONTROL');

    // Verify URL remains unchanged
    expect(page.url()).toBe('https://the-internet.herokuapp.com/key_presses');
  });

  test('TC-KEYPRESS-020 Alt modifier key detection displays ALT', async ({ page }) => {
    // Navigate to the Key Presses page
    // (Already navigated in beforeEach hook)

    // Click on the input field to focus it
    await keyPressesPage.focusInput();

    // Press the Alt key alone
    await keyPressesPage.pressKey('Alt');

    // Verify result message displays 'You entered: ALT'
    const resultMessage = await keyPressesPage.getResultMessage();
    expect(resultMessage).toBe('You entered: ALT');

    // Verify URL remains unchanged
    expect(page.url()).toBe('https://the-internet.herokuapp.com/key_presses');
  });
});
