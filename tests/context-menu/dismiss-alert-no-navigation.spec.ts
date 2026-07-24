// spec: TC-CONTEXTMENU-003
// seed: tests/seed.spec.ts

import { test, expect, Dialog } from '@playwright/test';
import { ContextMenuPage } from './page-objects/context-menu.page';

test.describe('Right-Click Alert Behavior - Happy Path', () => {
  let contextMenuPage: ContextMenuPage;

  test.beforeEach(async ({ page }) => {
    contextMenuPage = new ContextMenuPage(page);
    // 1. Navigate to https://the-internet.herokuapp.com/context_menu
    await contextMenuPage.navigate();
  });

  test('TC-CONTEXTMENU-003: Dismissing the alert leaves page in normal state with no navigation', async ({ page }) => {
    // 2. Right-click inside the hot spot box to trigger the alert
    // 3. Accept/dismiss the alert dialog
    page.once('dialog', async (dialog: Dialog) => {
      await dialog.accept();
    });
    await contextMenuPage.rightClickHotSpot();

    // 4. Verify the page state after alert dismissal
    // expect: The URL remains unchanged (no navigation occurred)
    await expect(page).toHaveURL(contextMenuPage.url);

    // expect: The page title is still 'The Internet'
    await expect(page).toHaveTitle('The Internet');

    // expect: The hot spot box is still visible and interactive
    await expect(contextMenuPage.hotSpot).toBeVisible();

    // expect: The page heading 'Context Menu' is still present
    await expect(contextMenuPage.pageHeading).toBeVisible();

    // expect: The instructional paragraphs are still present
    await expect(contextMenuPage.paragraphs.first()).toBeVisible();
  });
});
