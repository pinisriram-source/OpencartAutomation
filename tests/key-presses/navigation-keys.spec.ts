import { test, expect } from '@playwright/test';
import { KeyPressesPage } from './pages/key-presses.page';

test.describe('Special Keys and Navigation Keys', () => {
  let keyPressesPage: KeyPressesPage;

  test.beforeEach(async ({ page }) => {
    keyPressesPage = new KeyPressesPage(page);
  });

  test('TC-KEYPRESS-014: Home key detection displays HOME', async ({ page }) => {
    // 1. Navigate to the Key Presses page
    await keyPressesPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveTitle('The Internet');
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');

    // 2. Press the Home key (input not focused)
    await keyPressesPage.pressKey('Home');

    // expect: Result message displays 'You entered: HOME'
    const resultText = await keyPressesPage.getResultText();
    expect(resultText).toBe('You entered: HOME');

    // expect: URL remains unchanged
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');
  });

  test('TC-KEYPRESS-015: End key detection displays END', async ({ page }) => {
    // 1. Navigate to the Key Presses page
    await keyPressesPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveTitle('The Internet');
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');

    // 2. Press the End key
    await keyPressesPage.pressKey('End');

    // expect: Result message displays 'You entered: END'
    const resultText = await keyPressesPage.getResultText();
    expect(resultText).toBe('You entered: END');

    // expect: URL remains unchanged
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');
  });

  test('TC-KEYPRESS-016: Page Down key detection displays PAGE_DOWN', async ({ page }) => {
    // 1. Navigate to the Key Presses page
    await keyPressesPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveTitle('The Internet');
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');

    // 2. Press the PageDown key
    await keyPressesPage.pressKey('PageDown');

    // expect: Result message displays 'You entered: PAGE_DOWN' (with underscore)
    const resultText = await keyPressesPage.getResultText();
    expect(resultText).toBe('You entered: PAGE_DOWN');

    // expect: URL remains unchanged
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');
  });

  test('TC-KEYPRESS-017: Page Up key detection displays PAGE_UP', async ({ page }) => {
    // 1. Navigate to the Key Presses page
    await keyPressesPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveTitle('The Internet');
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');

    // 2. Press the PageUp key
    await keyPressesPage.pressKey('PageUp');

    // expect: Result message displays 'You entered: PAGE_UP' (with underscore)
    const resultText = await keyPressesPage.getResultText();
    expect(resultText).toBe('You entered: PAGE_UP');

    // expect: URL remains unchanged
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');
  });
});
