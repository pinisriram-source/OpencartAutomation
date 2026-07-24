// spec: TC-CONTEXTMENU-004
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

  test('TC-CONTEXTMENU-004: Right-clicking hot spot repeatedly triggers alert each time (repeatable behavior)', async ({ page }) => {
    const triggerAndCapture = async (): Promise<string | undefined> => {
      let message: string | undefined;
      page.once('dialog', async (dialog: Dialog) => {
        message = dialog.message();
        await dialog.accept();
      });
      await contextMenuPage.rightClickHotSpot();
      return message;
    };

    // 2. Right-click inside the hot spot box (first time)
    // expect: A JavaScript alert appears with message 'You selected a context menu'
    const firstMessage = await triggerAndCapture();
    expect(firstMessage).toBe('You selected a context menu');

    // 4. Right-click inside the hot spot box (second time)
    // expect: A JavaScript alert appears again with the same message
    const secondMessage = await triggerAndCapture();
    expect(secondMessage).toBe('You selected a context menu');

    // 6. Right-click inside the hot spot box (third time)
    // expect: The behavior is consistent and repeatable
    const thirdMessage = await triggerAndCapture();
    expect(thirdMessage).toBe('You selected a context menu');
  });
});
