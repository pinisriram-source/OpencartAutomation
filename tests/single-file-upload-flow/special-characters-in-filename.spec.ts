import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';

test.describe('Special Characters in Filename', () => {
  let uploadPage: UploadPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
  });

  test('TC-UPLOAD-007: Upload file with spaces in name and verify exact filename displayed', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    // 2. Select a test file with spaces in its name (e.g., "my test file.txt")
    await uploadPage.selectFile('my test file.txt', Buffer.from('content'));

    // expect: File input reflects the selected filename with spaces
    await expect(uploadPage.fileInput).toHaveValue(/my test file\.txt/);

    // 3. Click the "Upload" button
    await uploadPage.clickUpload();

    // expect: Page navigates to the confirmation view and shows "File Uploaded!" heading
    await expect(uploadPage.uploadedHeading).toBeVisible();

    // expect: Uploaded filename "my test file.txt" is displayed exactly as provided, with spaces preserved
    await expect(uploadPage.uploadedFileName).toHaveText('my test file.txt');
  });

  test('TC-UPLOAD-008: Upload file with spaces and parentheses and verify exact filename displayed', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    // 2. Select a test file with spaces and parentheses in its name (e.g., "my file (1).txt")
    await uploadPage.selectFile('my file (1).txt', Buffer.from('content'));

    // expect: File input reflects the selected filename with parentheses
    await expect(uploadPage.fileInput).toHaveValue(/my file \(1\)\.txt/);

    // 3. Click the "Upload" button
    await uploadPage.clickUpload();

    // expect: Page navigates to the confirmation view and shows "File Uploaded!" heading
    await expect(uploadPage.uploadedHeading).toBeVisible();

    // expect: Uploaded filename "my file (1).txt" is displayed exactly as provided, with parentheses and spaces preserved
    await expect(uploadPage.uploadedFileName).toHaveText('my file (1).txt');
  });

  test('TC-UPLOAD-009: Upload file with hyphens and underscores in name', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    // 2. Select a test file with hyphens and underscores (e.g., "test-file_01.txt")
    await uploadPage.selectFile('test-file_01.txt', Buffer.from('content'));

    // expect: File input reflects the selected filename
    await expect(uploadPage.fileInput).toHaveValue(/test-file_01\.txt/);

    // 3. Click the "Upload" button
    await uploadPage.clickUpload();

    // expect: Page navigates to the confirmation view and shows "File Uploaded!" heading
    await expect(uploadPage.uploadedHeading).toBeVisible();

    // expect: Uploaded filename "test-file_01.txt" is displayed exactly as provided
    await expect(uploadPage.uploadedFileName).toHaveText('test-file_01.txt');
  });

  test('TC-UPLOAD-010: Upload file with mixed special characters', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    // 2. Select a test file with multiple special characters (e.g., "test file (v2.1) [final].txt")
    await uploadPage.selectFile('test file (v2.1) [final].txt', Buffer.from('content'));

    // expect: File input reflects the selected filename
    await expect(uploadPage.fileInput).toHaveValue(/test file \(v2\.1\) \[final\]\.txt/);

    // 3. Click the "Upload" button
    await uploadPage.clickUpload();

    // expect: Page navigates to the confirmation view and shows "File Uploaded!" heading
    await expect(uploadPage.uploadedHeading).toBeVisible();

    // expect: Uploaded filename is displayed exactly as provided, with all special characters preserved
    await expect(uploadPage.uploadedFileName).toHaveText('test file (v2.1) [final].txt');
  });
});
