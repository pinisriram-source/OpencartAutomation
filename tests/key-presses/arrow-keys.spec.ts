import { test, expect } from '@playwright/test';
import { KeyPressesPage } from './pages/key-presses.page';

test.describe('Special Keys and Navigation Keys', () => {
  let keyPressesPage: KeyPressesPage;

  test.beforeEach(async ({ page }) => {
    keyPressesPage = new KeyPressesPage(page);
  });

  test('TC-KEYPRESS-012: Arrow keys detection - Up arrow displays UP', async ({ page }) => {
    // 1. Navigate to the Key Presses page
    await keyPressesPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveTitle('The Internet');
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');

    // 2. Click on the input field to focus it
    await keyPressesPage.clickInput();

    // expect: Input field receives focus
    await expect(keyPressesPage.inputField).toBeFocused();

    // 3. Press the ArrowUp key
    await keyPressesPage.pressKey('ArrowUp');

    // expect: Result message displays 'You entered: UP'
    const resultText = await keyPressesPage.getResultText();
    expect(resultText).toBe('You entered: UP');

    // expect: URL remains unchanged
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');
  });

  test('TC-KEYPRESS-013: All arrow keys are detected correctly', async ({ page }) => {
    // 1. Navigate to the Key Presses page and focus the input
    await keyPressesPage.navigate();
    await keyPressesPage.clickInput();

    // expect: Input is focused
    await expect(keyPressesPage.inputField).toBeFocused();

    // 2. Press ArrowUp key
    await keyPressesPage.pressKey('ArrowUp');

    // expect: Result message displays 'You entered: UP'
    let resultText = await keyPressesPage.getResultText();
    expect(resultText).toBe('You entered: UP');

    // 3. Press ArrowDown key
    await keyPressesPage.pressKey('ArrowDown');

    // expect: Result message displays 'You entered: DOWN'
    resultText = await keyPressesPage.getResultText();
    expect(resultText).toBe('You entered: DOWN');

    // 4. Press ArrowLeft key
    await keyPressesPage.pressKey('ArrowLeft');

    // expect: Result message displays 'You entered: LEFT'
    resultText = await keyPressesPage.getResultText();
    expect(resultText).toBe('You entered: LEFT');

    // 5. Press ArrowRight key
    await keyPressesPage.pressKey('ArrowRight');

    // expect: Result message displays 'You entered: RIGHT'
    resultText = await keyPressesPage.getResultText();
    expect(resultText).toBe('You entered: RIGHT');
  });
});
