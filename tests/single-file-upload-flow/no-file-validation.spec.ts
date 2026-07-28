import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';

test.describe('No File Selected Validation', () => {
  let uploadPage: UploadPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
    await uploadPage.navigate();
  });

  test('TC-UPLOAD-014: Clicking Upload without selecting a file shows server error', { tag: '@sanity' }, async ({ page }) => {
    await expect(uploadPage.fileInput).toHaveValue('');

    await uploadPage.clickUpload();

    await expect(page.getByRole('heading', { name: 'Internal Server Error' })).toBeVisible();
  });

  test('TC-UPLOAD-015: File input does not have HTML5 required attribute', { tag: '@functional' }, async () => {
    const required = await uploadPage.fileInput.getAttribute('required');
    expect(required).toBeNull();
  });

  test('TC-UPLOAD-016: Upload button remains enabled when no file is selected', { tag: '@functional' }, async () => {
    await expect(uploadPage.fileInput).toHaveValue('');
    await expect(uploadPage.uploadButton).toBeEnabled();
  });
});
