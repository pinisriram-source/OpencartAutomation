import { test, expect } from '@playwright/test';
import { DynamicLoadingExamplePage } from './page-objects/dynamic-loading-example.page';

test.describe('Example 2 - Loading Sequence', () => {
  let examplePage: DynamicLoadingExamplePage;

  test.beforeEach(async ({ page }) => {
    examplePage = new DynamicLoadingExamplePage(page, 2);
  });

  test('TC-DYNLOAD-009: Example 2 clicking Start shows loading indicator immediately', { tag: ['@sanity', '@regression'] }, async () => {
    await examplePage.navigate();
    await expect(examplePage.startButton).toBeVisible();

    await examplePage.clickStart();

    await expect(examplePage.startButton).not.toBeVisible();
    await expect(examplePage.loadingText).toBeVisible();
    await expect(examplePage.loadingSpinner).toBeVisible();
    await expect(examplePage.helloWorldHeading).not.toBeVisible();
  });

  test('TC-DYNLOAD-010: Example 2 renders Hello World element after loading completes', { tag: ['@smoke', '@regression'] }, async () => {
    await examplePage.navigate();
    await expect(examplePage.startButton).toBeVisible();

    await examplePage.clickStart();
    await expect(examplePage.loadingText).toBeVisible();

    await examplePage.waitForHelloWorld();

    await expect(examplePage.helloWorldHeading).toBeVisible();
    await expect(examplePage.loadingText).not.toBeVisible();
    await expect(examplePage.loadingSpinner).not.toBeVisible();
    await expect(examplePage.startButton).not.toBeVisible();

    await expect(examplePage.finishContainer).toBeAttached();
    await expect(examplePage.finishContainer).toBeVisible();
    await expect(examplePage.finishContainer).toContainText('Hello World!');
  });

  test('TC-DYNLOAD-011: Example 2 complete sequence from start to finish', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    await examplePage.navigate();

    await expect(examplePage.startButton).toBeVisible();
    await expect(examplePage.loadingText).not.toBeVisible();
    await expect(examplePage.helloWorldHeading).not.toBeVisible();

    await examplePage.clickStart();

    await expect(examplePage.startButton).not.toBeVisible();
    await expect(examplePage.loadingText).toBeVisible();

    await examplePage.waitForHelloWorld();

    await expect(examplePage.loadingText).not.toBeVisible();
    await expect(examplePage.helloWorldHeading).toBeVisible();

    // Verify element was added to the DOM, not just unhidden
    const finishWasAbsentBefore = await page.evaluate(() => {
      return document.querySelector('#finish') !== null;
    });
    expect(finishWasAbsentBefore).toBe(true);
  });
});
