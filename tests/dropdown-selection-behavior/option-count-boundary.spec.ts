// Test Case: TC-DROPDOWN-012
// Title: Verify dropdown contains no extra or missing options beyond the expected 3
// Module: Boundary and Negative Cases
// Type: Boundary

import { test, expect } from '@playwright/test';
import { DropdownPage } from './page-objects/dropdown-page';

test.describe('Boundary and Negative Cases', () => {
  test('TC-DROPDOWN-012: Verify dropdown contains no extra or missing options beyond the expected 3', { tag: '@regression' }, async ({ page }) => {
    const dropdownPage = new DropdownPage(page);

    // 1. Navigate to https://the-internet.herokuapp.com/dropdown
    // expect: The page loads successfully
    await dropdownPage.navigate();
    await dropdownPage.verifyHeadingVisible();
    await dropdownPage.verifyDropdownVisible();

    // 2. Retrieve the total count of options in the dropdown
    // expect: The dropdown has exactly 3 options
    const optionCount = await dropdownPage.getOptionCount();
    expect(optionCount).toBe(3);

    // expect: The count is neither 2 (missing an option) nor 4 or more (extra options)
    expect(optionCount).not.toBe(2);
    expect(optionCount).toBeLessThan(4);

    // expect: Any deviation from exactly 3 options is treated as a failure
    // Also verify each option exists: index 0 = placeholder, index 1 = Option 1, index 2 = Option 2
    
    // Verify index 0 = placeholder
    const option0 = await dropdownPage.getOptionAt(0);
    expect(option0.text).toBe('Please select an option');
    expect(option0.value).toBe('');
    expect(option0.disabled).toBe(true);

    // Verify index 1 = Option 1
    const option1 = await dropdownPage.getOptionAt(1);
    expect(option1.text).toBe('Option 1');
    expect(option1.value).toBe('1');
    expect(option1.disabled).toBe(false);

    // Verify index 2 = Option 2
    const option2 = await dropdownPage.getOptionAt(2);
    expect(option2.text).toBe('Option 2');
    expect(option2.value).toBe('2');
    expect(option2.disabled).toBe(false);
  });
});
