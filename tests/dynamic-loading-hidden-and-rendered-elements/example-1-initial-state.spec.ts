import { test, expect } from '@playwright/test';
import { DynamicLoadingExamplePage } from './page-objects/dynamic-loading-example.page';

test.describe('Example 1 - Initial State', () => {
  let examplePage: DynamicLoadingExamplePage;

  test.beforeEach(async ({ page }) => {
    examplePage = new DynamicLoadingExamplePage(page, 1);
  });

  test('TC-DYNLOAD-002: Example 1 initial state shows Start button with no visible message or loading indicator', { tag: ['@smoke', '@regression'] }, async () => {
    await examplePage.navigate();

    await expect(examplePage.pageHeading).toHaveText('Example 1: Element on page that is hidden');
    await expect(examplePage.startButton).toBeVisible();
    await expect(examplePage.startButton).toBeEnabled();
    await expect(examplePage.helloWorldHeading).not.toBeVisible();
    await expect(examplePage.loadingText).not.toBeVisible();
    await expect(examplePage.loadingSpinner).not.toBeVisible();
  });

  test('TC-DYNLOAD-003: Example 1 has Hello World element in DOM but hidden', { tag: ['@sanity', '@regression'] }, async () => {
    await examplePage.navigate();

    await expect(examplePage.startButton).toBeVisible();
    await expect(examplePage.finishContainer).toBeAttached();
    await expect(examplePage.finishContainer).toHaveCSS('display', 'none');
    await expect(examplePage.finishContainer).toContainText('Hello World!');
  });
});
