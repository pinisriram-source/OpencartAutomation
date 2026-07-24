import { test, expect } from '@playwright/test';
import { HoversPage } from './page-objects/hovers.page';

test.describe('Caption Content Verification', () => {
  let hoversPage: HoversPage;

  test.beforeEach(async ({ page }) => {
    hoversPage = new HoversPage(page);
    await hoversPage.navigate();
  });

  test('TC-HOVERS-021: First avatar caption displays correct user name format', async ({ page }) => {
    // 1. Navigate to the Hovers page (done in beforeEach)
    // expect: Page loads successfully

    // 2. Hover over the first avatar image
    await hoversPage.hoverAvatar(0);
    // expect: Caption is visible
    await expect(hoversPage.getCaptionOverlay(0)).toBeVisible();

    // 3. Verify the caption text content
    // expect: Caption text exactly matches 'name: user1'
    await expect(hoversPage.getCaptionHeading(0)).toHaveText('name: user1');
    // expect: Text format uses lowercase for 'name:' and 'user1'
    // (verified by exact match above)
    
    // expect: Heading level is h5
    await expect(hoversPage.getCaptionHeading(0)).toBeVisible();
    
    // expect: 'View profile' link text is exactly 'View profile'
    await expect(hoversPage.getViewProfileLink(0)).toHaveText('View profile');
  });

  test('TC-HOVERS-022: Second avatar caption displays correct user name format', async ({ page }) => {
    // 1. Navigate to the Hovers page (done in beforeEach)
    // expect: Page loads successfully

    // 2. Hover over the second avatar image
    await hoversPage.hoverAvatar(1);
    // expect: Caption is visible
    await expect(hoversPage.getCaptionOverlay(1)).toBeVisible();

    // 3. Verify the caption text content
    // expect: Caption text exactly matches 'name: user2'
    await expect(hoversPage.getCaptionHeading(1)).toHaveText('name: user2');
    // expect: Text format uses lowercase for 'name:' and 'user2'
    // (verified by exact match above)
    
    // expect: Heading level is h5
    await expect(hoversPage.getCaptionHeading(1)).toBeVisible();
    
    // expect: 'View profile' link text is exactly 'View profile'
    await expect(hoversPage.getViewProfileLink(1)).toHaveText('View profile');
  });

  test('TC-HOVERS-023: Third avatar caption displays correct user name format', async ({ page }) => {
    // 1. Navigate to the Hovers page (done in beforeEach)
    // expect: Page loads successfully

    // 2. Hover over the third avatar image
    await hoversPage.hoverAvatar(2);
    // expect: Caption is visible
    await expect(hoversPage.getCaptionOverlay(2)).toBeVisible();

    // 3. Verify the caption text content
    // expect: Caption text exactly matches 'name: user3'
    await expect(hoversPage.getCaptionHeading(2)).toHaveText('name: user3');
    // expect: Text format uses lowercase for 'name:' and 'user3'
    // (verified by exact match above)
    
    // expect: Heading level is h5
    await expect(hoversPage.getCaptionHeading(2)).toBeVisible();
    
    // expect: 'View profile' link text is exactly 'View profile'
    await expect(hoversPage.getViewProfileLink(2)).toHaveText('View profile');
  });

  test('TC-HOVERS-024: All View profile links have correct href attributes', async ({ page }) => {
    // 1. Navigate to the Hovers page (done in beforeEach)
    // expect: Page loads successfully

    // 2. Hover over first avatar and verify link href
    await hoversPage.hoverAvatar(0);
    // expect: 'View profile' link href is '/users/1'
    await expect(hoversPage.getViewProfileLink(0)).toHaveAttribute('href', '/users/1');

    // 3. Hover over second avatar and verify link href
    await hoversPage.hoverAvatar(1);
    // expect: 'View profile' link href is '/users/2'
    await expect(hoversPage.getViewProfileLink(1)).toHaveAttribute('href', '/users/2');

    // 4. Hover over third avatar and verify link href
    await hoversPage.hoverAvatar(2);
    // expect: 'View profile' link href is '/users/3'
    await expect(hoversPage.getViewProfileLink(2)).toHaveAttribute('href', '/users/3');
  });
});
