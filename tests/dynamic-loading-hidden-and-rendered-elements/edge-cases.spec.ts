import { test, expect } from '@playwright/test';
import { DynamicLoadingExamplePage } from './page-objects/dynamic-loading-example.page';

test.describe('Edge Cases and Error Conditions', () => {
  test('TC-DYNLOAD-028: Example 1 can be successfully run multiple times in succession', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    const examplePage = new DynamicLoadingExamplePage(page, 1);
    await examplePage.navigate();
    await expect(examplePage.startButton).toBeVisible();

    await examplePage.clickStart();
    await examplePage.waitForHelloWorld();
    await expect(examplePage.helloWorldHeading).toBeVisible();

    await page.reload();
    await expect(examplePage.startButton).toBeVisible();

    await examplePage.clickStart();
    await examplePage.waitForHelloWorld();
    await expect(examplePage.helloWorldHeading).toBeVisible();
  });

  test('TC-DYNLOAD-029: Example 2 can be successfully run multiple times in succession', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    const examplePage = new DynamicLoadingExamplePage(page, 2);
    await examplePage.navigate();
    await expect(examplePage.startButton).toBeVisible();

    await examplePage.clickStart();
    await examplePage.waitForHelloWorld();
    await expect(examplePage.helloWorldHeading).toBeVisible();

    await page.reload();
    await expect(examplePage.startButton).toBeVisible();

    await examplePage.clickStart();
    await examplePage.waitForHelloWorld();
    await expect(examplePage.helloWorldHeading).toBeVisible();
  });

  test('TC-DYNLOAD-030: Example 1 handles browser back navigation correctly', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    const examplePage = new DynamicLoadingExamplePage(page, 1);
    await examplePage.navigate();
    await expect(examplePage.startButton).toBeVisible();

    await examplePage.clickStart();
    await examplePage.waitForHelloWorld();
    await expect(examplePage.helloWorldHeading).toBeVisible();

    await page.goto('https://the-internet.herokuapp.com/dynamic_loading');
    await expect(page.getByRole('heading', { name: 'Dynamically Loaded Page Elements' })).toBeVisible();

    await page.goBack();

    await expect(examplePage.startButton).toBeVisible();
    await expect(examplePage.helloWorldHeading).not.toBeVisible();
  });

  test('TC-DYNLOAD-031: Example 2 handles browser back navigation correctly', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    const examplePage = new DynamicLoadingExamplePage(page, 2);
    await examplePage.navigate();
    await expect(examplePage.startButton).toBeVisible();

    await examplePage.clickStart();
    await examplePage.waitForHelloWorld();
    await expect(examplePage.helloWorldHeading).toBeVisible();

    await page.goto('https://the-internet.herokuapp.com/dynamic_loading');
    await expect(page.getByRole('heading', { name: 'Dynamically Loaded Page Elements' })).toBeVisible();

    await page.goBack();

    await expect(examplePage.startButton).toBeVisible();
    await expect(examplePage.helloWorldHeading).not.toBeVisible();
  });

  test('TC-DYNLOAD-032: Direct URL access to examples works correctly', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    const example1 = new DynamicLoadingExamplePage(page, 1);
    await example1.navigate();

    await expect(example1.startButton).toBeVisible();
    await expect(example1.pageHeading).toHaveText('Example 1: Element on page that is hidden');

    const example2 = new DynamicLoadingExamplePage(page, 2);
    await example2.navigate();

    await expect(example2.startButton).toBeVisible();
    await expect(example2.pageHeading).toHaveText('Example 2: Element rendered after the fact');
  });
});
