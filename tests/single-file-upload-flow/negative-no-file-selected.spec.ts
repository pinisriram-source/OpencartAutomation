import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';
import { stepShot } from '../_shared/step-shot';

test.describe('Negative Case: No File Selected', () => {
  let uploadPage: UploadPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
  });

  test('TC-UPLOAD-011: Clicking Upload with no file selected results in server error', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    // expect: File input is empty
    await expect(uploadPage.fileInput).toHaveValue('');

    await stepShot(page, 1);

    // 2. Click the Upload button without selecting any file
    await uploadPage.clickUpload();

    // expect: Page navigates/reloads
    // expect: An 'Internal Server Error' heading (h1) is displayed
    await expect(uploadPage.errorHeading).toBeVisible();

    // expect: No 'File Uploaded!' confirmation appears
    await expect(uploadPage.confirmationHeading).not.toBeAttached();

    // expect: No uploaded filename is displayed
    await expect(uploadPage.uploadedFileName).not.toBeAttached();

    await stepShot(page, 2);
  });
});
