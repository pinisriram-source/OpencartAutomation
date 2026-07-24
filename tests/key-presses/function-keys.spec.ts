import { test, expect } from '@playwright/test';
import { KeyPressesPage } from './pages/key-presses.page';

test.describe('Modifier Keys and Function Keys', () => {
  let keyPressesPage: KeyPressesPage;

  test.beforeEach(async ({ page }) => {
    keyPressesPage = new KeyPressesPage(page);
    await keyPressesPage.navigate();
  });

  test('TC-KEYPRESS-021: Function key F1 detection displays F1', async ({ page }) => {
    // 1. Navigate to the Key Presses page
    // expect: Page loads successfully
    await expect(page).toHaveTitle('The Internet');
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');

    // 2. Click on the input field to focus it
    await keyPressesPage.clickInput();
    
    // expect: Input field receives focus
    await expect(keyPressesPage.inputField).toBeFocused();

    // 3. Press the F1 function key
    await keyPressesPage.pressKey('F1');

    // expect: Result message displays 'You entered: F1'
    const resultText = await keyPressesPage.getResultText();
    expect(resultText).toBe('You entered: F1');

    // expect: URL remains unchanged
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');
  });

  test('TC-KEYPRESS-022: Multiple function keys are detected correctly', async ({ page }) => {
    // 1. Navigate to the Key Presses page and focus the input
    await expect(page).toHaveTitle('The Internet');
    await keyPressesPage.clickInput();
    
    // expect: Input is focused
    await expect(keyPressesPage.inputField).toBeFocused();

    // 2. Press F1 through F12 keys sequentially
    const functionKeys = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'];

    for (const key of functionKeys) {
      await keyPressesPage.pressKey(key);

      // expect: Each function key displays 'You entered: F[1-12]' respectively
      const resultText = await keyPressesPage.getResultText();
      expect(resultText).toBe(`You entered: ${key}`);

      // expect: URL remains unchanged for each key press
      await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');

      // expect: No browser default actions are triggered (e.g., help menu, developer tools)
      // The page should remain stable and focused
      await expect(keyPressesPage.inputField).toBeFocused();
    }
  });
});
