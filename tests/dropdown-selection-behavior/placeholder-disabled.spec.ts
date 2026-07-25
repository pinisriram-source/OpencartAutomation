import { test, expect } from '@playwright/test';
import { DropdownPage } from './page-objects/dropdown-page';

test.describe('Placeholder Disabled Behavior', () => {
  test('TC-DROPDOWN-003: Verify the placeholder option is disabled and cannot be selected by user via UI', async ({ page }) => {
    const dropdownPage = new DropdownPage(page);

    // 1. Navigate to https://the-internet.herokuapp.com/dropdown
    await dropdownPage.navigate();

    // expect: The page loads successfully
    await dropdownPage.verifyHeadingVisible();
    await dropdownPage.verifyDropdownVisible();

    // 2. Inspect the placeholder option (index 0) for the disabled attribute
    const placeholderOption = await dropdownPage.getOptionAt(0);

    // expect: The placeholder option has disabled=true
    expect(placeholderOption.disabled).toBe(true);

    // expect: The placeholder option has the HTML disabled attribute present
    const hasDisabledAttribute = await page.evaluate(() => {
      const select = document.querySelector('#dropdown') as HTMLSelectElement;
      return select.options[0].hasAttribute('disabled');
    });
    expect(hasDisabledAttribute).toBe(true);

    // expect: The disabled attribute prevents the placeholder from being clickable in the browser UI
    expect(placeholderOption.text).toBe('Please select an option');
    expect(placeholderOption.value).toBe('');

    // 3. First select Option 1 to have a valid selection
    await dropdownPage.selectOption('1');

    // Verify Option 1 is selected
    const selectedValue = await dropdownPage.getSelectedValue();
    expect(selectedValue).toBe('1');

    // then attempt to select the placeholder option via automated UI interaction (selectOption with value '')
    let errorOccurred = false;
    let errorMessage = '';

    try {
      await dropdownPage.selectOption('');
    } catch (error: any) {
      errorOccurred = true;
      errorMessage = error.message;
    }

    // expect: The dropdown does not allow selection of the disabled placeholder via UI interaction
    expect(errorOccurred).toBe(true);
    expect(errorMessage).toContain('option being selected is not enabled');

    // expect: The previously selected Option 1 remains selected (disabled option cannot override it via UI)
    const finalSelectedValue = await dropdownPage.getSelectedValue();
    expect(finalSelectedValue).toBe('1');

    const finalSelectedText = await dropdownPage.getSelectedText();
    expect(finalSelectedText).toBe('Option 1');
  });
});
