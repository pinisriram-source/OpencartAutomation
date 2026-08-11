import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';
import { stepShot } from '../_shared/step-shot';

test.describe('Special Characters in Filenames', () => {
  let uploadPage: UploadPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
  });

  test('TC-UPLOAD-006: Upload file with spaces in filename and verify exact filename preservation', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
    // 1. Navigate to the File Uploader page
    await uploadPage.navigate();
    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');
    await stepShot(page, 1);

    // 2. Select a file with spaces in the name (e.g., "my test file.txt") in the file input
    await uploadPage.uploadFile('my test file.txt', Buffer.from('content with spaces'));
    // expect: File is selected successfully
    await expect(uploadPage.fileInput).not.toHaveValue('');
    await stepShot(page, 2);

    // 3. Click the "Upload" submit button
    await uploadPage.clickUpload();
    // expect: Page navigates to the confirmation view
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');
    // expect: "File Uploaded!" heading is visible
    await expect(uploadPage.confirmationHeading).toBeVisible();
    // expect: Uploaded filename "my test file.txt" is displayed exactly as provided, with spaces preserved
    await expect(uploadPage.uploadedFileName).toHaveText('my test file.txt');
    await stepShot(page, 3);
  });

  test('TC-UPLOAD-007: Upload file with parentheses in filename and verify exact filename preservation', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to the File Uploader page
    await uploadPage.navigate();
    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');
    await stepShot(page, 1);

    // 2. Select a file with parentheses in the name (e.g., "file(1).txt") in the file input
    await uploadPage.uploadFile('file(1).txt', Buffer.from('parentheses content'));
    // expect: File is selected successfully
    await expect(uploadPage.fileInput).not.toHaveValue('');
    await stepShot(page, 2);

    // 3. Click the "Upload" submit button
    await uploadPage.clickUpload();
    // expect: Page navigates to the confirmation view
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');
    // expect: "File Uploaded!" heading is visible
    await expect(uploadPage.confirmationHeading).toBeVisible();
    // expect: Uploaded filename "file(1).txt" is displayed exactly as provided, with parentheses preserved
    await expect(uploadPage.uploadedFileName).toHaveText('file(1).txt');
    await stepShot(page, 3);
  });

  test('TC-UPLOAD-008: Upload file with multiple special characters in filename and verify exact filename preservation', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to the File Uploader page
    await uploadPage.navigate();
    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');
    await stepShot(page, 1);

    // 2. Select a file with multiple special characters in the name (e.g., "my_file (copy) [2].txt") in the file input
    await uploadPage.uploadFile('my_file (copy) [2].txt', Buffer.from('special chars content'));
    // expect: File is selected successfully
    await expect(uploadPage.fileInput).not.toHaveValue('');
    await stepShot(page, 2);

    // 3. Click the "Upload" submit button
    await uploadPage.clickUpload();
    // expect: Page navigates to the confirmation view
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');
    // expect: "File Uploaded!" heading is visible
    await expect(uploadPage.confirmationHeading).toBeVisible();
    // expect: Uploaded filename "my_file (copy) [2].txt" is displayed exactly as provided, with all special characters preserved
    await expect(uploadPage.uploadedFileName).toHaveText('my_file (copy) [2].txt');
    await stepShot(page, 3);
  });

  test('TC-UPLOAD-013: Upload file with hyphen and underscore in filename', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to the File Uploader page
    await uploadPage.navigate();
    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');
    await stepShot(page, 1);

    // 2. Select a file with hyphens and underscores (e.g., "test-file_01.txt") in the file input
    await uploadPage.uploadFile('test-file_01.txt', Buffer.from('hyphen underscore content'));
    // expect: File is selected successfully
    await expect(uploadPage.fileInput).not.toHaveValue('');
    await stepShot(page, 2);

    // 3. Click the "Upload" submit button
    await uploadPage.clickUpload();
    // expect: Page navigates to the confirmation view
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');
    // expect: "File Uploaded!" heading is visible
    await expect(uploadPage.confirmationHeading).toBeVisible();
    // expect: Uploaded filename "test-file_01.txt" is displayed exactly as provided
    await expect(uploadPage.uploadedFileName).toHaveText('test-file_01.txt');
    await stepShot(page, 3);
  });
});
