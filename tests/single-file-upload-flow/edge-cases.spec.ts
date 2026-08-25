import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';
import { stepShot } from '../_shared/step-shot';
import path from 'path';
import fs from 'fs';
import os from 'os';

test.describe('Edge Cases and Boundary Conditions', () => {
  let uploadPage: UploadPage;
  let tmpDir: string;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'upload-test-'));
  });

  test.afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('TC-UPLOAD-018: Upload a file with no extension', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    const fileName = 'testfile';
    const filePath = path.join(tmpDir, fileName);
    fs.writeFileSync(filePath, 'no extension content');

    // 1. Navigate to the File Uploader page
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a file with no file extension
    await uploadPage.uploadFile(filePath);

    // expect: File input displays 'testfile'
    await expect(uploadPage.fileInput).toHaveValue(/testfile$/);

    await stepShot(page, 2);

    // 3. Click the Upload button
    await uploadPage.clickUpload();

    // expect: Success page displays 'testfile' (the exact filename)
    await expect(uploadPage.successHeading).toBeVisible();
    await expect(uploadPage.uploadedFileName).toHaveText(fileName);

    // expect: No error occurs from the missing extension
    // expect: Filename is not altered or truncated
    await expect(uploadPage.uploadedFileName).toHaveText('testfile');

    await stepShot(page, 3);
  });

  test('TC-UPLOAD-019: Upload a file with multiple dots in the filename', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    const fileName = 'my.test.file.backup.txt';
    const filePath = path.join(tmpDir, fileName);
    fs.writeFileSync(filePath, 'multiple dots content');

    // 1. Navigate to the File Uploader page
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a file with multiple dots
    await uploadPage.uploadFile(filePath);

    // expect: File input displays 'my.test.file.backup.txt'
    await expect(uploadPage.fileInput).toHaveValue(/my\.test\.file\.backup\.txt$/);

    await stepShot(page, 2);

    // 3. Click the Upload button
    await uploadPage.clickUpload();

    // expect: Success page displays 'my.test.file.backup.txt' exactly
    await expect(uploadPage.successHeading).toBeVisible();
    await expect(uploadPage.uploadedFileName).toHaveText(fileName);

    // expect: All dots are preserved in the displayed filename
    await expect(uploadPage.uploadedFileName).toContainText('my.test.file.backup.txt');

    await stepShot(page, 3);
  });

  test('TC-UPLOAD-020: Upload a file with unicode characters in the filename', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    const fileName = 'tëst-fîlé.txt';
    const filePath = path.join(tmpDir, fileName);
    fs.writeFileSync(filePath, 'unicode content');

    // 1. Navigate to the File Uploader page
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a file with unicode/non-ASCII characters
    await uploadPage.uploadFile(filePath);

    // expect: File input displays the unicode filename
    await expect(uploadPage.fileInput).not.toHaveValue('');

    await stepShot(page, 2);

    // 3. Click the Upload button
    await uploadPage.clickUpload();

    // expect: Success page displays the unicode filename correctly (not garbled or replaced with '?')
    await expect(uploadPage.successHeading).toBeVisible();

    // expect: Unicode characters are preserved in the displayed filename
    await expect(uploadPage.uploadedFileName).toHaveText(fileName);

    await stepShot(page, 3);
  });
});
