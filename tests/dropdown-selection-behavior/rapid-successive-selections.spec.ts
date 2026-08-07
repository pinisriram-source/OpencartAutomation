// Test Case: TC-DROPDOWN-010
// Title: Verify dropdown behavior when attempting rapid successive selections
// Module: Boundary and Negative Cases
// Type: Functional / Negative

import { test, expect } from '@playwright/test';
import { DropdownPage } from './page-objects/dropdown-page';

test.describe('Boundary and Negative Cases', () => {
  test('TC-DROPDOWN-010: Verify dropdown behavior when attempting rapid successive selections', { tag: '@regression' }, async ({ page }) => {
    const dropdownPage = new DropdownPage(page);

    // Setup listener for JavaScript errors
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => {
      pageErrors.push(error);
    });

    // 1. Navigate to https://the-internet.herokuapp.com/dropdown
    // expect: The page loads successfully
    await dropdownPage.navigate();
    await dropdownPage.verifyHeadingVisible();
    await dropdownPage.verifyDropdownVisible();

    // 2. Rapidly select 'Option 1', then immediately 'Option 2', then immediately 'Option 1' again in quick succession (no waits between selections)
    // expect: Each selection is registered correctly
    // expect: The final selected value is '1' (the last selection - Option 1)
    // expect: The final selected text is 'Option 1'
    // expect: No intermediate state is left hanging
    // expect: No JavaScript errors occur in the console
    // expect: The dropdown state is consistent and reflects the last selection
    await dropdownPage.selectOption('1');
    await dropdownPage.selectOption('2');
    await dropdownPage.selectOption('1');

    // Verify final selected value is '1' (the last selection - Option 1)
    const finalValue = await dropdownPage.getSelectedValue();
    expect(finalValue).toBe('1');

    // Verify final selected text is 'Option 1'
    const finalText = await dropdownPage.getSelectedText();
    expect(finalText).toBe('Option 1');

    // Verify the dropdown value using the built-in assertion
    await dropdownPage.verifyDropdownValue('1');

    // Verify final selected index is 1
    const finalIndex = await dropdownPage.getSelectedIndex();
    expect(finalIndex).toBe(1);

    // Verify no JavaScript errors occurred in the console
    expect(pageErrors).toHaveLength(0);

    // Verify the page URL remains unchanged (no navigation occurred)
    const currentUrl = dropdownPage.getCurrentUrl();
    expect(currentUrl).toBe('https://the-internet.herokuapp.com/dropdown');
  });
});
