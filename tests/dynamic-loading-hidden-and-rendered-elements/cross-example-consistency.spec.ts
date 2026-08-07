import { test, expect } from '@playwright/test';
import { DynamicLoadingExamplePage } from './page-objects/dynamic-loading-example.page';

test.describe('Cross-Example Consistency', () => {
  test('TC-DYNLOAD-024: Both examples produce identical Hello World message text and styling', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
    const example1 = new DynamicLoadingExamplePage(page, 1);
    await example1.navigate();
    await example1.clickStart();
    await example1.waitForHelloWorld();

    await expect(example1.helloWorldHeading).toBeVisible();
    const text1 = await example1.helloWorldHeading.textContent();
    const tagName1 = await example1.helloWorldHeading.evaluate(el => el.tagName.toLowerCase());
    const styles1 = await example1.helloWorldHeading.evaluate(el => {
      const cs = window.getComputedStyle(el);
      return { fontSize: cs.fontSize, color: cs.color, fontWeight: cs.fontWeight };
    });

    expect(text1).toBe('Hello World!');
    expect(tagName1).toBe('h4');

    const example2 = new DynamicLoadingExamplePage(page, 2);
    await example2.navigate();
    await example2.clickStart();
    await example2.waitForHelloWorld();

    await expect(example2.helloWorldHeading).toBeVisible();
    const text2 = await example2.helloWorldHeading.textContent();
    const tagName2 = await example2.helloWorldHeading.evaluate(el => el.tagName.toLowerCase());
    const styles2 = await example2.helloWorldHeading.evaluate(el => {
      const cs = window.getComputedStyle(el);
      return { fontSize: cs.fontSize, color: cs.color, fontWeight: cs.fontWeight };
    });

    expect(text2).toBe('Hello World!');
    expect(tagName2).toBe('h4');
    expect(styles2).toEqual(styles1);
  });

  test('TC-DYNLOAD-025: Both examples show identical loading indicator during loading phase', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    const example1 = new DynamicLoadingExamplePage(page, 1);
    await example1.navigate();
    await example1.clickStart();

    await expect(example1.loadingText).toBeVisible();
    await expect(example1.loadingSpinner).toBeVisible();

    const loadingHtml1 = await example1.loadingContainer.innerHTML();

    await example1.waitForHelloWorld();

    const example2 = new DynamicLoadingExamplePage(page, 2);
    await example2.navigate();
    await example2.clickStart();

    await expect(example2.loadingText).toBeVisible();
    await expect(example2.loadingSpinner).toBeVisible();

    const loadingHtml2 = await example2.loadingContainer.innerHTML();

    expect(loadingHtml2).toBe(loadingHtml1);
  });

  test('TC-DYNLOAD-026: Both examples have approximately same loading duration', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    const example1 = new DynamicLoadingExamplePage(page, 1);
    await example1.navigate();
    await expect(example1.startButton).toBeVisible();

    const start1 = Date.now();
    await example1.clickStart();
    await example1.waitForHelloWorld();
    const duration1 = Date.now() - start1;

    expect(duration1).toBeGreaterThan(4000);
    expect(duration1).toBeLessThan(6000);

    const example2 = new DynamicLoadingExamplePage(page, 2);
    await example2.navigate();
    await expect(example2.startButton).toBeVisible();

    const start2 = Date.now();
    await example2.clickStart();
    await example2.waitForHelloWorld();
    const duration2 = Date.now() - start2;

    expect(duration2).toBeGreaterThan(4000);
    expect(duration2).toBeLessThan(6000);
    expect(Math.abs(duration1 - duration2)).toBeLessThan(1000);
  });

  test('TC-DYNLOAD-027: Both examples use the same Start button text and styling', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    const example1 = new DynamicLoadingExamplePage(page, 1);
    await example1.navigate();
    await expect(example1.startButton).toBeVisible();

    const buttonText1 = await example1.startButton.textContent();
    const tagName1 = await example1.startButton.evaluate(el => el.tagName.toLowerCase());

    expect(buttonText1?.trim()).toBe('Start');
    expect(tagName1).toBe('button');

    const example2 = new DynamicLoadingExamplePage(page, 2);
    await example2.navigate();
    await expect(example2.startButton).toBeVisible();

    const buttonText2 = await example2.startButton.textContent();
    const tagName2 = await example2.startButton.evaluate(el => el.tagName.toLowerCase());

    expect(buttonText2?.trim()).toBe('Start');
    expect(tagName2).toBe('button');
  });
});
