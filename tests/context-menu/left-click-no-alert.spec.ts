// spec: TC-CONTEXTMENU-007
// seed: tests/seed.spec.ts

import { test, expect, Page, Dialog } from '@playwright/test';
import { ContextMenuPage } from './page-objects/context-menu.page';

test.describe('Negative Cases and Boundary Conditions', () => {
  let contextMenuPage: ContextMenuPage;

  test.beforeEach(async ({ page }) => {
    contextMenuPage = new ContextMenuPage(page);
    // 1. Navigate to https://the-internet.herokuapp.com/context_menu
    await contextMenuPage.navigate();
  });

  test('TC-CONTEXTMENU-007: Left-clicking inside the hot spot does NOT trigger the alert', async ({ page }) => {
    let dialogAppeared = false;

    // Set up dialog handler to track if any dialog appears
    page.on('dialog', async (dialog: Dialog) => {
      dialogAppeared = true;
      await dialog.accept();
    });

    // 2. Left-click (normal click) inside the hot spot box
    await contextMenuPage.leftClickHotSpot();

    // Wait briefly to ensure no dialog appears
    await page.waitForTimeout(500);

    // Verify: No JavaScript alert dialog appeared
    expect(dialogAppeared).toBe(false);

    // Reset the flag for double-click test
    dialogAppeared = false;

    // 3. Double-click inside the hot spot box
    await contextMenuPage.doubleClickHotSpot();

    // Wait briefly to ensure no dialog appears
    await page.waitForTimeout(500);

    // Verify: No JavaScript alert dialog appeared
    expect(dialogAppeared).toBe(false);
  });
});
