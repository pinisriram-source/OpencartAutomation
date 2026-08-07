import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { UploadPage } from './page-objects/upload.page';

test.describe('File Selection Behavior', () => {
  let uploadPage: UploadPage;
  let tmpDir: string;

  test.beforeEach(async ({ page }, testInfo) => {
    uploadPage = new UploadPage(page);
    tmpDir = testInfo.outputDir;
    fs.mkdirSync(tmpDir, { recursive: true });
  });

  test('TC-UPLOAD-004: Selecting a file updates the file input with the chosen filename', { tag: ['@smoke', '@regression'] }, async () => {
    const filePath = path.join(tmpDir, 'sample.txt');
    fs.writeFileSync(filePath, 'sample content');

    await uploadPage.navigate();
    await expect(uploadPage.fileInput).toHaveValue('');

    await uploadPage.selectFile(filePath);
    await expect(uploadPage.fileInput).not.toHaveValue('');
  });

  test('TC-UPLOAD-005: Selecting a different file type (.json) updates the file input correctly', { tag: ['@functional', '@regression'] }, async () => {
    const filePath = path.join(tmpDir, 'data.json');
    fs.writeFileSync(filePath, '{"key": "value"}');

    await uploadPage.navigate();

    await uploadPage.selectFile(filePath);
    await expect(uploadPage.fileInput).not.toHaveValue('');
  });

  test('TC-UPLOAD-006: Selecting another file type (.png) updates the file input correctly', { tag: ['@functional', '@regression'] }, async () => {
    const filePath = path.join(tmpDir, 'image.png');
    fs.writeFileSync(filePath, Buffer.from([0x89, 0x50, 0x4e, 0x47]));

    await uploadPage.navigate();

    await uploadPage.selectFile(filePath);
    await expect(uploadPage.fileInput).not.toHaveValue('');
  });

  test('TC-UPLOAD-007: Re-selecting a file overwrites the previous selection', { tag: ['@sanity', '@regression'] }, async () => {
    const firstPath = path.join(tmpDir, 'first.txt');
    const secondPath = path.join(tmpDir, 'second.txt');
    fs.writeFileSync(firstPath, 'first');
    fs.writeFileSync(secondPath, 'second');

    await uploadPage.navigate();

    await uploadPage.selectFile(firstPath);
    await expect(uploadPage.fileInput).toHaveValue(/first\.txt/);

    await uploadPage.selectFile(secondPath);
    await expect(uploadPage.fileInput).toHaveValue(/second\.txt/);
    await expect(uploadPage.fileInput).not.toHaveValue(/first\.txt/);
  });
});
