// spec: TC-CONTEXTMENU-006: URL remains unchanged throughout all interactions
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { ContextMenuPage } from './page-objects/context-menu.page';

test.describe('Negative Cases and Boundary Conditions', () => {
  let contextMenuPage: ContextMenuPage;

  test.beforeEach(async ({ page }) => {
    contextMenuPage = new ContextMenuPage(page);
    await contextMenuPage.navigate();
  });

  test('TC-CONTEXTMENU-006: URL remains unchanged throughout all interactions', async ({ page }) => {
    const expectedURL = 'https://the-internet.herokuapp.com/context_menu';

    // 1. Navigate to https://the-internet.herokuapp.com/context_menu
    // - expect: The initial URL is https://the-internet.herokuapp.com/context_menu
    await expect(page).toHaveURL(expectedURL);

    // Setup dialog handler to auto-accept any alerts
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    // 2. Right-click inside the hot spot to trigger the alert
    // - expect: The URL remains https://the-internet.herokuapp.com/context_menu
    await contextMenuPage.rightClickHotSpot();
    await expect(page).toHaveURL(expectedURL);

    // 3. Dismiss the alert
    // - expect: The URL remains https://the-internet.herokuapp.com/context_menu
    // (Alert is auto-dismissed by the dialog handler)
    await expect(page).toHaveURL(expectedURL);

    // 4. Right-click inside the hot spot again and dismiss the alert
    // - expect: The URL remains https://the-internet.herokuapp.com/context_menu
    await contextMenuPage.rightClickHotSpot();
    await expect(page).toHaveURL(expectedURL);

    // 5. Right-click outside the hot spot
    // - expect: The URL remains https://the-internet.herokuapp.com/context_menu
    // - expect: No navigation occurs at any point during the test
    await contextMenuPage.rightClickOutside();
    await expect(page).toHaveURL(expectedURL);
  });
});
