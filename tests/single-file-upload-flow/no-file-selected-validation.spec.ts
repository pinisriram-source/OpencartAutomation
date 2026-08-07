import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';

test.describe('No File Selected Validation', () => {
  let uploadPage: UploadPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
  });

  test('TC-UPLOAD-013: Clicking Upload with no file selected returns HTTP 500 error', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
    await uploadPage.navigate();
    await expect(uploadPage.fileInput).toHaveValue('');

    const responsePromise = page.waitForEvent('response', r => r.url().includes('/upload'));
    await uploadPage.clickUpload();
    const response = await responsePromise;

    expect(response.status()).toBe(500);
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');
    await expect(page.getByRole('heading', { name: 'Internal Server Error' })).toBeVisible();
  });

  test('TC-UPLOAD-014: After receiving 500 error, navigating back returns to upload form', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    await uploadPage.navigate();
    await uploadPage.clickUpload();

    await expect(page.getByRole('heading', { name: 'Internal Server Error' })).toBeVisible();

    await uploadPage.goBack();

    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');
    await expect(uploadPage.pageHeading).toBeVisible();
    await expect(uploadPage.fileInput).toBeAttached();
    await expect(uploadPage.uploadButton).toBeVisible();
    await expect(uploadPage.successHeading).not.toBeAttached();
  });
});
