import { test, expect } from '@playwright/test';
import { DropdownPage } from './page-objects/dropdown-page';

test.describe('Dropdown Functionality', () => {
  let dropdownPage: DropdownPage;

  test.beforeEach(async ({ page }) => {
    dropdownPage = new DropdownPage(page);
  });

  test('TC-DROPDOWN-006 Switch from Option 2 to Option 1 directly', async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/dropdown
    await dropdownPage.navigate();

    // expect: Page loads with placeholder selected
    await dropdownPage.verifyHeadingVisible();
    await expect(dropdownPage.dropdown).toHaveValue('');

    // 2. Select 'Option 2' from the dropdown
    await dropdownPage.selectOption('2');

    // expect: Option 2 is selected
    // expect: Dropdown value is '2'
    await dropdownPage.verifyDropdownValue('2');

    // 3. Select 'Option 1' from the dropdown without reselecting placeholder
    await dropdownPage.selectOption('1');

    // expect: Dropdown value changes to '1'
    await dropdownPage.verifyDropdownValue('1');

    // expect: Selected text is 'Option 1'
    // expect: Selected index is 1
    // expect: Placeholder is not selected
    const dropdownState = await page.locator('#dropdown').evaluate((element: HTMLSelectElement) => {
      return {
        selectedIndex: element.selectedIndex,
        selectedValue: element.value,
        selectedText: element.options[element.selectedIndex].text,
        option1Selected: element.options[1].selected,
        option2Selected: element.options[2].selected,
        placeholderSelected: element.options[0].selected
      };
    });

    expect(dropdownState.selectedText).toBe('Option 1');
    expect(dropdownState.selectedIndex).toBe(1);
    expect(dropdownState.placeholderSelected).toBe(false);

    // 4. Verify the final state
    // expect: Option 1 is selected
    expect(dropdownState.option1Selected).toBe(true);

    // expect: Option 2 is no longer selected
    expect(dropdownState.option2Selected).toBe(false);
  });
});
