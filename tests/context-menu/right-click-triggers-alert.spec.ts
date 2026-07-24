// spec: TC-CONTEXTMENU-002
// seed: tests/seed.spec.ts

import { test, expect, Page, Dialog } from '@playwright/test';
import { ContextMenuPage } from './page-objects/context-menu.page';

test.describe('Right-Click Alert Behavior - Happy Path', () => {
  let contextMenuPage: ContextMenuPage;

  test.beforeEach(async ({ page }) => {
    contextMenuPage = new ContextMenuPage(page);
    // 1. Navigate to https://the-internet.herokuapp.com/context_menu
    await contextMenuPage.navigate();
  });

  test('TC-CONTEXTMENU-002: Right-click inside hot spot triggers alert with exact message', async ({ page }) => {
    let dialogType: string | undefined;
    let dialogMessage: string | undefined;
    let dialogAppeared = false;

    // 2. Set up dialog handler to capture alert information BEFORE triggering the action
    page.once('dialog', async (dialog: Dialog) => {
      dialogAppeared = true;
      dialogType = dialog.type();
      dialogMessage = dialog.message();
      await dialog.accept();
    });

    // 2. Right-click inside the hot spot box (div#hot-spot)
    await contextMenuPage.rightClickHotSpot();

    // Verify: A JavaScript alert dialog appeared
    expect(dialogAppeared).toBe(true);

    // Verify: The alert dialog type is 'alert' (not confirm or prompt)
    expect(dialogType).toBe('alert');

    // Verify: The alert message is exactly 'You selected a context menu' (case-sensitive, exact match)
    expect(dialogMessage).toBe('You selected a context menu');
  });
});
