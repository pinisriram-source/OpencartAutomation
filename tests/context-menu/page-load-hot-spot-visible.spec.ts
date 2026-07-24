// spec: specs/context-menu-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { ContextMenuPage } from './page-objects/context-menu.page';

test.describe('Initial Page State', () => {
  let contextMenuPage: ContextMenuPage;

  test.beforeEach(async ({ page }) => {
    contextMenuPage = new ContextMenuPage(page);
    await contextMenuPage.navigate();
  });

  test('TC-CONTEXTMENU-001: Verify page loads with hot spot box visible and properly styled', async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/context_menu
    // expect: The page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/context_menu');
    // expect: The page title is 'The Internet'
    await expect(page).toHaveTitle('The Internet');

    // 2. Verify the page heading
    // expect: The h3 heading displays 'Context Menu'
    await expect(contextMenuPage.pageHeading).toBeVisible();
    await expect(contextMenuPage.pageHeading).toHaveText('Context Menu');

    // 3. Verify the instructional text
    // expect: The first paragraph reads 'Context menu items are custom additions that appear in the right-click menu.'
    const paragraphs = contextMenuPage.paragraphs;
    await expect(paragraphs.nth(0)).toHaveText('Context menu items are custom additions that appear in the right-click menu.');
    // expect: The second paragraph reads 'Right-click in the box below to see one called 'the-internet'. When you click it, it will trigger a JavaScript alert.'
    await expect(paragraphs.nth(1)).toHaveText("Right-click in the box below to see one called 'the-internet'. When you click it, it will trigger a JavaScript alert.");

    // 4. Verify the hot spot box is present
    // expect: A div element with id='hot-spot' is visible on the page
    await expect(contextMenuPage.hotSpot).toBeVisible();
    
    // expect: The hot spot has a dashed border style
    await expect(contextMenuPage.hotSpot).toHaveCSS('border-style', 'dashed');
    
    // expect: The hot spot has dimensions of 250px width and 150px height
    const boundingBox = await contextMenuPage.hotSpot.boundingBox();
    expect(boundingBox?.width).toBe(250);
    expect(boundingBox?.height).toBe(150);
    
    // expect: The hot spot is positioned below the instructional text
    const paragraphBox = await paragraphs.nth(1).boundingBox();
    const hotSpotBox = await contextMenuPage.hotSpot.boundingBox();
    expect(hotSpotBox?.y).toBeGreaterThan(paragraphBox?.y ?? 0);
  });
});
