// spec: specs/hovers-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { HoversPage } from './page-objects/hovers.page';

test.describe('Negative and Boundary Tests', () => {
  let hoversPage: HoversPage;

  test.beforeEach(async ({ page }) => {
    hoversPage = new HoversPage(page);
    await hoversPage.navigate();
  });

  test('TC-HOVERS-016: Hovering over page does not trigger navigation', async ({ page }) => {
    // 1. Navigate to the Hovers page
    // expect: Page loads successfully
    await expect(page).toHaveTitle('The Internet');
    // expect: URL is https://the-internet.herokuapp.com/hovers
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/hovers');

    // 2. Hover over the first avatar image
    await hoversPage.hoverAvatar(0);
    // expect: Caption becomes visible
    await expect(hoversPage.getCaptionOverlay(0)).toBeVisible();

    // 3. Wait 2 seconds while hovering
    await page.waitForTimeout(2000);
    // expect: Page does not navigate
    // expect: URL remains https://the-internet.herokuapp.com/hovers
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/hovers');
    // expect: No page reload occurs
    await expect(hoversPage.pageHeading).toBeVisible();

    // 4. Hover over the second avatar image
    await hoversPage.hoverAvatar(1);
    // expect: Page does not navigate
    // expect: URL remains https://the-internet.herokuapp.com/hovers
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/hovers');

    // 5. Hover over the third avatar image
    await hoversPage.hoverAvatar(2);
    // expect: Page does not navigate
    // expect: URL remains https://the-internet.herokuapp.com/hovers
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/hovers');
  });

  test('TC-HOVERS-017: Caption remains hidden when hovering outside avatar area', async ({ page }) => {
    // 1. Navigate to the Hovers page
    // expect: Page loads successfully
    await expect(page).toHaveTitle('The Internet');

    // 2. Hover over the page heading 'Hovers'
    await hoversPage.pageHeading.hover();
    // expect: No caption overlays are visible
    await expect(hoversPage.getCaptionOverlay(0)).not.toBeVisible();
    await expect(hoversPage.getCaptionOverlay(1)).not.toBeVisible();
    await expect(hoversPage.getCaptionOverlay(2)).not.toBeVisible();

    // 3. Hover over the instruction text
    await hoversPage.instructionText.hover();
    // expect: No caption overlays are visible
    await expect(hoversPage.getCaptionOverlay(0)).not.toBeVisible();
    await expect(hoversPage.getCaptionOverlay(1)).not.toBeVisible();
    await expect(hoversPage.getCaptionOverlay(2)).not.toBeVisible();

    // 4. Hover over the area between the first and second avatar (use page body or other non-avatar element)
    await page.locator('body').hover({ position: { x: 1, y: 1 } });
    // expect: No caption overlays are visible
    await expect(hoversPage.getCaptionOverlay(0)).not.toBeVisible();
    await expect(hoversPage.getCaptionOverlay(1)).not.toBeVisible();
    await expect(hoversPage.getCaptionOverlay(2)).not.toBeVisible();

    // 5. Hover over the footer area
    await page.locator('#page-footer').hover();
    // expect: No caption overlays are visible
    await expect(hoversPage.getCaptionOverlay(0)).not.toBeVisible();
    await expect(hoversPage.getCaptionOverlay(1)).not.toBeVisible();
    await expect(hoversPage.getCaptionOverlay(2)).not.toBeVisible();
  });

  test('TC-HOVERS-018: Rapid hover changes show correct caption without delay', async ({ page }) => {
    // 1. Navigate to the Hovers page
    // expect: Page loads successfully
    await expect(page).toHaveTitle('The Internet');

    // 2. Rapidly hover over first avatar then second avatar then third avatar in quick succession (no waits between)
    await hoversPage.hoverAvatar(0);
    // expect: Each caption appears correctly when its avatar is hovered
    await expect(hoversPage.getCaptionOverlay(0)).toBeVisible();

    await hoversPage.hoverAvatar(1);
    // expect: Previous caption hides when moving to next avatar
    await expect(hoversPage.getCaptionOverlay(0)).not.toBeVisible();
    await expect(hoversPage.getCaptionOverlay(1)).toBeVisible();

    await hoversPage.hoverAvatar(2);
    // expect: No captions overlap or display incorrectly
    await expect(hoversPage.getCaptionOverlay(1)).not.toBeVisible();
    // expect: Final hover on third avatar shows user3 caption
    await expect(hoversPage.getCaptionOverlay(2)).toBeVisible();
    await expect(hoversPage.getCaptionHeading(2)).toHaveText('name: user3');
  });

  test('TC-HOVERS-019: Caption hides correctly when mouse leaves page viewport while hovering', async ({ page }) => {
    // 1. Navigate to the Hovers page
    // expect: Page loads successfully
    await expect(page).toHaveTitle('The Internet');

    // 2. Hover over the first avatar image
    await hoversPage.hoverAvatar(0);
    // expect: Caption for user1 becomes visible
    await expect(hoversPage.getCaptionOverlay(0)).toBeVisible();

    // 3. Move mouse cursor outside the browser viewport (move to coordinates like -10, -10 or use page.mouse.move with coordinates outside viewport)
    await page.mouse.move(-10, -10);
    // expect: Caption for user1 hides
    await expect(hoversPage.getCaptionOverlay(0)).not.toBeVisible();
    // expect: No captions remain visible
    await expect(hoversPage.getCaptionOverlay(1)).not.toBeVisible();
    await expect(hoversPage.getCaptionOverlay(2)).not.toBeVisible();
  });

  test('TC-HOVERS-020: View profile link is not clickable when caption is hidden', async ({ page }) => {
    // 1. Navigate to the Hovers page
    // expect: Page loads successfully
    await expect(page).toHaveTitle('The Internet');
    // expect: No captions are visible
    await expect(hoversPage.getCaptionOverlay(0)).not.toBeVisible();
    await expect(hoversPage.getCaptionOverlay(1)).not.toBeVisible();
    await expect(hoversPage.getCaptionOverlay(2)).not.toBeVisible();

    // 2. Attempt to locate the 'View profile' link for user1 in the DOM
    const viewProfileLink = hoversPage.getViewProfileLink(0);
    // expect: Link element exists in DOM but is not visible (use toBeAttached() + toBeHidden())
    await expect(viewProfileLink).toBeAttached();
    await expect(viewProfileLink).toBeHidden();
    // expect: Link is not interactable in its hidden state
    await expect(viewProfileLink).not.toBeVisible();

    // 3. Verify attempting to click the hidden link area has no effect
    const initialUrl = page.url();
    try {
      await viewProfileLink.click({ force: true, timeout: 1000 });
    } catch (error) {
      // Click may fail or succeed but shouldn't navigate
    }
    // expect: Page does not navigate
    // expect: URL remains https://the-internet.herokuapp.com/hovers
    await expect(page).toHaveURL(initialUrl);
    // expect: No error occurs (use try-catch or force:true click then verify URL unchanged)
    await expect(hoversPage.pageHeading).toBeVisible();
  });
});
