import { test, expect } from '@playwright/test';
import { DynamicLoadingExamplePage } from './page-objects/dynamic-loading-example.page';

test.describe('No Double-Start Protection', () => {
  test('TC-DYNLOAD-020: Example 1 Start button is not clickable during loading', { tag: '@sanity' }, async ({ page }) => {
    const examplePage = new DynamicLoadingExamplePage(page, 1);
    await examplePage.navigate();

    await expect(examplePage.startButton).toBeVisible();
    await expect(examplePage.startButton).toBeEnabled();

    await examplePage.clickStart();

    await expect(examplePage.startButton).not.toBeVisible();
    await expect(examplePage.loadingText).toBeVisible();

    const startButtonCount = await examplePage.startButton.count();
    expect(startButtonCount === 0 || !(await examplePage.startButton.isVisible())).toBe(true);

    await examplePage.waitForHelloWorld();
    await expect(examplePage.helloWorldHeading).toBeVisible();
  });

  test('TC-DYNLOAD-021: Example 2 Start button is not clickable during loading', { tag: '@functional' }, async ({ page }) => {
    const examplePage = new DynamicLoadingExamplePage(page, 2);
    await examplePage.navigate();

    await expect(examplePage.startButton).toBeVisible();
    await expect(examplePage.startButton).toBeEnabled();

    await examplePage.clickStart();

    await expect(examplePage.startButton).not.toBeVisible();
    await expect(examplePage.loadingText).toBeVisible();

    const startButtonCount = await examplePage.startButton.count();
    expect(startButtonCount === 0 || !(await examplePage.startButton.isVisible())).toBe(true);

    await examplePage.waitForHelloWorld();
    await expect(examplePage.helloWorldHeading).toBeVisible();
  });

  test('TC-DYNLOAD-022: Example 1 rapid clicks on Start button only trigger loading once', { tag: '@functional' }, async ({ page }) => {
    const examplePage = new DynamicLoadingExamplePage(page, 1);
    await examplePage.navigate();
    await expect(examplePage.startButton).toBeVisible();

    await examplePage.startButton.click({ clickCount: 3 });

    await expect(examplePage.loadingText).toBeVisible();

    await examplePage.waitForHelloWorld();

    const helloWorldCount = await page.locator('#finish h4').count();
    expect(helloWorldCount).toBe(1);
  });

  test('TC-DYNLOAD-023: Example 2 rapid clicks on Start button only trigger loading once', { tag: '@functional' }, async ({ page }) => {
    const examplePage = new DynamicLoadingExamplePage(page, 2);
    await examplePage.navigate();
    await expect(examplePage.startButton).toBeVisible();

    await examplePage.startButton.click({ clickCount: 3 });

    await expect(examplePage.loadingText).toBeVisible();

    await examplePage.waitForHelloWorld();

    const helloWorldCount = await page.locator('#finish h4').count();
    expect(helloWorldCount).toBe(1);
  });
});
