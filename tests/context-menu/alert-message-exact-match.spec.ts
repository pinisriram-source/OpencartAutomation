import { test, expect } from '@playwright/test';
import { ContextMenuPage } from './page-objects/context-menu.page';

test.describe('Edge Cases and Additional Validation', () => {
  let contextMenuPage: ContextMenuPage;

  test.beforeEach(async ({ page }) => {
    contextMenuPage = new ContextMenuPage(page);
    await contextMenuPage.navigate();
  });

  test('TC-CONTEXTMENU-010: Alert message is exact and case-sensitive', async ({ page }) => {
    // Capture alert message
    let alertMessage = '';
    page.on('dialog', async (dialog) => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    // 2. Right-click inside the hot spot and capture the alert message
    await contextMenuPage.rightClickHotSpot();

    // 3. Verify the alert message is exactly 'You selected a context menu' (capital Y, lowercase rest)
    expect(alertMessage).toBe('You selected a context menu');

    // 4. Verify the message has no leading or trailing whitespace
    expect(alertMessage).toBe(alertMessage.trim());

    // 5. Verify the message starts with capital Y
    expect(alertMessage[0]).toBe('Y');

    // 6. Verify the message does not end with period
    expect(alertMessage.endsWith('.')).toBe(false);
  });
});
