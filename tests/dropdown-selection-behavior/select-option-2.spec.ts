// Test Case: TC-DROPDOWN-005
// Title: Verify selecting Option 2 updates the dropdown's selected value to Option 2
// Module: Single Option Selection
// Type: Functional

import { test, expect } from '@playwright/test';
import { DropdownPage } from './page-objects/dropdown-page';

test.describe('Single Option Selection', () => {
  test('TC-DROPDOWN-005: Verify selecting Option 2 updates the dropdown\'s selected value to Option 2', { tag: '@regression' }, async ({ page }) => {
    const dropdownPage = new DropdownPage(page);

    // 1. Navigate to https://the-internet.herokuapp.com/dropdown
    // expect: The page loads successfully
    // expect: The placeholder 'Please select an option' is displayed by default
    await dropdownPage.navigate();
    await dropdownPage.verifyHeadingVisible();
    await dropdownPage.verifyDropdownVisible();
    
    const initialText = await dropdownPage.getSelectedText();
    expect(initialText).toBe('Please select an option');
    
    const initialValue = await dropdownPage.getSelectedValue();
    expect(initialValue).toBe('');

    // 2. Select 'Option 2' from the dropdown (value='2')
    // expect: The dropdown's selected index changes to 2
    // expect: The dropdown's selected value changes to '2'
    // expect: The dropdown's selected text changes to 'Option 2'
    // expect: The dropdown visually displays 'Option 2' as the selected option
    await dropdownPage.selectOption('2');
    
    const selectedIndex = await dropdownPage.getSelectedIndex();
    expect(selectedIndex).toBe(2);
    
    const selectedValue = await dropdownPage.getSelectedValue();
    expect(selectedValue).toBe('2');
    
    const selectedText = await dropdownPage.getSelectedText();
    expect(selectedText).toBe('Option 2');
    
    await dropdownPage.verifyDropdownValue('2');

    // 3. Verify the page URL
    // expect: The page URL remains https://the-internet.herokuapp.com/dropdown
    // expect: No navigation or page reload has occurred
    const currentUrl = dropdownPage.getCurrentUrl();
    expect(currentUrl).toBe('https://the-internet.herokuapp.com/dropdown');
  });
});
