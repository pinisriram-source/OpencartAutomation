import { test, expect } from '@playwright/test';
import { HoversPage } from './page-objects/hovers.page';

test.describe('Initial Page State', () => {
  let hoversPage: HoversPage;

  test.beforeEach(async ({ page }) => {
    hoversPage = new HoversPage(page);
  });

  test('TC-HOVERS-001: Verify page load shows three avatar images with no visible captions', async ({ page }) => {
    // 1. Navigate to the Hovers page at https://the-internet.herokuapp.com/hovers
    await hoversPage.navigate();

    // Verify URL is https://the-internet.herokuapp.com/hovers
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/hovers');

    // 2. Inspect the page content - Verify exactly 3 avatar images are present on the page
    await expect(hoversPage.avatarImages).toHaveCount(3);

    // Verify no caption overlay is visible for any avatar
    await expect(hoversPage.getCaptionOverlay(0)).toBeHidden();
    await expect(hoversPage.getCaptionOverlay(1)).toBeHidden();
    await expect(hoversPage.getCaptionOverlay(2)).toBeHidden();

    // Verify no 'View profile' link is visible for any avatar
    await expect(hoversPage.getViewProfileLink(0)).toBeHidden();
    await expect(hoversPage.getViewProfileLink(1)).toBeHidden();
    await expect(hoversPage.getViewProfileLink(2)).toBeHidden();

    // Verify page heading 'Hovers' is displayed
    await expect(hoversPage.pageHeading).toBeVisible();
    await expect(hoversPage.pageHeading).toHaveText('Hovers');

    // Verify instruction text 'Hover over the image for additional information' is displayed
    await expect(hoversPage.instructionText).toBeVisible();
    await expect(hoversPage.instructionText).toHaveText('Hover over the image for additional information');
  });

  test('TC-HOVERS-002: Verify all three avatar images are rendered correctly', async ({ page }) => {
    // 1. Navigate to the Hovers page
    await hoversPage.navigate();

    // 2. Locate all avatar images on the page - Verify first avatar image is visible
    await expect(hoversPage.getAvatarImage(0)).toBeVisible();

    // Verify second avatar image is visible
    await expect(hoversPage.getAvatarImage(1)).toBeVisible();

    // Verify third avatar image is visible
    await expect(hoversPage.getAvatarImage(2)).toBeVisible();

    // Verify all three images have alt text 'User Avatar'
    await expect(hoversPage.getAvatarImage(0)).toHaveAttribute('alt', 'User Avatar');
    await expect(hoversPage.getAvatarImage(1)).toHaveAttribute('alt', 'User Avatar');
    await expect(hoversPage.getAvatarImage(2)).toHaveAttribute('alt', 'User Avatar');
  });
});
