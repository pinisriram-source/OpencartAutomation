// Test Case: TC-DROPDOWN-008
// Title: Verify selected value does NOT persist after page reload and resets to default placeholder
// Module: Page Reload and Persistence
// Type: Functional

import { test, expect } from '@playwright/test';
import { DropdownPage } from './page-objects/dropdown-page';

test.describe('Page Reload and Persistence', () => {
  test('TC-DROPDOWN-008: Verify selected value does NOT persist after page reload and resets to default placeholder', async ({ page }) => {
    const dropdownPage = new DropdownPage(page);

    // 1. Navigate to https://the-internet.herokuapp.com/dropdown
    // expect: The page loads successfully
    await dropdownPage.navigate();
    await dropdownPage.verifyHeadingVisible();
    await dropdownPage.verifyDropdownVisible();

    // 2. Select 'Option 2' from the dropdown (value='2')
    // expect: The dropdown's selected value is '2'
    // expect: The dropdown's selected text is 'Option 2'
    await dropdownPage.selectOption('2');
    
    const selectedValue = await dropdownPage.getSelectedValue();
    expect(selectedValue).toBe('2');
    
    const selectedText = await dropdownPage.getSelectedText();
    expect(selectedText).toBe('Option 2');

    // 3. Reload the page (use page.reload())
    // expect: The page reloads successfully
    // expect: The page URL is still https://the-internet.herokuapp.com/dropdown
    await dropdownPage.reload();
    await dropdownPage.verifyHeadingVisible();
    
    const currentUrl = dropdownPage.getCurrentUrl();
    expect(currentUrl).toBe('https://the-internet.herokuapp.com/dropdown');

    // 4. Inspect the dropdown's selected value after reload
    // expect: The dropdown's selected index is 0
    // expect: The dropdown's selected value is an empty string ''
    // expect: The dropdown's selected text is 'Please select an option'
    // expect: The previously selected 'Option 2' is NOT retained
    // expect: The dropdown has reset to the default placeholder state
    const selectedIndexAfterReload = await dropdownPage.getSelectedIndex();
    expect(selectedIndexAfterReload).toBe(0);
    
    const selectedValueAfterReload = await dropdownPage.getSelectedValue();
    expect(selectedValueAfterReload).toBe('');
    
    const selectedTextAfterReload = await dropdownPage.getSelectedText();
    expect(selectedTextAfterReload).toBe('Please select an option');
    
    await dropdownPage.verifyDropdownValue('');
  });
});
