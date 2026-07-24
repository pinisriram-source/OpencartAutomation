import { test, expect } from '@playwright/test';
import { HoversPage } from './page-objects/hovers.page';

test.describe('Sequential Hover Behavior', () => {
  let hoversPage: HoversPage;

  test.beforeEach(async ({ page }) => {
    hoversPage = new HoversPage(page);
    await hoversPage.navigate();
  });

  test('TC-HOVERS-009: Hovering from first to second avatar hides first caption and shows second', async ({ page }) => {
    // 1. Navigate to the Hovers page
    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/hovers');
    await expect(page).toHaveTitle('The Internet');

    // 2. Hover mouse cursor over the first avatar image
    await hoversPage.hoverAvatar(0);

    // expect: Caption for user1 becomes visible
    await expect(hoversPage.getCaptionOverlay(0)).toBeVisible();
    await expect(hoversPage.getCaptionHeading(0)).toHaveText('name: user1');

    // expect: Captions for user2 and user3 remain hidden
    await expect(hoversPage.getCaptionOverlay(1)).not.toBeVisible();
    await expect(hoversPage.getCaptionOverlay(2)).not.toBeVisible();

    // 3. Move mouse cursor to hover over the second avatar image
    await hoversPage.hoverAvatar(1);

    // expect: Caption for user1 is now hidden
    await expect(hoversPage.getCaptionOverlay(0)).not.toBeVisible();

    // expect: Caption for user2 becomes visible
    await expect(hoversPage.getCaptionOverlay(1)).toBeVisible();
    await expect(hoversPage.getCaptionHeading(1)).toHaveText('name: user2');

    // expect: Caption for user3 remains hidden
    await expect(hoversPage.getCaptionOverlay(2)).not.toBeVisible();

    // expect: Only one caption is visible at a time
    await expect(hoversPage.getCaptionOverlay(0)).not.toBeVisible();
    await expect(hoversPage.getCaptionOverlay(1)).toBeVisible();
    await expect(hoversPage.getCaptionOverlay(2)).not.toBeVisible();
  });

  test('TC-HOVERS-010: Hovering from second to third avatar hides second caption and shows third', async ({ page }) => {
    // 1. Navigate to the Hovers page
    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/hovers');
    await expect(page).toHaveTitle('The Internet');

    // 2. Hover mouse cursor over the second avatar image
    await hoversPage.hoverAvatar(1);

    // expect: Caption for user2 becomes visible
    await expect(hoversPage.getCaptionOverlay(1)).toBeVisible();
    await expect(hoversPage.getCaptionHeading(1)).toHaveText('name: user2');

    // expect: Captions for user1 and user3 remain hidden
    await expect(hoversPage.getCaptionOverlay(0)).not.toBeVisible();
    await expect(hoversPage.getCaptionOverlay(2)).not.toBeVisible();

    // 3. Move mouse cursor to hover over the third avatar image
    await hoversPage.hoverAvatar(2);

    // expect: Caption for user2 is now hidden
    await expect(hoversPage.getCaptionOverlay(1)).not.toBeVisible();

    // expect: Caption for user3 becomes visible
    await expect(hoversPage.getCaptionOverlay(2)).toBeVisible();
    await expect(hoversPage.getCaptionHeading(2)).toHaveText('name: user3');

    // expect: Caption for user1 remains hidden
    await expect(hoversPage.getCaptionOverlay(0)).not.toBeVisible();

    // expect: Only one caption is visible at a time
    await expect(hoversPage.getCaptionOverlay(0)).not.toBeVisible();
    await expect(hoversPage.getCaptionOverlay(1)).not.toBeVisible();
    await expect(hoversPage.getCaptionOverlay(2)).toBeVisible();
  });

  test('TC-HOVERS-011: Hovering from third to first avatar hides third caption and shows first', async ({ page }) => {
    // 1. Navigate to the Hovers page
    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/hovers');
    await expect(page).toHaveTitle('The Internet');

    // 2. Hover mouse cursor over the third avatar image
    await hoversPage.hoverAvatar(2);

    // expect: Caption for user3 becomes visible
    await expect(hoversPage.getCaptionOverlay(2)).toBeVisible();
    await expect(hoversPage.getCaptionHeading(2)).toHaveText('name: user3');

    // expect: Captions for user1 and user2 remain hidden
    await expect(hoversPage.getCaptionOverlay(0)).not.toBeVisible();
    await expect(hoversPage.getCaptionOverlay(1)).not.toBeVisible();

    // 3. Move mouse cursor to hover over the first avatar image
    await hoversPage.hoverAvatar(0);

    // expect: Caption for user3 is now hidden
    await expect(hoversPage.getCaptionOverlay(2)).not.toBeVisible();

    // expect: Caption for user1 becomes visible
    await expect(hoversPage.getCaptionOverlay(0)).toBeVisible();
    await expect(hoversPage.getCaptionHeading(0)).toHaveText('name: user1');

    // expect: Caption for user2 remains hidden
    await expect(hoversPage.getCaptionOverlay(1)).not.toBeVisible();

    // expect: Only one caption is visible at a time
    await expect(hoversPage.getCaptionOverlay(0)).toBeVisible();
    await expect(hoversPage.getCaptionOverlay(1)).not.toBeVisible();
    await expect(hoversPage.getCaptionOverlay(2)).not.toBeVisible();
  });

  test('TC-HOVERS-012: Hovering all three avatars in sequence shows only one caption at a time', async ({ page }) => {
    // 1. Navigate to the Hovers page
    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/hovers');
    await expect(page).toHaveTitle('The Internet');

    // expect: No captions are visible
    await expect(hoversPage.getCaptionOverlay(0)).not.toBeVisible();
    await expect(hoversPage.getCaptionOverlay(1)).not.toBeVisible();
    await expect(hoversPage.getCaptionOverlay(2)).not.toBeVisible();

    // 2. Hover over first avatar
    await hoversPage.hoverAvatar(0);

    // expect: Only user1 caption is visible
    await expect(hoversPage.getCaptionOverlay(0)).toBeVisible();
    await expect(hoversPage.getCaptionHeading(0)).toHaveText('name: user1');
    await expect(hoversPage.getCaptionOverlay(1)).not.toBeVisible();
    await expect(hoversPage.getCaptionOverlay(2)).not.toBeVisible();

    // 3. Hover over second avatar
    await hoversPage.hoverAvatar(1);

    // expect: Only user2 caption is visible
    await expect(hoversPage.getCaptionOverlay(0)).not.toBeVisible();
    await expect(hoversPage.getCaptionOverlay(1)).toBeVisible();
    await expect(hoversPage.getCaptionHeading(1)).toHaveText('name: user2');
    await expect(hoversPage.getCaptionOverlay(2)).not.toBeVisible();

    // 4. Hover over third avatar
    await hoversPage.hoverAvatar(2);

    // expect: Only user3 caption is visible
    await expect(hoversPage.getCaptionOverlay(0)).not.toBeVisible();
    await expect(hoversPage.getCaptionOverlay(1)).not.toBeVisible();
    await expect(hoversPage.getCaptionOverlay(2)).toBeVisible();
    await expect(hoversPage.getCaptionHeading(2)).toHaveText('name: user3');

    // 5. Move mouse away from all avatars
    await hoversPage.hoverAway();

    // expect: No captions are visible
    await expect(hoversPage.getCaptionOverlay(0)).not.toBeVisible();
    await expect(hoversPage.getCaptionOverlay(1)).not.toBeVisible();
    await expect(hoversPage.getCaptionOverlay(2)).not.toBeVisible();
  });
});
