import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';
import { stepShot } from '../_shared/step-shot';
import path from 'path';
import fs from 'fs';
import os from 'os';

test.describe('Successful File Upload', () => {
  let uploadPage: UploadPage;
  let tmpDir: string;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'upload-test-'));
  });

  test.afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('TC-UPLOAD-003: Upload a valid text file and verify success page', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
    const fileName = 'test-upload.txt';
    const filePath = path.join(tmpDir, fileName);
    fs.writeFileSync(filePath, 'test content');

    // 1. Navigate to the File Uploader page
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a valid text file via the file input control
    await uploadPage.uploadFile(filePath);

    // expect: File input control displays the chosen file's name 'test-upload.txt'
    await expect(uploadPage.fileInput).toHaveValue(/test-upload\.txt$/);

    // expect: Upload button remains visible and clickable
    await expect(uploadPage.uploadButton).toBeVisible();

    await stepShot(page, 2);

    // 3. Click the Upload button
    await uploadPage.clickUpload();

    // expect: Page navigates to the upload success page
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    // expect: Success heading 'File Uploaded!' is visible
    await expect(uploadPage.successHeading).toBeVisible();

    // expect: Uploaded file name 'test-upload.txt' is displayed below the heading
    await expect(uploadPage.uploadedFileName).toHaveText(fileName);

    // expect: File name matches exactly what was selected (including extension)
    await expect(uploadPage.uploadedFileName).toContainText('.txt');

    await stepShot(page, 3);
  });

  test('TC-UPLOAD-004: Upload a valid image file (PNG) and verify success page', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    const fileName = 'test-image.png';
    const filePath = path.join(tmpDir, fileName);
    fs.writeFileSync(filePath, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64'));

    // 1. Navigate to the File Uploader page
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a valid PNG image file via the file input control
    await uploadPage.uploadFile(filePath);

    // expect: File input control displays 'test-image.png'
    await expect(uploadPage.fileInput).toHaveValue(/test-image\.png$/);

    await stepShot(page, 2);

    // 3. Click the Upload button
    await uploadPage.clickUpload();

    // expect: Page navigates to the upload success page
    // expect: Success heading 'File Uploaded!' is visible
    await expect(uploadPage.successHeading).toBeVisible();

    // expect: Uploaded file name 'test-image.png' is displayed
    await expect(uploadPage.uploadedFileName).toHaveText(fileName);

    // expect: File extension '.png' is preserved
    await expect(uploadPage.uploadedFileName).toContainText('.png');

    await stepShot(page, 3);
  });

  test('TC-UPLOAD-005: Upload a file with spaces and special characters in filename', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    const fileName = 'My Test File (1).txt';
    const filePath = path.join(tmpDir, fileName);
    fs.writeFileSync(filePath, 'special characters test');

    // 1. Navigate to the File Uploader page
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a file with spaces/special characters in name
    await uploadPage.uploadFile(filePath);

    // expect: File input control displays the full filename with spaces and special characters
    await expect(uploadPage.fileInput).toHaveValue(/My Test File \(1\)\.txt$/);

    await stepShot(page, 2);

    // 3. Click the Upload button
    await uploadPage.clickUpload();

    // expect: Page navigates to the upload success page
    // expect: Success heading is visible
    await expect(uploadPage.successHeading).toBeVisible();

    // expect: Displayed file name matches the original filename exactly, preserving spaces and special characters
    await expect(uploadPage.uploadedFileName).toHaveText(fileName);

    await stepShot(page, 3);
  });

  test('TC-UPLOAD-006: Upload a file with a long filename', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    const fileName = 'this-is-a-very-long-filename-that-exceeds-typical-length-expectations-for-testing-purposes.txt';
    const filePath = path.join(tmpDir, fileName);
    fs.writeFileSync(filePath, 'long filename test');

    // 1. Navigate to the File Uploader page
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a file with a long filename (100+ characters)
    await uploadPage.uploadFile(filePath);

    // expect: File input control displays the filename (may be truncated in display, but internally stored)
    await expect(uploadPage.fileInput).not.toHaveValue('');

    await stepShot(page, 2);

    // 3. Click the Upload button
    await uploadPage.clickUpload();

    // expect: Page navigates to the upload success page
    // expect: Success heading is visible
    await expect(uploadPage.successHeading).toBeVisible();

    // expect: Displayed file name on success page is not truncated — the entire long filename is shown
    await expect(uploadPage.uploadedFileName).toHaveText(fileName);

    await stepShot(page, 3);
  });
});
