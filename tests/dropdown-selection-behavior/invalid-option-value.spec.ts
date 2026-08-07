import { test, expect, Page } from '@playwright/test';
import { DropdownPage } from './page-objects/dropdown-page';

test.describe('Boundary and Negative Cases', () => {
  test('TC-DROPDOWN-011: Verify dropdown does not accept invalid or out-of-range option values', { tag: '@regression' }, async ({ page }) => {
    const dropdownPage = new DropdownPage(page);
    let jsErrors: Error[] = [];

    // Listen for JavaScript errors
    page.on('pageerror', (error) => {
      jsErrors.push(error);
    });

    // 1. Navigate to https://the-internet.herokuapp.com/dropdown
    await dropdownPage.navigate();
    await dropdownPage.verifyHeadingVisible();
    await dropdownPage.verifyDropdownVisible();

    // Reset dropdown to initial placeholder state (index 0, value empty)
    await page.evaluate(() => {
      const select = document.querySelector('#dropdown') as HTMLSelectElement;
      select.selectedIndex = 0;
    });

    // Verify initial state
    const initialState = await page.evaluate(() => {
      const select = document.querySelector('#dropdown') as HTMLSelectElement;
      return {
        selectedIndex: select.selectedIndex,
        selectedValue: select.value,
        selectedText: select.options[select.selectedIndex].text
      };
    });
    expect(initialState.selectedIndex).toBe(0);
    expect(initialState.selectedValue).toBe('');

    // 2. Attempt to programmatically set the dropdown value to invalid values
    const testResults = await page.evaluate(() => {
      const select = document.querySelector('#dropdown') as HTMLSelectElement;
      const results: any[] = [];

      const stateBefore = {
        index: select.selectedIndex,
        value: select.value
      };

      // Attempt to set invalid value '3'
      select.value = '3';
      results.push({
        attemptedValue: '3',
        index: select.selectedIndex,
        value: select.value
      });

      // Attempt to set invalid value 'invalid'
      select.value = 'invalid';
      results.push({
        attemptedValue: 'invalid',
        index: select.selectedIndex,
        value: select.value
      });

      // Attempt to set invalid value 'Option 3'
      select.value = 'Option 3';
      results.push({
        attemptedValue: 'Option 3',
        index: select.selectedIndex,
        value: select.value
      });

      return { stateBefore, results };
    });

    // expect: The dropdown does not change its selected value to the invalid value
    // expect: The dropdown retains its previous valid state (value remains '')
    for (const result of testResults.results) {
      expect(result.value).toBe(''); // Value remains empty string
    }

    // Verify final state after all invalid attempts
    const finalState = await page.evaluate(() => {
      const select = document.querySelector('#dropdown') as HTMLSelectElement;
      return {
        selectedValue: select.value
      };
    });
    expect(finalState.selectedValue).toBe('');

    // expect: No JavaScript error is thrown
    expect(jsErrors).toHaveLength(0);

    // expect: The dropdown remains functional for subsequent valid selections
    await dropdownPage.selectOption('1');
    await dropdownPage.verifyDropdownValue('1');
  });
});
