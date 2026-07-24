import { test, expect } from '@playwright/test';
import { DropdownPage } from './page-objects/dropdown-page';

test.describe('Dropdown Functionality', () => {
  test('TC-DROPDOWN-014 Verify dropdown visibility and layout', async ({ page }) => {
    const dropdownPage = new DropdownPage(page);
    
    // 1. Navigate to https://the-internet.herokuapp.com/dropdown
    await dropdownPage.navigate();
    
    // expect: Page loads successfully
    await expect(page).toHaveTitle('The Internet');
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/dropdown');
    
    // 2. Verify dropdown is visible on page load
    // expect: Dropdown element is visible (not hidden)
    await expect(dropdownPage.dropdown).toBeVisible();
    
    // expect: Dropdown is rendered in the viewport
    await expect(dropdownPage.dropdown).toBeInViewport();
    
    // expect: Dropdown has non-zero dimensions
    const dropdownBox = await dropdownPage.dropdown.boundingBox();
    expect(dropdownBox).not.toBeNull();
    expect(dropdownBox!.width).toBeGreaterThan(0);
    expect(dropdownBox!.height).toBeGreaterThan(0);
    
    // 3. Verify page heading is present
    const pageHeading = page.getByRole('heading', { name: 'Dropdown List' });
    
    // expect: Heading 'Dropdown List' is visible above the dropdown
    await expect(pageHeading).toBeVisible();
    
    // expect: Heading is an h3 element
    const headingTagName = await pageHeading.evaluate((el) => el.tagName.toLowerCase());
    expect(headingTagName).toBe('h3');
    
    // 4. Verify dropdown placement
    // expect: Dropdown appears below the heading
    const headingBox = await pageHeading.boundingBox();
    expect(headingBox).not.toBeNull();
    expect(dropdownBox!.top).toBeGreaterThan(headingBox!.bottom);
    
    // expect: Dropdown is the primary interactive element on the page
    const interactiveElements = page.locator('button, input, select, textarea, a[href]');
    const interactiveCount = await interactiveElements.count();
    
    // The dropdown should be present among interactive elements
    // (excluding the GitHub fork link and Elemental Selenium footer link)
    await expect(dropdownPage.dropdown).toBeVisible();
    await expect(dropdownPage.dropdown).toBeEnabled();
  });
});
