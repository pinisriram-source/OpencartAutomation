import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';
import { stepShot } from '../_shared/step-shot';

test.describe('Negative / Edge Cases', () => {
  let uploadPage: UploadPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
  });

  test('TC-UPLOAD-009: Clicking Upload with no file selected results in Internal Server Error', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
    // 1. Navigate to the File Uploader page
    await uploadPage.navigate();
    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');
    await stepShot(page, 1);

    // 2. Do NOT select any file in the file input
    // expect: File input remains empty (no file selected)
    await expect(uploadPage.fileInput).toHaveValue('');
    await stepShot(page, 2);

    // 3. Click the "Upload" submit button
    await uploadPage.clickUpload();
    // expect: Page navigates/responds with an error
    // expect: "Internal Server Error" heading is visible (actual observed behavior)
    await expect(uploadPage.errorHeading).toBeVisible();
    // expect: Upload does NOT successfully complete
    await expect(uploadPage.confirmationHeading).not.toBeAttached();
    await stepShot(page, 3);
  });

  test('TC-UPLOAD-010: Verify upload with no file selected does not show confirmation elements', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to the File Uploader page
    await uploadPage.navigate();
    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');
    await stepShot(page, 1);

    // 2. Do NOT select any file in the file input
    // expect: File input remains empty
    await expect(uploadPage.fileInput).toHaveValue('');
    await stepShot(page, 2);

    // 3. Click the "Upload" submit button
    await uploadPage.clickUpload();
    // expect: Page responds with an error (Internal Server Error)
    await expect(uploadPage.errorHeading).toBeVisible();
    // expect: No "File Uploaded!" confirmation appears
    await expect(uploadPage.confirmationHeading).not.toBeAttached();
    // expect: No uploaded filename is displayed
    await expect(uploadPage.uploadedFileName).not.toBeAttached();
    await stepShot(page, 3);
  });
});
