import { test, expect } from '@playwright/test';
import { KeyPressesPage } from './pages/key-presses.page';

test.describe('URL Stability and Navigation Safety', () => {
  test('TC-KEYPRESS-026: URL remains stable for most key presses', async ({ page }) => {
    const keyPressesPage = new KeyPressesPage(page);

    // 1. Navigate to https://the-internet.herokuapp.com/key_presses
    await keyPressesPage.goto();
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');

    // 2. Press Escape key
    await page.keyboard.press('Escape');
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');

    // 3. Press Space key
    await page.keyboard.press('Space');
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');

    // 4. Press Tab key
    await page.keyboard.press('Tab');
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');

    // 5. Press any letter key (e.g., 'a')
    await page.keyboard.press('a');
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');

    // 6. Press any arrow key (e.g., ArrowUp)
    await page.keyboard.press('ArrowUp');
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');
  });

  test('TC-KEYPRESS-027: Enter key with focused input submits form and changes URL', async ({ page }) => {
    const keyPressesPage = new KeyPressesPage(page);

    // 1. Navigate to https://the-internet.herokuapp.com/key_presses
    await keyPressesPage.goto();
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');

    // 2. Click on the input field to focus it
    await keyPressesPage.focusInput();

    // 3. Press the Enter key
    await page.keyboard.press('Enter');

    // 4. Verify URL changes to https://the-internet.herokuapp.com/key_presses? (query string '?' is added)
    await page.waitForURL(/key_presses\?/);
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses?');

    // 5. Verify result message disappears (paragraph becomes empty)
    await expect(keyPressesPage.resultText).toBeEmpty();
  });

  test('TC-KEYPRESS-028: Enter key without focused input does not change URL', async ({ page }) => {
    const keyPressesPage = new KeyPressesPage(page);

    // 1. Navigate to https://the-internet.herokuapp.com/key_presses
    await keyPressesPage.goto();
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');

    // 2. Press the Enter key without clicking on the input
    await page.keyboard.press('Enter');

    // 3. Verify URL remains https://the-internet.herokuapp.com/key_presses without query string
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');

    // 4. Verify result message displays 'You entered: ENTER'
    await expect(keyPressesPage.resultText).toContainText('You entered: ENTER');
  });

  test('TC-KEYPRESS-029: Function keys do not trigger browser navigation', async ({ page }) => {
    const keyPressesPage = new KeyPressesPage(page);

    // 1. Navigate to the Key Presses page
    await keyPressesPage.goto();
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');

    // 2. Press F5 (typically refresh/reload)
    await page.keyboard.press('F5');
    await page.waitForLoadState();

    // 3. Verify page may refresh but returns to same URL
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');

    // 4. Press F11 (typically fullscreen)
    await page.keyboard.press('F11');

    // 5. Verify result message displays 'You entered: F11' if captured
    await expect(keyPressesPage.resultText).toContainText('You entered: F11');

    // 6. Verify URL remains unchanged
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');
  });
});
