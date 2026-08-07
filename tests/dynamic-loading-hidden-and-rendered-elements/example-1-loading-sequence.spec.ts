import { test, expect } from '@playwright/test';
import { DynamicLoadingExamplePage } from './page-objects/dynamic-loading-example.page';

test.describe('Example 1 - Loading Sequence', () => {
  let examplePage: DynamicLoadingExamplePage;

  test.beforeEach(async ({ page }) => {
    examplePage = new DynamicLoadingExamplePage(page, 1);
  });

  test('TC-DYNLOAD-004: Example 1 clicking Start shows loading indicator immediately', { tag: ['@sanity', '@regression'] }, async () => {
    await examplePage.navigate();
    await expect(examplePage.startButton).toBeVisible();

    await examplePage.clickStart();

    await expect(examplePage.startButton).not.toBeVisible();
    await expect(examplePage.loadingText).toBeVisible();
    await expect(examplePage.loadingSpinner).toBeVisible();
    await expect(examplePage.helloWorldHeading).not.toBeVisible();
  });

  test('TC-DYNLOAD-005: Example 1 displays Hello World message after loading completes', { tag: ['@smoke', '@regression'] }, async () => {
    await examplePage.navigate();
    await expect(examplePage.startButton).toBeVisible();

    await examplePage.clickStart();
    await expect(examplePage.loadingText).toBeVisible();

    await examplePage.waitForHelloWorld();

    await expect(examplePage.helloWorldHeading).toBeVisible();
    await expect(examplePage.loadingText).not.toBeVisible();
    await expect(examplePage.loadingSpinner).not.toBeVisible();
    await expect(examplePage.startButton).not.toBeVisible();
  });

  test('TC-DYNLOAD-006: Example 1 complete sequence from start to finish', { tag: ['@functional', '@regression'] }, async () => {
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
  });
});
