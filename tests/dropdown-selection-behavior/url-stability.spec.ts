import { test, expect } from '@playwright/test';
import { DropdownPage } from './page-objects/dropdown-page';

test.describe('URL Stability', () => {
  test('TC-DROPDOWN-009: Verify no dropdown interaction triggers page navigation or URL change', async ({ page }) => {
    const dropdownPage = new DropdownPage(page);
    const expectedUrl = 'https://the-internet.herokuapp.com/dropdown';

    // 1. Navigate to https://the-internet.herokuapp.com/dropdown
    await dropdownPage.navigate();
    await dropdownPage.verifyHeadingVisible();
    expect(page.url()).toBe(expectedUrl);

    // Set a marker on the window object to detect page reloads
    await page.evaluate(() => { (window as any)['__testMarker__'] = 'no-reload'; });

    // 2. Select 'Option 1' from the dropdown
    await dropdownPage.selectOption('1');
    await dropdownPage.verifyDropdownValue('1');
    expect(page.url()).toBe(expectedUrl);

    // Verify no page reload occurred
    const markerAfterOption1 = await page.evaluate(() => (window as any)['__testMarker__']);
    expect(markerAfterOption1).toBe('no-reload');

    // 3. Select 'Option 2' from the dropdown
    await dropdownPage.selectOption('2');
    await dropdownPage.verifyDropdownValue('2');
    expect(page.url()).toBe(expectedUrl);

    // Verify no page reload occurred
    const markerAfterOption2 = await page.evaluate(() => (window as any)['__testMarker__']);
    expect(markerAfterOption2).toBe('no-reload');

    // 4. Select 'Option 1' again
    await dropdownPage.selectOption('1');
    await dropdownPage.verifyDropdownValue('1');
    expect(page.url()).toBe(expectedUrl);

    // Verify no page reload occurred
    const markerAfterOption1Again = await page.evaluate(() => (window as any)['__testMarker__']);
    expect(markerAfterOption1Again).toBe('no-reload');

    // 5. Verify no page reload occurred during any of the above interactions
    expect(await page.title()).toBe('The Internet');
    expect(page.url()).toBe(expectedUrl);
  });
});
