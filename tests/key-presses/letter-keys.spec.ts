import { test, expect } from '@playwright/test';
import { KeyPressesPage } from './pages/key-presses.page';

test.describe('Initial Page State and Basic Key Detection', () => {
  test('TC-KEYPRESS-002 Single lowercase letter key press displays uppercase key name', async ({ page }) => {
    const keyPressesPage = new KeyPressesPage(page);
    
    // 1. Navigate to the Key Presses page
    await keyPressesPage.goto();
    
    // 2. Click on the input field to focus it
    await keyPressesPage.focusInput();
    
    // 3. Press the lowercase letter 'a'
    await page.locator('#target').pressSequentially('a');
    
    // Verify input field contains 'a'
    await expect(keyPressesPage.inputField).toHaveValue('a');
    
    // Verify result message displays 'You entered: A' (uppercase)
    await expect(page.getByText('You entered: A')).toBeVisible();
    
    // Verify URL remains https://the-internet.herokuapp.com/key_presses
    expect(page.url()).toBe('https://the-internet.herokuapp.com/key_presses');
  });

  test('TC-KEYPRESS-003 Multiple letter key presses show only the latest key', async ({ page }) => {
    const keyPressesPage = new KeyPressesPage(page);
    
    // 1. Navigate to the Key Presses page
    await keyPressesPage.goto();
    
    // 2. Click on the input field to focus it
    await keyPressesPage.focusInput();
    
    // 3. Press the letter 'a'
    await page.locator('#target').pressSequentially('a');
    
    // Verify result message displays 'You entered: A'
    await expect(page.getByText('You entered: A')).toBeVisible();
    
    // 4. Press the letter 'b'
    await page.locator('#target').pressSequentially('b');
    
    // Verify input field contains 'ab'
    await expect(keyPressesPage.inputField).toHaveValue('ab');
    
    // Verify result message updates to 'You entered: B' (only latest key, not history)
    await expect(page.getByText('You entered: B')).toBeVisible();
    
    // Verify URL remains unchanged
    expect(page.url()).toBe('https://the-internet.herokuapp.com/key_presses');
    
    // 5. Press the letter 'c'
    await page.locator('#target').pressSequentially('c');
    
    // Verify input field contains 'abc'
    await expect(keyPressesPage.inputField).toHaveValue('abc');
    
    // Verify result message updates to 'You entered: C'
    await expect(page.getByText('You entered: C')).toBeVisible();
  });
});
