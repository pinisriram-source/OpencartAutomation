import { test, expect } from '@playwright/test';
import { DropdownPage } from './page-objects/dropdown-page';

test.describe('Switching Between Options', () => {
  test('TC-DROPDOWN-006: Verify switching directly from Option 1 to Option 2 updates the value correctly with no intermediate state', { tag: '@regression' }, async ({ page }) => {
    const dropdownPage = new DropdownPage(page);

    // 1. Navigate to https://the-internet.herokuapp.com/dropdown
    await dropdownPage.navigate();
    expect(dropdownPage.getCurrentUrl()).toBe('https://the-internet.herokuapp.com/dropdown');
    await dropdownPage.verifyDropdownVisible();

    // 2. Select 'Option 1' from the dropdown (value='1')
    await dropdownPage.selectOption('1');
    await dropdownPage.verifyDropdownValue('1');
    const selectedTextOption1 = await dropdownPage.getSelectedText();
    expect(selectedTextOption1).toBe('Option 1');
    const selectedIndexOption1 = await dropdownPage.getSelectedIndex();
    expect(selectedIndexOption1).toBe(1);

    // 3. Without reselecting the placeholder, directly select 'Option 2' from the dropdown (value='2')
    await dropdownPage.selectOption('2');
    const selectedIndexOption2 = await dropdownPage.getSelectedIndex();
    expect(selectedIndexOption2).toBe(2);
    await dropdownPage.verifyDropdownValue('2');
    const selectedTextOption2 = await dropdownPage.getSelectedText();
    expect(selectedTextOption2).toBe('Option 2');
    const finalValue = await dropdownPage.getSelectedValue();
    expect(finalValue).toBe('2');

    // 4. Verify the page URL
    expect(dropdownPage.getCurrentUrl()).toBe('https://the-internet.herokuapp.com/dropdown');
  });
});
