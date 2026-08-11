import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';
import { stepShot } from '../_shared/step-shot';

test.describe('Successful Upload', () => {
  let uploadPage: UploadPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
  });

  test('TC-UPLOAD-002: Upload a simple text file and verify confirmation with exact filename', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
    // 1. Navigate to the File Uploader page
    await uploadPage.navigate();
    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');
    await stepShot(page, 1);

    // 2. Select a simple text file (e.g., "test.txt") in the file input
    await uploadPage.uploadFile('test.txt', Buffer.from('hello world'));
    // expect: File is selected successfully
    await expect(uploadPage.fileInput).not.toHaveValue('');
    await stepShot(page, 2);

    // 3. Click the "Upload" submit button
    await uploadPage.clickUpload();
    // expect: Page navigates to the confirmation view (same URL)
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');
    // expect: "File Uploaded!" heading is visible
    await expect(uploadPage.confirmationHeading).toBeVisible();
    // expect: Uploaded filename "test.txt" is displayed exactly as provided
    await expect(uploadPage.uploadedFileName).toHaveText('test.txt');
    await stepShot(page, 3);
  });

  test('TC-UPLOAD-012: Verify confirmation view URL remains the same after successful upload', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to the File Uploader page
    await uploadPage.navigate();
    // expect: URL is https://the-internet.herokuapp.com/upload
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');
    await stepShot(page, 1);

    // 2. Select a file (e.g., "test.txt") and click Upload
    await uploadPage.uploadFile('test.txt', Buffer.from('content'));
    await uploadPage.clickUpload();
    // expect: Page navigates to confirmation view
    // expect: URL is still https://the-internet.herokuapp.com/upload (same URL as initial page)
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');
    // expect: "File Uploaded!" heading is visible
    await expect(uploadPage.confirmationHeading).toBeVisible();
    await stepShot(page, 2);
  });
});
