import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';
import { stepShot } from '../_shared/step-shot';

test.describe('State Reset', () => {
  let uploadPage: UploadPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
  });

  test('TC-UPLOAD-011: After successful upload, navigating back to upload page resets to initial empty state', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
    // 1. Navigate to the File Uploader page
    await uploadPage.navigate();
    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');
    await stepShot(page, 1);

    // 2. Select a file (e.g., "test.txt") in the file input
    await uploadPage.uploadFile('test.txt', Buffer.from('reset test content'));
    // expect: File is selected successfully
    await expect(uploadPage.fileInput).not.toHaveValue('');
    await stepShot(page, 2);

    // 3. Click the "Upload" submit button
    await uploadPage.clickUpload();
    // expect: Page navigates to the confirmation view
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');
    // expect: "File Uploaded!" heading is visible
    await expect(uploadPage.confirmationHeading).toBeVisible();
    // expect: Uploaded filename "test.txt" is displayed
    await expect(uploadPage.uploadedFileName).toHaveText('test.txt');
    await stepShot(page, 3);

    // 4. Navigate back to the File Uploader page (https://the-internet.herokuapp.com/upload)
    await uploadPage.navigate();
    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');
    // expect: "File Uploader" heading is visible
    await expect(uploadPage.pageHeading).toBeVisible();
    // expect: File input is empty (no file selected)
    await expect(uploadPage.fileInput).toHaveValue('');
    // expect: No "File Uploaded!" confirmation heading is present
    await expect(uploadPage.confirmationHeading).not.toBeAttached();
    // expect: No uploaded filename is displayed (state has been reset)
    await expect(uploadPage.uploadedFileName).not.toBeAttached();
    // expect: Page is in its initial empty state, identical to first load
    await expect(uploadPage.uploadButton).toBeVisible();
    await stepShot(page, 4);
  });

  test('TC-UPLOAD-016: Sequential uploads — upload one file, reset, upload a different file', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to the File Uploader page and upload "first.txt"
    await uploadPage.navigate();
    await uploadPage.uploadFile('first.txt', Buffer.from('first file content'));
    await uploadPage.clickUpload();
    // expect: "File Uploaded!" heading is visible
    await expect(uploadPage.confirmationHeading).toBeVisible();
    // expect: Uploaded filename "first.txt" is displayed
    await expect(uploadPage.uploadedFileName).toHaveText('first.txt');
    await stepShot(page, 1);

    // 2. Navigate back to the upload page
    await uploadPage.navigate();
    // expect: Page resets to initial empty state
    await expect(uploadPage.pageHeading).toBeVisible();
    await expect(uploadPage.fileInput).toHaveValue('');
    await expect(uploadPage.confirmationHeading).not.toBeAttached();
    await stepShot(page, 2);

    // 3. Select a different file (e.g., "second.txt") and click Upload
    await uploadPage.uploadFile('second.txt', Buffer.from('second file content'));
    await uploadPage.clickUpload();
    // expect: "File Uploaded!" heading is visible
    await expect(uploadPage.confirmationHeading).toBeVisible();
    // expect: Uploaded filename "second.txt" is displayed (not "first.txt")
    await expect(uploadPage.uploadedFileName).toHaveText('second.txt');
    // expect: Previous upload filename is not shown anywhere
    await expect(page.getByText('first.txt')).not.toBeAttached();
    await stepShot(page, 3);
  });
});
