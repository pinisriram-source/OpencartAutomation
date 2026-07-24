import { test, expect } from '@playwright/test';
import { KeyPressesPage } from './pages/key-presses.page';

test.describe('Initial Page State and Basic Key Detection', () => {
  test('TC-KEYPRESS-001 Verify initial page state on load', async ({ page }) => {
    const keyPressesPage = new KeyPressesPage(page);

    // 1. Navigate to https://the-internet.herokuapp.com/key_presses
    await keyPressesPage.navigate();
    
    // Verify page loads successfully with title 'The Internet'
    await expect(page).toHaveTitle('The Internet');
    
    // Verify URL is exactly https://the-internet.herokuapp.com/key_presses (no query string)
    expect(page.url()).toBe('https://the-internet.herokuapp.com/key_presses');

    // 2. Locate the text input field
    // Verify input field is visible
    await expect(keyPressesPage.inputField).toBeVisible();
    
    // Verify input field is empty (contains no text)
    await expect(keyPressesPage.inputField).toHaveValue('');

    // 3. Locate the result message paragraph
    // Verify result paragraph element exists below the input
    await expect(keyPressesPage.resultParagraph).toBeAttached();
    
    // Verify result paragraph contains no text (no message displayed)
    const resultText = await keyPressesPage.getResultText();
    expect(resultText.trim()).toBe('');
  });
});
