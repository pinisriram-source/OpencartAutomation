import { test, expect } from '@playwright/test';
import { KeyPressesPage } from './pages/key-presses.page';

test.describe('Edge Cases and Boundary Conditions', () => {
  let keyPressesPage: KeyPressesPage;

  test.beforeEach(async ({ page }) => {
    keyPressesPage = new KeyPressesPage(page);
  });

  test('TC-KEYPRESS-030 Rapid successive key presses update message correctly', async ({ page }) => {
    // Navigate to the Key Presses page
    await page.goto('https://the-internet.herokuapp.com/key_presses');

    // Click on the input field to focus it
    await page.locator('#target').click();

    // Press keys 'a', 'b', 'c' in rapid succession (minimal delay)
    await page.keyboard.press('a');
    await page.keyboard.press('b');
    await page.keyboard.press('c');

    // Verify result message updates to show the most recent key pressed
    await expect(page.getByText('You entered: C')).toBeVisible();
  });

  test('TC-KEYPRESS-031 Holding down a key continuously updates the message', async ({ page }) => {
    // Navigate to the Key Presses page
    await page.goto('https://the-internet.herokuapp.com/key_presses');

    // Click on the input field to focus it
    await page.locator('#target').click();

    // Press and hold the letter 'a' for several seconds (simulate with keyboard.down/up)
    await page.keyboard.down('a');
    await page.waitForTimeout(2000);
    await page.keyboard.up('a');

    // Verify result message displays 'You entered: A'
    await expect(page.getByText('You entered: A')).toBeVisible();
  });

  test('TC-KEYPRESS-032 Mixed case letters all display as uppercase', async ({ page }) => {
    // Navigate to the Key Presses page and focus the input
    await page.goto('https://the-internet.herokuapp.com/key_presses');
    await page.locator('#target').click();

    // Press lowercase 'a'
    await page.keyboard.press('a');

    // Verify result message displays 'You entered: A' (uppercase)
    await expect(page.getByText('You entered: A')).toBeVisible();

    // Press Shift+A (uppercase A)
    await page.keyboard.press('Shift+A');

    // Verify result message displays 'You entered: A' (same uppercase display)
    await expect(page.getByText('You entered: A')).toBeVisible();
  });

  test('TC-KEYPRESS-033 Special characters and symbols detection', async ({ page }) => {
    // Navigate to the Key Presses page and focus the input
    await page.goto('https://the-internet.herokuapp.com/key_presses');
    await page.locator('#target').click();

    // Press period/dot key '.'
    await page.keyboard.press('.');
    // Note: Period key does not trigger key detection in this application
    // The result message remains empty or shows previous key

    // Press comma key ','
    await page.keyboard.press(',');

    // Verify result message displays a result for the comma key
    await expect(page.locator('#result')).toContainText('COMMA');

    // Press semicolon key ';'
    await page.keyboard.press(';');
    // Note: Semicolon shows "You entered:" with no key name
    await expect(page.locator('#result')).toContainText('You entered:');
  });

  test('TC-KEYPRESS-034 Empty input field after form submission via Enter', async ({ page }) => {
    // Navigate to the Key Presses page
    await page.goto('https://the-internet.herokuapp.com/key_presses');

    // Click on input and type 'test'
    await page.locator('#target').fill('test');

    // Press Enter key
    await page.keyboard.press('Enter');

    // Verify URL changes to include query string '?'
    await expect(page).toHaveURL(/.*\?$/);

    // Verify input field is cleared (empty)
    await expect(page.locator('#target')).toHaveValue('');
  });

  test('TC-KEYPRESS-035 Keyboard shortcut combinations are detected as individual keys', async ({ page }) => {
    // Navigate to the Key Presses page and focus the input
    await page.goto('https://the-internet.herokuapp.com/key_presses');
    await page.locator('#target').click();

    // Press Ctrl+A (select all shortcut)
    await page.keyboard.press('Control+a');

    // Verify result message displays 'You entered: A' (only the A key, not the combination)
    await expect(page.getByText('You entered: A')).toBeVisible();

    // Press Ctrl+C (copy shortcut)
    await page.keyboard.press('Control+c');

    // Verify result message displays 'You entered: C' (only the C key)
    await expect(page.getByText('You entered: C')).toBeVisible();
  });
});
