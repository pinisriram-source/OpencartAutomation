// spec: Test plan for hovers functionality
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { HoversPage } from './page-objects/hovers.page';

test.describe('Single Image Hover - Second Avatar', () => {
  let hoversPage: HoversPage;

  test.beforeEach(async ({ page }) => {
    hoversPage = new HoversPage(page);
    await hoversPage.navigate();
  });

  test('TC-HOVERS-005: Hovering over second avatar reveals user2 caption and link', async ({ page }) => {
    // 1. Navigate to the Hovers page at https://the-internet.herokuapp.com/hovers
    await expect(hoversPage.pageHeading).toBeVisible();

    // 2. Hover mouse cursor over the second avatar image
    await hoversPage.hoverAvatar(1);

    // Verify caption overlay becomes visible for the second avatar
    await expect(hoversPage.getCaptionOverlay(1)).toBeVisible();

    // Verify caption displays 'name: user2'
    await expect(hoversPage.getCaptionHeading(1)).toBeVisible();
    await expect(hoversPage.getCaptionHeading(1)).toHaveText('name: user2');

    // Verify 'View profile' link becomes visible
    await expect(hoversPage.getViewProfileLink(1)).toBeVisible();

    // Verify 'View profile' link href points to /users/2
    await expect(hoversPage.getViewProfileLink(1)).toHaveAttribute('href', '/users/2');

    // Verify first avatar caption remains hidden
    await expect(hoversPage.getCaptionOverlay(0)).toBeHidden();

    // Verify third avatar caption remains hidden
    await expect(hoversPage.getCaptionOverlay(2)).toBeHidden();
  });

  test('TC-HOVERS-006: Moving mouse away from second avatar hides its caption', async ({ page }) => {
    // 1. Navigate to the Hovers page
    await expect(hoversPage.pageHeading).toBeVisible();

    // 2. Hover mouse cursor over the second avatar image
    await hoversPage.hoverAvatar(1);

    // Verify caption for user2 becomes visible
    await expect(hoversPage.getCaptionOverlay(1)).toBeVisible();
    await expect(hoversPage.getCaptionHeading(1)).toHaveText('name: user2');

    // 3. Move mouse cursor away from the second avatar (hover over page heading)
    await hoversPage.hoverAway();

    // Verify caption overlay for user2 is no longer visible
    await expect(hoversPage.getCaptionOverlay(1)).toBeHidden();

    // Verify 'View profile' link for user2 is no longer visible
    await expect(hoversPage.getViewProfileLink(1)).toBeHidden();

    // Verify all avatar captions are hidden
    await expect(hoversPage.getCaptionOverlay(0)).toBeHidden();
    await expect(hoversPage.getCaptionOverlay(1)).toBeHidden();
    await expect(hoversPage.getCaptionOverlay(2)).toBeHidden();
  });
});
