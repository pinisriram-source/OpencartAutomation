import { test, expect } from '@playwright/test';
import { ContextMenuPage } from './page-objects/context-menu.page';

test.describe('Edge Cases and Additional Validation', () => {
  let contextMenuPage: ContextMenuPage;

  test.beforeEach(async ({ page }) => {
    contextMenuPage = new ContextMenuPage(page);
    await contextMenuPage.navigate();
  });

  test('TC-CONTEXTMENU-009: Right-click on the edge/border of the hot spot triggers the alert', async ({ page }) => {
    let dialogCount = 0;
    const dialogMessages: string[] = [];

    // 2. Set up dialog handler to auto-accept and track dialogs
    page.on('dialog', async (dialog) => {
      dialogCount++;
      dialogMessages.push(dialog.message());
      await dialog.accept();
    });

    // 3. Right-click on the top border edge of the hot spot box and verify alert appears
    await contextMenuPage.rightClickHotSpotEdge('top');

    // 4. Right-click on the bottom border edge and verify alert appears
    await contextMenuPage.rightClickHotSpotEdge('bottom');

    // 5. Right-click on the left border edge and verify alert appears
    await contextMenuPage.rightClickHotSpotEdge('left');

    // 6. Right-click on the right border edge and verify alert appears
    await contextMenuPage.rightClickHotSpotEdge('right');

    // 7. Verify exactly 4 dialogs were triggered
    expect(dialogCount).toBe(4);
    expect(dialogMessages).toHaveLength(4);
    
    // Verify all dialogs had the expected message
    for (const message of dialogMessages) {
      expect(message).toBe('You selected a context menu');
    }
  });
});
