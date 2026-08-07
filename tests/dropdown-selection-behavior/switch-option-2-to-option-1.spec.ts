// Test Case: TC-DROPDOWN-007
// Title: Verify switching directly from Option 2 to Option 1 updates the value correctly with no intermediate state
// Module: Switching Between Options
// Type: Functional

import { test, expect } from '@playwright/test';
import { DropdownPage } from './page-objects/dropdown-page';

test.describe('Switching Between Options', () => {
  test('TC-DROPDOWN-007: Verify switching directly from Option 2 to Option 1 updates the value correctly with no intermediate state', { tag: '@regression' }, async ({ page }) => {
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
    
    const selectedValueAfterOption2 = await dropdownPage.getSelectedValue();
    expect(selectedValueAfterOption2).toBe('2');
    
    const selectedTextAfterOption2 = await dropdownPage.getSelectedText();
    expect(selectedTextAfterOption2).toBe('Option 2');
    
    await dropdownPage.verifyDropdownValue('2');

    // 3. Without reselecting the placeholder, directly select 'Option 1' from the dropdown (value='1')
    // expect: The dropdown's selected index changes immediately to 1
    // expect: The dropdown's selected value changes immediately to '1'
    // expect: The dropdown's selected text changes immediately to 'Option 1'
    // expect: No stale or intermediate state is shown during or after the transition
    // expect: The dropdown reflects the new selection cleanly
    await dropdownPage.selectOption('1');
    
    const selectedIndexAfterSwitch = await dropdownPage.getSelectedIndex();
    expect(selectedIndexAfterSwitch).toBe(1);
    
    const selectedValueAfterSwitch = await dropdownPage.getSelectedValue();
    expect(selectedValueAfterSwitch).toBe('1');
    
    const selectedTextAfterSwitch = await dropdownPage.getSelectedText();
    expect(selectedTextAfterSwitch).toBe('Option 1');
    
    await dropdownPage.verifyDropdownValue('1');
    await dropdownPage.verifyDropdownVisible();

    // 4. Verify the page URL
    // expect: The page URL remains https://the-internet.herokuapp.com/dropdown
    // expect: No navigation or page reload has occurred during the switch
    const currentUrl = dropdownPage.getCurrentUrl();
    expect(currentUrl).toBe('https://the-internet.herokuapp.com/dropdown');
  });
});
