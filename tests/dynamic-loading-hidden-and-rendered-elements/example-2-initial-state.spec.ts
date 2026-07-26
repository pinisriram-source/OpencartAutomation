import { test, expect } from '@playwright/test';
import { DynamicLoadingExamplePage } from './page-objects/dynamic-loading-example.page';

test.describe('Example 2 - Initial State', () => {
  let examplePage: DynamicLoadingExamplePage;

  test.beforeEach(async ({ page }) => {
    examplePage = new DynamicLoadingExamplePage(page, 2);
  });

  test('TC-DYNLOAD-007: Example 2 initial state shows Start button with no visible message or loading indicator', { tag: '@sanity' }, async () => {
    await examplePage.navigate();

    await expect(examplePage.pageHeading).toHaveText('Example 2: Element rendered after the fact');
    await expect(examplePage.startButton).toBeVisible();
    await expect(examplePage.startButton).toBeEnabled();
    await expect(examplePage.helloWorldHeading).not.toBeVisible();
    await expect(examplePage.loadingText).not.toBeVisible();
    await expect(examplePage.loadingSpinner).not.toBeVisible();
  });

  test('TC-DYNLOAD-008: Example 2 has no Hello World element in DOM initially', { tag: '@sanity' }, async ({ page }) => {
    await examplePage.navigate();
    await expect(examplePage.startButton).toBeVisible();

    await expect(examplePage.finishContainer).not.toBeAttached();

    // Verify no rendered Hello World element exists in the DOM (the string
    // appears inside a <script> tag but not as a rendered DOM node)
    const finishInDom = await page.evaluate(() => document.querySelector('#finish'));
    expect(finishInDom).toBeNull();
  });
});
