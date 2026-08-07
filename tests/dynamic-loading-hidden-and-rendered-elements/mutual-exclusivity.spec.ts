import { test, expect } from '@playwright/test';
import { DynamicLoadingExamplePage } from './page-objects/dynamic-loading-example.page';

test.describe('Mutual Exclusivity - State Transitions', () => {
  test('TC-DYNLOAD-012: Example 1 shows exactly one state at any moment - Start OR Loading OR Message', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
    const examplePage = new DynamicLoadingExamplePage(page, 1);
    await examplePage.navigate();

    // State 1: Start visible, Loading hidden, Message hidden
    await expect(examplePage.startButton).toBeVisible();
    await expect(examplePage.loadingText).not.toBeVisible();
    await expect(examplePage.helloWorldHeading).not.toBeVisible();

    await examplePage.clickStart();

    // State 2: Start hidden, Loading visible, Message hidden
    await expect(examplePage.startButton).not.toBeVisible();
    await expect(examplePage.loadingText).toBeVisible();
    await expect(examplePage.helloWorldHeading).not.toBeVisible();

    await examplePage.waitForHelloWorld();

    // State 3: Start hidden, Loading hidden, Message visible
    await expect(examplePage.startButton).not.toBeVisible();
    await expect(examplePage.loadingText).not.toBeVisible();
    await expect(examplePage.helloWorldHeading).toBeVisible();
  });

  test('TC-DYNLOAD-013: Example 2 shows exactly one state at any moment - Start OR Loading OR Message', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    const examplePage = new DynamicLoadingExamplePage(page, 2);
    await examplePage.navigate();

    // State 1: Start visible, Loading hidden, Message hidden
    await expect(examplePage.startButton).toBeVisible();
    await expect(examplePage.loadingText).not.toBeVisible();
    await expect(examplePage.helloWorldHeading).not.toBeVisible();

    await examplePage.clickStart();

    // State 2: Start hidden, Loading visible, Message hidden
    await expect(examplePage.startButton).not.toBeVisible();
    await expect(examplePage.loadingText).toBeVisible();
    await expect(examplePage.helloWorldHeading).not.toBeVisible();

    await examplePage.waitForHelloWorld();

    // State 3: Start hidden, Loading hidden, Message visible
    await expect(examplePage.startButton).not.toBeVisible();
    await expect(examplePage.loadingText).not.toBeVisible();
    await expect(examplePage.helloWorldHeading).toBeVisible();
  });

  test('TC-DYNLOAD-014: Loading indicator and Hello World message are never visible simultaneously on Example 1', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    const examplePage = new DynamicLoadingExamplePage(page, 1);
    await examplePage.navigate();
    await examplePage.clickStart();

    await expect(examplePage.loadingText).toBeVisible();

    let bothVisible = false;
    while (await examplePage.loadingText.isVisible()) {
      const helloVisible = await examplePage.helloWorldHeading.isVisible();
      if (helloVisible) {
        bothVisible = true;
        break;
      }
      await page.waitForTimeout(100);
    }

    expect(bothVisible).toBe(false);
  });

  test('TC-DYNLOAD-015: Loading indicator and Hello World message are never visible simultaneously on Example 2', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    const examplePage = new DynamicLoadingExamplePage(page, 2);
    await examplePage.navigate();
    await examplePage.clickStart();

    await expect(examplePage.loadingText).toBeVisible();

    let bothVisible = false;
    while (await examplePage.loadingText.isVisible()) {
      const helloVisible = await examplePage.helloWorldHeading.isVisible();
      if (helloVisible) {
        bothVisible = true;
        break;
      }
      await page.waitForTimeout(100);
    }

    expect(bothVisible).toBe(false);
  });
});
