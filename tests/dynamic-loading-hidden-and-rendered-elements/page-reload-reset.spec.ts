import { test, expect } from '@playwright/test';
import { DynamicLoadingExamplePage } from './page-objects/dynamic-loading-example.page';

test.describe('Page Reload Reset', () => {
  test('TC-DYNLOAD-016: Example 1 reloading after completion resets to initial Start button state', { tag: '@sanity' }, async ({ page }) => {
    const examplePage = new DynamicLoadingExamplePage(page, 1);
    await examplePage.navigate();
    await expect(examplePage.startButton).toBeVisible();

    await examplePage.clickStart();
    await examplePage.waitForHelloWorld();

    await expect(examplePage.helloWorldHeading).toBeVisible();
    await expect(examplePage.startButton).not.toBeVisible();
    await expect(examplePage.loadingText).not.toBeVisible();

    await page.reload();

    await expect(examplePage.startButton).toBeVisible();
    await expect(examplePage.helloWorldHeading).not.toBeVisible();
    await expect(examplePage.loadingText).not.toBeVisible();
  });

  test('TC-DYNLOAD-017: Example 2 reloading after completion resets to initial Start button state', { tag: '@functional' }, async ({ page }) => {
    const examplePage = new DynamicLoadingExamplePage(page, 2);
    await examplePage.navigate();
    await expect(examplePage.startButton).toBeVisible();

    await examplePage.clickStart();
    await examplePage.waitForHelloWorld();

    await expect(examplePage.helloWorldHeading).toBeVisible();
    await expect(examplePage.startButton).not.toBeVisible();
    await expect(examplePage.loadingText).not.toBeVisible();

    await page.reload();

    await expect(examplePage.startButton).toBeVisible();
    await expect(examplePage.helloWorldHeading).not.toBeVisible();
    await expect(examplePage.finishContainer).not.toBeAttached();
    await expect(examplePage.loadingText).not.toBeVisible();
  });

  test('TC-DYNLOAD-018: Example 1 reloading during loading resets to initial state', { tag: '@functional' }, async ({ page }) => {
    const examplePage = new DynamicLoadingExamplePage(page, 1);
    await examplePage.navigate();
    await expect(examplePage.startButton).toBeVisible();

    await examplePage.clickStart();
    await expect(examplePage.loadingText).toBeVisible();

    await page.reload();

    await expect(examplePage.startButton).toBeVisible();
    await expect(examplePage.helloWorldHeading).not.toBeVisible();
    await expect(examplePage.loadingText).not.toBeVisible();
  });

  test('TC-DYNLOAD-019: Example 2 reloading during loading resets to initial state', { tag: '@functional' }, async ({ page }) => {
    const examplePage = new DynamicLoadingExamplePage(page, 2);
    await examplePage.navigate();
    await expect(examplePage.startButton).toBeVisible();

    await examplePage.clickStart();
    await expect(examplePage.loadingText).toBeVisible();

    await page.reload();

    await expect(examplePage.startButton).toBeVisible();
    await expect(examplePage.helloWorldHeading).not.toBeVisible();
    await expect(examplePage.loadingText).not.toBeVisible();
  });
});
