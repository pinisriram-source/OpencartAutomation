// spec: Key Presses - Initial Page State and Basic Key Detection
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { KeyPressesPage } from './pages/key-presses.page';

test.describe('Initial Page State and Basic Key Detection', () => {
  test('TC-KEYPRESS-004 Number key press displays the number', async ({ page }) => {
    const keyPressesPage = new KeyPressesPage(page);

    // 1. Navigate to the Key Presses page
    await keyPressesPage.goto();
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');

    // 2. Click on the input field to focus it
    await keyPressesPage.focusInput();
    await expect(keyPressesPage.inputField).toBeFocused();

    // 3. Press the number key '5'
    await page.keyboard.press('5');

    // expect: Input field contains '5'
    await expect(keyPressesPage.inputField).toHaveValue('5');

    // expect: Result message displays 'You entered: 5' (numbers are not uppercased)
    await expect(keyPressesPage.resultText).toHaveText('You entered: 5');

    // expect: URL remains unchanged
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');
  });

  test('TC-KEYPRESS-005 All number keys are detected correctly', async ({ page }) => {
    const keyPressesPage = new KeyPressesPage(page);

    // 1. Navigate to the Key Presses page and focus the input
    await keyPressesPage.goto();
    await keyPressesPage.focusInput();

    // expect: Input is focused
    await expect(keyPressesPage.inputField).toBeFocused();

    // 2. Press each number key from 0-9 sequentially
    for (let i = 0; i <= 9; i++) {
      const key = i.toString();
      await page.keyboard.press(key);

      // expect: Each key press displays 'You entered: [0-9]' respectively
      await expect(keyPressesPage.resultText).toHaveText(`You entered: ${key}`);
    }

    // expect: Result message updates to show only the most recent number pressed
    await expect(keyPressesPage.resultText).toHaveText('You entered: 9');
  });
});
