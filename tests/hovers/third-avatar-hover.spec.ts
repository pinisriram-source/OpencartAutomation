// spec: Test Plan - Single Image Hover - Third Avatar
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { HoversPage } from './page-objects/hovers.page';

test.describe('Single Image Hover - Third Avatar', () => {
  let hoversPage: HoversPage;

  test.beforeEach(async ({ page }) => {
    hoversPage = new HoversPage(page);
    await hoversPage.navigate();
  });

  test('TC-HOVERS-007: Hovering over third avatar reveals user3 caption and link', async ({ page }) => {
    // 1. Navigate to the Hovers page at https://the-internet.herokuapp.com/hovers
    // (Already done in beforeEach)
    await expect(hoversPage.pageHeading).toBeVisible();

    // 2. Hover mouse cursor over the third avatar image
    await hoversPage.hoverAvatar(2);

    // expect: Caption overlay becomes visible for the third avatar
    await expect(hoversPage.getCaptionOverlay(2)).toBeVisible();

    // expect: Caption displays 'name: user3'
    await expect(hoversPage.getCaptionHeading(2)).toBeVisible();
    await expect(hoversPage.getCaptionHeading(2)).toHaveText('name: user3');

    // expect: 'View profile' link becomes visible
    await expect(hoversPage.getViewProfileLink(2)).toBeVisible();

    // expect: 'View profile' link href points to /users/3
    await expect(hoversPage.getViewProfileLink(2)).toHaveAttribute('href', '/users/3');

    // expect: First avatar caption remains hidden
    await expect(hoversPage.getCaptionOverlay(0)).toBeHidden();

    // expect: Second avatar caption remains hidden
    await expect(hoversPage.getCaptionOverlay(1)).toBeHidden();
  });

  test('TC-HOVERS-008: Moving mouse away from third avatar hides its caption', async ({ page }) => {
    // 1. Navigate to the Hovers page
    // (Already done in beforeEach)
    await expect(hoversPage.pageHeading).toBeVisible();

    // 2. Hover mouse cursor over the third avatar image
    await hoversPage.hoverAvatar(2);

    // expect: Caption for user3 becomes visible
    await expect(hoversPage.getCaptionOverlay(2)).toBeVisible();
    await expect(hoversPage.getCaptionHeading(2)).toHaveText('name: user3');

    // 3. Move mouse cursor away from the third avatar (hover over page heading)
    await hoversPage.hoverAway();

    // expect: Caption overlay for user3 is no longer visible
    await expect(hoversPage.getCaptionOverlay(2)).toBeHidden();

    // expect: 'View profile' link for user3 is no longer visible
    await expect(hoversPage.getViewProfileLink(2)).toBeHidden();

    // expect: All avatar captions are hidden
    await expect(hoversPage.getCaptionOverlay(0)).toBeHidden();
    await expect(hoversPage.getCaptionOverlay(1)).toBeHidden();
    await expect(hoversPage.getCaptionOverlay(2)).toBeHidden();
  });
});
