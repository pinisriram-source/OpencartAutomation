import { test, expect } from '@playwright/test';
import { DropdownPage } from './page-objects/dropdown-page';

test.describe('Dropdown Functionality', () => {
  test('TC-DROPDOWN-013 Verify dropdown accessibility attributes', async ({ page }) => {
    const dropdownPage = new DropdownPage(page);

    // 1. Navigate to https://the-internet.herokuapp.com/dropdown
    await dropdownPage.navigate();
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/dropdown');
    await expect(page.getByRole('heading', { name: 'Dropdown List' })).toBeVisible();

    // 2. Inspect dropdown element for accessibility role
    const dropdown = dropdownPage.dropdown;
    
    // Verify dropdown is a select element (tagName is SELECT)
    const tagName = await dropdown.evaluate((el) => el.tagName);
    expect(tagName).toBe('SELECT');
    
    // Verify element role is 'combobox' or native select
    // Note: Native select elements have implicit combobox role
    const role = await page.getByRole('combobox').count();
    expect(role).toBeGreaterThan(0);

    // 3. Verify options are properly structured
    const options = dropdown.locator('option');
    const optionsCount = await options.count();
    expect(optionsCount).toBe(3);

    // Verify each option is an option element (tagName is OPTION)
    for (let i = 0; i < optionsCount; i++) {
      const optionTagName = await options.nth(i).evaluate((el) => el.tagName);
      expect(optionTagName).toBe('OPTION');
    }

    // Verify disabled option has 'disabled' attribute
    const firstOption = options.nth(0);
    const isDisabled = await firstOption.isDisabled();
    expect(isDisabled).toBe(true);
    const hasDisabledAttr = await firstOption.evaluate((el) => el.hasAttribute('disabled'));
    expect(hasDisabledAttr).toBe(true);

    // Verify options have text content
    const option1Text = await options.nth(0).textContent();
    expect(option1Text).toBe('Please select an option');
    const option2Text = await options.nth(1).textContent();
    expect(option2Text).toBe('Option 1');
    const option3Text = await options.nth(2).textContent();
    expect(option3Text).toBe('Option 2');

    // 4. Verify keyboard accessibility (Tab to dropdown)
    // Focus the dropdown
    await dropdown.focus();
    
    // Verify dropdown can receive focus via Tab key
    const isFocused = await dropdown.evaluate((el) => document.activeElement === el);
    expect(isFocused).toBe(true);

    // Verify dropdown can be operated with arrow keys (select via keyboard)
    await page.keyboard.press('ArrowDown');
    
    // Verify selection changed to Option 1 (index 1)
    const selectedValue = await dropdownPage.getSelectedValue();
    expect(selectedValue).toBe('1');
    
    const selectedText = await dropdownPage.getSelectedText();
    expect(selectedText).toBe('Option 1');
  });
});
