import { test, expect } from '@playwright/test';
import { DropdownPage } from './page-objects/dropdown-page';

test.describe('Dropdown Functionality', () => {
  test('TC-DROPDOWN-003 Select Option 1 successfully', async ({ page }) => {
    const dropdownPage = new DropdownPage(page);

    // 1. Navigate to https://the-internet.herokuapp.com/dropdown
    await dropdownPage.navigate();

    // expect: Page loads with placeholder selected
    const initialValue = await dropdownPage.getSelectedValue();
    const initialText = await dropdownPage.getSelectedText();
    expect(initialValue).toBe('');
    expect(initialText).toBe('Please select an option');

    // 2. Select 'Option 1' from the dropdown
    await dropdownPage.selectOption('1');

    // expect: Dropdown value changes to '1'
    const selectedValue = await dropdownPage.getSelectedValue();
    expect(selectedValue).toBe('1');

    // expect: Selected text is 'Option 1'
    const selectedText = await dropdownPage.getSelectedText();
    expect(selectedText).toBe('Option 1');

    // expect: Selected index is 1
    const selectedIndex = await page.evaluate(() => {
      const select = document.querySelector('#dropdown') as HTMLSelectElement;
      return select.selectedIndex;
    });
    expect(selectedIndex).toBe(1);

    // 3. Verify the selection persists
    // expect: Option 1 remains selected
    const persistedValue = await dropdownPage.getSelectedValue();
    expect(persistedValue).toBe('1');

    const persistedText = await dropdownPage.getSelectedText();
    expect(persistedText).toBe('Option 1');

    // expect: Placeholder is no longer selected
    const placeholderSelected = await page.evaluate(() => {
      const select = document.querySelector('#dropdown') as HTMLSelectElement;
      const placeholderOption = select.querySelector('option[disabled]') as HTMLOptionElement;
      return placeholderOption.selected;
    });
    expect(placeholderSelected).toBe(false);
  });
});
