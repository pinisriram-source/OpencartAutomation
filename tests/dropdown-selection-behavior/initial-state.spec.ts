import { test, expect } from '@playwright/test';
import { DropdownPage } from './page-objects/dropdown-page';

test.describe('Initial State and Visibility', () => {
  test('TC-DROPDOWN-001: Verify dropdown is visible and displays default placeholder on initial page load', { tag: '@regression' }, async ({ page }) => {
    const dropdownPage = new DropdownPage(page);

    // 1. Navigate to https://the-internet.herokuapp.com/dropdown
    await dropdownPage.navigate();

    // expect: The page loads successfully with title 'The Internet'
    await expect(page).toHaveTitle('The Internet');

    // expect: The heading 'Dropdown List' is visible
    await dropdownPage.verifyHeadingVisible();

    // expect: The dropdown element with id='dropdown' is visible on the page
    await dropdownPage.verifyDropdownVisible();

    // 2. Inspect the dropdown's selected value
    // expect: The dropdown's selected index is 0
    const selectedIndex = await dropdownPage.getSelectedIndex();
    expect(selectedIndex).toBe(0);

    // expect: The dropdown's selected text is 'Please select an option'
    const selectedText = await dropdownPage.getSelectedText();
    expect(selectedText).toBe('Please select an option');

    // expect: The dropdown's selected value is an empty string ''
    const selectedValue = await dropdownPage.getSelectedValue();
    expect(selectedValue).toBe('');

    // expect: No real option (Option 1 or Option 2) is selected by default
    expect(selectedText).not.toBe('Option 1');
    expect(selectedText).not.toBe('Option 2');
  });
});
