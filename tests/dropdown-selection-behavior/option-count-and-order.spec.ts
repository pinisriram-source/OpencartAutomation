import { test, expect } from '@playwright/test';
import { DropdownPage } from './page-objects/dropdown-page';

test.describe('Initial State and Visibility', () => {
  test('TC-DROPDOWN-002: Verify the dropdown contains exactly 3 options in the correct order', { tag: '@regression' }, async ({ page }) => {
    const dropdownPage = new DropdownPage(page);

    // 1. Navigate to https://the-internet.herokuapp.com/dropdown
    await dropdownPage.navigate();

    // expect: The page loads successfully
    await dropdownPage.verifyHeadingVisible();

    // 2. Retrieve all options from the dropdown element
    const optionCount = await dropdownPage.getOptionCount();

    // expect: The dropdown contains exactly 3 options (no more, no fewer)
    expect(optionCount).toBe(3);

    // expect: Option at index 0 has text 'Please select an option', value='', disabled=true
    const option0 = await dropdownPage.getOptionAt(0);
    expect(option0.text).toBe('Please select an option');
    expect(option0.value).toBe('');
    expect(option0.disabled).toBe(true);

    // expect: Option at index 1 has text 'Option 1', value='1', disabled=false
    const option1 = await dropdownPage.getOptionAt(1);
    expect(option1.text).toBe('Option 1');
    expect(option1.value).toBe('1');
    expect(option1.disabled).toBe(false);

    // expect: Option at index 2 has text 'Option 2', value='2', disabled=false
    const option2 = await dropdownPage.getOptionAt(2);
    expect(option2.text).toBe('Option 2');
    expect(option2.value).toBe('2');
    expect(option2.disabled).toBe(false);

    // expect: The options appear in this exact order: placeholder, Option 1, Option 2
    expect(option0.text).toBe('Please select an option');
    expect(option1.text).toBe('Option 1');
    expect(option2.text).toBe('Option 2');
  });
});
