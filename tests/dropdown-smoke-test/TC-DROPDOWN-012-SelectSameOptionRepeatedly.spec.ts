import { test, expect } from '@playwright/test';
import { DropdownPage } from './page-objects/dropdown-page';

test.describe('Dropdown Functionality', () => {
  test('TC-DROPDOWN-012 Verify selecting same option multiple times', async ({ page }) => {
    const dropdownPage = new DropdownPage(page);

    // 1. Navigate to https://the-internet.herokuapp.com/dropdown and verify page loads with placeholder selected
    await dropdownPage.navigate();
    await expect(dropdownPage.pageHeading).toBeVisible();
    await expect(dropdownPage.dropdown).toHaveValue('');

    // 2. Select 'Option 1' from the dropdown and verify selection
    await dropdownPage.selectOption('1');
    await expect(dropdownPage.dropdown).toHaveValue('1');

    // 3. Re-select 'Option 1' again and verify it remains selected
    await dropdownPage.selectOption('1');
    await expect(dropdownPage.dropdown).toHaveValue('1');

    // 4. Select 'Option 1' a third time and verify consistent behavior
    await dropdownPage.selectOption('1');
    await expect(dropdownPage.dropdown).toHaveValue('1');
  });
});
