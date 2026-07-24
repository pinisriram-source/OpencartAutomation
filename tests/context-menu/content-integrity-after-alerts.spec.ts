// spec: TC-CONTEXTMENU-008
// seed: tests/seed.spec.ts

import { test, expect, Dialog } from '@playwright/test';
import { ContextMenuPage } from './page-objects/context-menu.page';

test.describe('Negative Cases and Boundary Conditions', () => {
  let contextMenuPage: ContextMenuPage;

  test.beforeEach(async ({ page }) => {
    contextMenuPage = new ContextMenuPage(page);
    await contextMenuPage.navigate();
  });

  test('TC-CONTEXTMENU-008: Page content remains intact after multiple alert dismiss cycles', async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/context_menu and capture initial page state
    // Verify: The page heading is 'Context Menu'
    await expect(contextMenuPage.pageHeading).toBeVisible();
    await expect(contextMenuPage.pageHeading).toHaveText('Context Menu');

    // Verify: There are 2 instructional paragraphs
    await expect(contextMenuPage.paragraphs).toHaveCount(2);
    const initialParagraphTexts = await contextMenuPage.paragraphs.allTextContents();

    // Verify: The hot spot box exists with proper styling
    await expect(contextMenuPage.hotSpot).toBeVisible();
    const initialHotSpotBox = await contextMenuPage.hotSpot.boundingBox();
    expect(initialHotSpotBox?.width).toBe(250);
    expect(initialHotSpotBox?.height).toBe(150);
    
    const initialBorderStyle = await contextMenuPage.hotSpot.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        borderStyle: style.borderStyle,
        borderWidth: style.borderWidth
      };
    });
    expect(initialBorderStyle.borderStyle).toBe('dashed');

    // Capture initial URL
    const initialUrl = page.url();
    expect(initialUrl).toBe('https://the-internet.herokuapp.com/context_menu');

    // 2. Right-click inside the hot spot and dismiss the alert (repeat 5 times)
    let dialogCounter = 0;

    // Set up dialog handler to auto-accept all dialogs
    page.on('dialog', async (dialog: Dialog) => {
      dialogCounter++;
      await dialog.accept();
    });

    // Trigger 5 right-clicks
    for (let i = 0; i < 5; i++) {
      await contextMenuPage.rightClickHotSpot();
      // Brief wait to allow dialog to be handled
      await page.waitForTimeout(100);
    }

    // Verify: Each right-click triggered the alert successfully (exactly 5 dialogs)
    expect(dialogCounter).toBe(5);

    // 3. Verify the page content after multiple alert cycles
    // Verify: The page heading is still 'Context Menu'
    await expect(contextMenuPage.pageHeading).toBeVisible();
    await expect(contextMenuPage.pageHeading).toHaveText('Context Menu');

    // Verify: The 2 instructional paragraphs are still present with unchanged text
    await expect(contextMenuPage.paragraphs).toHaveCount(2);
    const finalParagraphTexts = await contextMenuPage.paragraphs.allTextContents();
    expect(finalParagraphTexts).toEqual(initialParagraphTexts);

    // Verify: The hot spot box still exists with the same styling (dashed border, 250x150 dimensions)
    await expect(contextMenuPage.hotSpot).toBeVisible();
    const finalHotSpotBox = await contextMenuPage.hotSpot.boundingBox();
    expect(finalHotSpotBox?.width).toBe(250);
    expect(finalHotSpotBox?.height).toBe(150);

    const finalBorderStyle = await contextMenuPage.hotSpot.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        borderStyle: style.borderStyle,
        borderWidth: style.borderWidth
      };
    });
    expect(finalBorderStyle.borderStyle).toBe('dashed');
    expect(finalBorderStyle.borderWidth).toBe(initialBorderStyle.borderWidth);

    // Verify: The hot spot is still interactive and responds to right-click
    let finalDialogTriggered = false;
    page.once('dialog', async (dialog: Dialog) => {
      finalDialogTriggered = true;
      await dialog.accept();
    });
    await contextMenuPage.rightClickHotSpot();
    await page.waitForTimeout(100);
    expect(finalDialogTriggered).toBe(true);

    // Verify: The URL is still https://the-internet.herokuapp.com/context_menu
    expect(page.url()).toBe(initialUrl);

    // Verify: No DOM elements have been added, removed, or modified
    const finalHeadingCount = await page.locator('h3').count();
    const finalContentElementCount = await page.locator('#content > *').count();
    expect(finalHeadingCount).toBe(1);
    expect(finalContentElementCount).toBeGreaterThanOrEqual(3); // heading + 2 paragraphs + hot-spot
  });
});
