// spec: TC-CONTEXTMENU-005
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { ContextMenuPage } from './page-objects/context-menu.page';

test.describe('Negative Cases and Boundary Conditions', () => {
  let contextMenuPage: ContextMenuPage;

  test.beforeEach(async ({ page }) => {
    contextMenuPage = new ContextMenuPage(page);
    await contextMenuPage.navigate();
  });

  test('TC-CONTEXTMENU-005: Right-clicking outside the hot spot does NOT trigger the alert', async ({ page }) => {
    // Setup dialog listener to detect any alerts
    let dialogAppeared = false;
    page.on('dialog', async (dialog) => {
      dialogAppeared = true;
      await dialog.dismiss();
    });

    // 1. Navigate to https://the-internet.herokuapp.com/context_menu
    // (Already done in beforeEach via contextMenuPage.navigate())
    await expect(contextMenuPage.pageHeading).toBeVisible();

    // 2. Right-click on an area of the page outside the hot spot box (e.g., on the heading or instructional text)
    await contextMenuPage.pageHeading.click({
      button: 'right'
    });

    // Wait briefly to ensure no alert dialog appears
    await page.waitForTimeout(500);

    // Verify no JavaScript alert dialog appears
    expect(dialogAppeared).toBe(false);

    // 3. Right-click on another area outside the hot spot (e.g., empty space to the right of the hot spot)
    // Calculate position to the right of the hot spot
    const hotSpotBox = await contextMenuPage.hotSpot.boundingBox();
    if (hotSpotBox) {
      await page.mouse.click(
        hotSpotBox.x + hotSpotBox.width + 50,
        hotSpotBox.y + hotSpotBox.height / 2,
        { button: 'right' }
      );
    }

    // Wait briefly to ensure no alert dialog appears
    await page.waitForTimeout(500);

    // Verify no JavaScript alert dialog appears
    expect(dialogAppeared).toBe(false);
  });
});
