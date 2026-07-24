import { test, expect } from '@playwright/test';
import { HoversPage } from './page-objects/hovers.page';

test.describe('Single Image Hover - First Avatar', () => {
  let hoversPage: HoversPage;

  test.beforeEach(async ({ page }) => {
    hoversPage = new HoversPage(page);
    await hoversPage.navigate();
  });

  test('TC-HOVERS-003: Hovering over first avatar reveals user1 caption and link', async ({ page }) => {
    // 1. Navigate to the Hovers page at https://the-internet.herokuapp.com/hovers
    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/hovers');
    await expect(page).toHaveTitle('The Internet');

    // 2. Hover mouse cursor over the first avatar image
    await hoversPage.hoverAvatar(0);

    // expect: Caption overlay becomes visible for the first avatar
    await expect(hoversPage.getCaptionOverlay(0)).toBeVisible();

    // expect: Caption displays 'name: user1'
    await expect(hoversPage.getCaptionHeading(0)).toBeVisible();
    await expect(hoversPage.getCaptionHeading(0)).toHaveText('name: user1');

    // expect: 'View profile' link becomes visible
    await expect(hoversPage.getViewProfileLink(0)).toBeVisible();

    // expect: 'View profile' link href points to /users/1
    await expect(hoversPage.getViewProfileLink(0)).toHaveAttribute('href', '/users/1');

    // expect: Second avatar caption remains hidden
    await expect(hoversPage.getCaptionOverlay(1)).not.toBeVisible();

    // expect: Third avatar caption remains hidden
    await expect(hoversPage.getCaptionOverlay(2)).not.toBeVisible();
  });

  test('TC-HOVERS-004: Moving mouse away from first avatar hides its caption', async ({ page }) => {
    // 1. Navigate to the Hovers page
    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/hovers');

    // 2. Hover mouse cursor over the first avatar image
    await hoversPage.hoverAvatar(0);

    // expect: Caption for user1 becomes visible
    await expect(hoversPage.getCaptionOverlay(0)).toBeVisible();
    await expect(hoversPage.getCaptionHeading(0)).toHaveText('name: user1');

    // 3. Move mouse cursor away from the first avatar (hover over page heading)
    await hoversPage.hoverAway();

    // expect: Caption overlay for user1 is no longer visible
    await expect(hoversPage.getCaptionOverlay(0)).not.toBeVisible();

    // expect: 'View profile' link for user1 is no longer visible
    await expect(hoversPage.getViewProfileLink(0)).not.toBeVisible();

    // expect: All avatar captions are hidden
    await expect(hoversPage.getCaptionOverlay(0)).not.toBeVisible();
    await expect(hoversPage.getCaptionOverlay(1)).not.toBeVisible();
    await expect(hoversPage.getCaptionOverlay(2)).not.toBeVisible();
  });
});
