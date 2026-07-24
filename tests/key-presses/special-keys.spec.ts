import { test, expect } from '@playwright/test';
import { KeyPressesPage } from './pages/key-presses.page';

test.describe('Special Keys and Navigation Keys', () => {
  let keyPressesPage: KeyPressesPage;

  test.beforeEach(async ({ page }) => {
    keyPressesPage = new KeyPressesPage(page);
  });

  test('TC-KEYPRESS-006: Enter key detection displays ENTER', async ({ page }) => {
    // 1. Navigate to the Key Presses page
    await keyPressesPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveTitle('The Internet');
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');

    // 2. Click on the input field to focus it
    await keyPressesPage.clickInput();

    // expect: Input field receives focus
    await expect(keyPressesPage.inputField).toBeFocused();

    // 3. Press the Enter key
    await keyPressesPage.pressKey('Enter');

    // expect: Page performs a form submission
    // expect: URL changes to https://the-internet.herokuapp.com/key_presses? (query string added)
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses?');

    // expect: Result message disappears (paragraph is empty)
    const resultText = await keyPressesPage.getResultText();
    expect(resultText).toBe('');
  });

  test('TC-KEYPRESS-007: Space key detection displays SPACE', async ({ page }) => {
    // 1. Navigate to the Key Presses page
    await keyPressesPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveTitle('The Internet');
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');

    // 2. Click on the input field to focus it
    await keyPressesPage.clickInput();

    // expect: Input field receives focus
    await expect(keyPressesPage.inputField).toBeFocused();

    // 3. Press the Space key
    await keyPressesPage.pressKey('Space');

    // expect: Result message displays 'You entered: SPACE'
    const resultText = await keyPressesPage.getResultText();
    expect(resultText).toBe('You entered: SPACE');

    // expect: Input field contains a space character
    const inputValue = await keyPressesPage.getInputValue();
    expect(inputValue).toBe(' ');

    // expect: URL remains unchanged
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');
  });

  test('TC-KEYPRESS-008: Escape key detection displays ESCAPE', async ({ page }) => {
    // 1. Navigate to the Key Presses page
    await keyPressesPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveTitle('The Internet');
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');

    // 2. Click on the input field to focus it
    await keyPressesPage.clickInput();

    // expect: Input field receives focus
    await expect(keyPressesPage.inputField).toBeFocused();

    // 3. Press the Escape key
    await keyPressesPage.pressKey('Escape');

    // expect: Result message displays 'You entered: ESCAPE'
    const resultText = await keyPressesPage.getResultText();
    expect(resultText).toBe('You entered: ESCAPE');

    // expect: URL remains unchanged
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');

    // expect: Page does not navigate away
    await expect(keyPressesPage.heading).toBeVisible();
  });

  test('TC-KEYPRESS-009: Tab key detection displays TAB and moves focus', async ({ page }) => {
    // 1. Navigate to the Key Presses page
    await keyPressesPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveTitle('The Internet');
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');

    // 2. Click on the input field to focus it
    await keyPressesPage.clickInput();

    // expect: Input field receives focus
    await expect(keyPressesPage.inputField).toBeFocused();

    // 3. Press the Tab key
    await keyPressesPage.pressKey('Tab');

    // expect: Result message displays 'You entered: TAB'
    const resultText = await keyPressesPage.getResultText();
    expect(resultText).toBe('You entered: TAB');

    // expect: Focus moves to the next focusable element (Elemental Selenium link)
    await expect(keyPressesPage.inputField).not.toBeFocused();

    // expect: URL remains unchanged
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');
  });

  test('TC-KEYPRESS-010: Backspace key detection displays BACK_SPACE', async ({ page }) => {
    // 1. Navigate to the Key Presses page
    await keyPressesPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveTitle('The Internet');
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');

    // 2. Click on the input field and type 'abc'
    await keyPressesPage.clickInput();
    await keyPressesPage.inputField.fill('abc');

    // expect: Input field contains 'abc'
    let inputValue = await keyPressesPage.getInputValue();
    expect(inputValue).toBe('abc');

    // 3. Press the Backspace key
    await keyPressesPage.pressKey('Backspace');

    // expect: Result message displays 'You entered: BACK_SPACE' (with underscore)
    const resultText = await keyPressesPage.getResultText();
    expect(resultText).toBe('You entered: BACK_SPACE');

    // expect: Input field now contains 'ab' (last character deleted)
    inputValue = await keyPressesPage.getInputValue();
    expect(inputValue).toBe('ab');

    // expect: URL remains unchanged
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');
  });

  test('TC-KEYPRESS-011: Delete key detection displays DELETE', async ({ page }) => {
    // 1. Navigate to the Key Presses page
    await keyPressesPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveTitle('The Internet');
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');

    // 2. Click on the input field to focus it
    await keyPressesPage.clickInput();

    // expect: Input field receives focus
    await expect(keyPressesPage.inputField).toBeFocused();

    // 3. Press the Delete key
    await keyPressesPage.pressKey('Delete');

    // expect: Result message displays 'You entered: DELETE'
    const resultText = await keyPressesPage.getResultText();
    expect(resultText).toBe('You entered: DELETE');

    // expect: URL remains unchanged
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/key_presses');
  });
});
