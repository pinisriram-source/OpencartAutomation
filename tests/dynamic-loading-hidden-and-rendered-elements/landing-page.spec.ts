import { test, expect } from '@playwright/test';
import { DynamicLoadingLandingPage } from './page-objects/landing.page';

test.describe('Landing Page', () => {
  let landingPage: DynamicLoadingLandingPage;

  test.beforeEach(async ({ page }) => {
    landingPage = new DynamicLoadingLandingPage(page);
  });

  test('TC-DYNLOAD-001: Landing page displays feature overview and links to both examples', { tag: '@sanity' }, async ({ page }) => {
    await landingPage.navigate();

    await expect(page).toHaveTitle('The Internet');
    await expect(landingPage.pageHeading).toBeVisible();
    await expect(landingPage.explanatoryText).toBeVisible();
    await expect(landingPage.example1Link).toBeVisible();
    await expect(landingPage.example2Link).toBeVisible();

    await landingPage.example1Link.click();
    await expect(page).toHaveURL(/\/dynamic_loading\/1/);
    await expect(page.getByRole('heading', { name: 'Example 1: Element on page that is hidden' })).toBeVisible();

    await page.goBack();
    await expect(landingPage.pageHeading).toBeVisible();

    await landingPage.example2Link.click();
    await expect(page).toHaveURL(/\/dynamic_loading\/2/);
    await expect(page.getByRole('heading', { name: 'Example 2: Element rendered after the fact' })).toBeVisible();
  });
});
