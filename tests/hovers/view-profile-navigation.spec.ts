import { test, expect } from '@playwright/test';
import { HoversPage } from './page-objects/hovers.page';

test.describe('Navigation via View Profile Links', () => {
  let hoversPage: HoversPage;

  test.beforeEach(async ({ page }) => {
    hoversPage = new HoversPage(page);
  });

  test('TC-HOVERS-013: Clicking View profile link for user1 navigates to /users/1', async ({ page }) => {
    // 1. Navigate to the Hovers page
    await hoversPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/hovers');
    await expect(page).toHaveTitle('The Internet');

    // 2. Hover mouse cursor over the first avatar image
    await hoversPage.hoverAvatar(0);

    // expect: Caption for user1 becomes visible
    await expect(hoversPage.getCaptionOverlay(0)).toBeVisible();
    await expect(hoversPage.getCaptionHeading(0)).toHaveText('name: user1');

    // expect: 'View profile' link is visible
    await expect(hoversPage.getViewProfileLink(0)).toBeVisible();

    // 3. Click the 'View profile' link for user1
    await hoversPage.getViewProfileLink(0).click();

    // expect: Browser navigates to https://the-internet.herokuapp.com/users/1
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/users/1');

    // expect: Navigation completes successfully
    await expect(page).toHaveTitle('The Internet');
  });

  test('TC-HOVERS-014: Clicking View profile link for user2 navigates to /users/2', async ({ page }) => {
    // 1. Navigate to the Hovers page
    await hoversPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/hovers');
    await expect(page).toHaveTitle('The Internet');

    // 2. Hover mouse cursor over the second avatar image
    await hoversPage.hoverAvatar(1);

    // expect: Caption for user2 becomes visible
    await expect(hoversPage.getCaptionOverlay(1)).toBeVisible();
    await expect(hoversPage.getCaptionHeading(1)).toHaveText('name: user2');

    // expect: 'View profile' link is visible
    await expect(hoversPage.getViewProfileLink(1)).toBeVisible();

    // 3. Click the 'View profile' link for user2
    await hoversPage.getViewProfileLink(1).click();

    // expect: Browser navigates to https://the-internet.herokuapp.com/users/2
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/users/2');

    // expect: Navigation completes successfully
    await expect(page).toHaveTitle('The Internet');
  });

  test('TC-HOVERS-015: Clicking View profile link for user3 navigates to /users/3', async ({ page }) => {
    // 1. Navigate to the Hovers page
    await hoversPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/hovers');
    await expect(page).toHaveTitle('The Internet');

    // 2. Hover mouse cursor over the third avatar image
    await hoversPage.hoverAvatar(2);

    // expect: Caption for user3 becomes visible
    await expect(hoversPage.getCaptionOverlay(2)).toBeVisible();
    await expect(hoversPage.getCaptionHeading(2)).toHaveText('name: user3');

    // expect: 'View profile' link is visible
    await expect(hoversPage.getViewProfileLink(2)).toBeVisible();

    // 3. Click the 'View profile' link for user3
    await hoversPage.getViewProfileLink(2).click();

    // expect: Browser navigates to https://the-internet.herokuapp.com/users/3
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/users/3');

    // expect: Navigation completes successfully
    await expect(page).toHaveTitle('The Internet');
  });
});
