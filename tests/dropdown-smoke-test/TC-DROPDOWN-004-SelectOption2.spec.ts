// spec: specs/dropdown-smoke-test-test-plan.md
// seed: N/A

import { test, expect } from '@playwright/test';
import { DropdownPage } from './page-objects/dropdown-page';

test.describe('Dropdown Functionality', () => {
  test('TC-DROPDOWN-004 Select Option 2 successfully', async ({ page }) => {
    const dropdownPage = new DropdownPage(page);

    // 1. Navigate to https://the-internet.herokuapp.com/dropdown
    // expect: Page loads with placeholder selected
    await dropdownPage.navigate();
    await expect(page).toHaveTitle('The Internet');
    await expect(dropdownPage.pageHeading).toBeVisible();
    await expect(dropdownPage.dropdown).toBeVisible();
    
    // Verify placeholder is selected on page load
    await expect(dropdownPage.dropdown).toHaveValue('');
    const initialSelectedText = await dropdownPage.getSelectedText();
    expect(initialSelectedText).toBe('Please select an option');
    const initialSelectedIndex = await dropdownPage.getSelectedIndex();
    expect(initialSelectedIndex).toBe(0);

    // 2. Select 'Option 2' from the dropdown
    // expect: Dropdown value changes to '2'
    // expect: Selected text is 'Option 2'
    // expect: Selected index is 2
    await dropdownPage.selectOption('2');
    
    await expect(dropdownPage.dropdown).toHaveValue('2');
    const selectedText = await dropdownPage.getSelectedText();
    expect(selectedText).toBe('Option 2');
    const selectedIndex = await dropdownPage.getSelectedIndex();
    expect(selectedIndex).toBe(2);

    // 3. Verify the selection persists
    // expect: Option 2 remains selected
    // expect: Placeholder is no longer selected
    const isOption2Selected = await dropdownPage.isOptionSelected('Option 2');
    expect(isOption2Selected).toBe(true);
    
    const isPlaceholderSelected = await dropdownPage.isOptionSelected('Please select an option');
    expect(isPlaceholderSelected).toBe(false);
    
    // Final verification that Option 2 is still selected
    await expect(dropdownPage.dropdown).toHaveValue('2');
  });
});
