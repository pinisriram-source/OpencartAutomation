import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { UploadPage } from './page-objects/upload.page';

test.describe('File Name Integrity', () => {
  let uploadPage: UploadPage;
  let tmpDir: string;

  test.beforeEach(async ({ page }, testInfo) => {
    uploadPage = new UploadPage(page);
    tmpDir = testInfo.outputDir;
    fs.mkdirSync(tmpDir, { recursive: true });
  });

  test('TC-UPLOAD-017: Uploading a file with spaces in the name preserves the exact filename', { tag: ['@sanity', '@regression'] }, async () => {
    const filePath = path.join(tmpDir, 'my file.txt');
    fs.writeFileSync(filePath, 'content');

    await uploadPage.navigate();
    await uploadPage.uploadFile(filePath);

    await expect(uploadPage.successHeading).toBeVisible();
    await expect(uploadPage.uploadedFiles).toHaveText('my file.txt');
  });

  test('TC-UPLOAD-018: Uploading a file with parentheses preserves the exact filename', { tag: ['@functional', '@regression'] }, async () => {
    const filePath = path.join(tmpDir, 'file(1).txt');
    fs.writeFileSync(filePath, 'content');

    await uploadPage.navigate();
    await uploadPage.uploadFile(filePath);

    await expect(uploadPage.successHeading).toBeVisible();
    await expect(uploadPage.uploadedFiles).toHaveText('file(1).txt');
  });

  test('TC-UPLOAD-019: Uploading a file with hyphens preserves the exact filename', { tag: ['@functional', '@regression'] }, async () => {
    const filePath = path.join(tmpDir, 'test-file-name.txt');
    fs.writeFileSync(filePath, 'content');

    await uploadPage.navigate();
    await uploadPage.uploadFile(filePath);

    await expect(uploadPage.successHeading).toBeVisible();
    await expect(uploadPage.uploadedFiles).toHaveText('test-file-name.txt');
  });

  test('TC-UPLOAD-020: Uploading a file with underscores preserves the exact filename', { tag: ['@functional', '@regression'] }, async () => {
    const filePath = path.join(tmpDir, 'test_file_name.txt');
    fs.writeFileSync(filePath, 'content');

    await uploadPage.navigate();
    await uploadPage.uploadFile(filePath);

    await expect(uploadPage.successHeading).toBeVisible();
    await expect(uploadPage.uploadedFiles).toHaveText('test_file_name.txt');
  });

  test('TC-UPLOAD-021: Uploading a file with mixed case preserves the exact case', { tag: ['@functional', '@regression'] }, async () => {
    const filePath = path.join(tmpDir, 'MyFile.TXT');
    fs.writeFileSync(filePath, 'content');

    await uploadPage.navigate();
    await uploadPage.uploadFile(filePath);

    await expect(uploadPage.successHeading).toBeVisible();
    await expect(uploadPage.uploadedFiles).toHaveText('MyFile.TXT');
  });

  test('TC-UPLOAD-022: Uploading a file with multiple dots preserves all dots', { tag: ['@functional', '@regression'] }, async () => {
    const filePath = path.join(tmpDir, 'archive.tar.gz');
    fs.writeFileSync(filePath, 'content');

    await uploadPage.navigate();
    await uploadPage.uploadFile(filePath);

    await expect(uploadPage.successHeading).toBeVisible();
    await expect(uploadPage.uploadedFiles).toHaveText('archive.tar.gz');
  });

  test('TC-UPLOAD-023: Uploading a file with special characters and spaces preserves everything', { tag: ['@sanity', '@regression'] }, async () => {
    const filePath = path.join(tmpDir, 'my file (1).txt');
    fs.writeFileSync(filePath, 'content');

    await uploadPage.navigate();
    await uploadPage.uploadFile(filePath);

    await expect(uploadPage.successHeading).toBeVisible();
    await expect(uploadPage.uploadedFiles).toHaveText('my file (1).txt');
  });
});
