import { test, expect } from '@playwright/test';
import { DropdownPage } from './page-objects/dropdown-page';

test.describe('Dropdown Functionality', () => {
  test('TC-DROPDOWN-010 Verify dropdown has no form submission behavior', async ({ page }) => {
    const dropdownPage = new DropdownPage(page);

    // 1. Navigate to https://the-internet.herokuapp.com/dropdown
    await dropdownPage.navigate();

    // Expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/dropdown');
    await expect(page).toHaveTitle('The Internet');

    // 2. Inspect the dropdown element's parent hierarchy
    // Expect: Dropdown is not contained within a form element
    const isInForm = await dropdownPage.isInFormElement();
    expect(isInForm).toBe(false);

    // Expect: No submit button exists on the page
    const hasSubmit = await dropdownPage.hasSubmitButton();
    expect(hasSubmit).toBe(false);

    // 3. Select 'Option 1' and verify no form submission occurs
    const urlBeforeSelection = await dropdownPage.getCurrentUrl();
    await dropdownPage.selectOption('1');

    // Expect: No form submission event is triggered
    // Expect: Page does not navigate away
    const urlAfterSelection = await dropdownPage.getCurrentUrl();
    expect(urlAfterSelection).toBe(urlBeforeSelection);
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/dropdown');

    // Verify option was selected successfully
    const selectedValue = await dropdownPage.getSelectedValue();
    expect(selectedValue).toBe('1');
    const selectedText = await dropdownPage.getSelectedText();
    expect(selectedText).toBe('Option 1');

    // 4. Verify dropdown element attributes
    // Expect: Dropdown has no 'onchange' handler that navigates
    const onchangeAttr = await dropdownPage.getDropdownOnChange();
    expect(onchangeAttr).toBeNull();

    // Expect: Dropdown has id='dropdown'
    const dropdownId = await dropdownPage.getDropdownId();
    expect(dropdownId).toBe('dropdown');

    // Expect: Dropdown has no name attribute
    const dropdownName = await dropdownPage.getDropdownName();
    expect(dropdownName).toBeNull();
  });
});
