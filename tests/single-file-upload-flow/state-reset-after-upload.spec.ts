import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';

test.describe('State Reset After Upload', () => {
  let uploadPage: UploadPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
  });

  test('TC-UPLOAD-015: Navigate back to upload page after successful upload resets state', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    // 2. Select and upload a test file
    await uploadPage.uploadFile('test-file.txt', Buffer.from('content'));

    // expect: "File Uploaded!" heading is visible
    await expect(uploadPage.uploadedHeading).toBeVisible();

    // expect: Filename is displayed
    await expect(uploadPage.uploadedFileName).toBeVisible();

    // 3. Navigate to https://the-internet.herokuapp.com/upload (fresh page load)
    await uploadPage.navigate();

    // expect: Page returns to initial state
    // expect: "File Uploader" heading is visible
    await expect(uploadPage.pageHeading).toBeVisible();

    // expect: File input shows no file selected
    await expect(uploadPage.fileInput).toHaveValue('');

    // expect: No "File Uploaded!" heading is present
    await expect(uploadPage.uploadedHeading).not.toBeAttached();

    // expect: No uploaded filename is displayed
    await expect(uploadPage.uploadedFileName).not.toBeAttached();
  });

  test('TC-UPLOAD-016: Reload confirmation page returns to initial upload state', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    // 2. Select and upload a test file
    await uploadPage.uploadFile('test-file.txt', Buffer.from('content'));

    // expect: "File Uploaded!" heading is visible
    await expect(uploadPage.uploadedHeading).toBeVisible();

    // expect: Filename is displayed
    await expect(uploadPage.uploadedFileName).toBeVisible();

    // 3. Reload/refresh the current page
    await page.reload();

    // expect: Page returns to the initial upload state (not the confirmation view)
    // expect: "File Uploader" heading is visible
    await expect(uploadPage.pageHeading).toBeVisible();

    // expect: File input shows no file selected
    await expect(uploadPage.fileInput).toHaveValue('');

    // expect: No "File Uploaded!" heading is present
    await expect(uploadPage.uploadedHeading).not.toBeAttached();
  });
});
