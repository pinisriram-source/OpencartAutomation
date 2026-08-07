import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { UploadPage } from './page-objects/upload.page';

test.describe('Sequential Uploads', () => {
  let uploadPage: UploadPage;
  let tmpDir: string;

  test.beforeEach(async ({ page }, testInfo) => {
    uploadPage = new UploadPage(page);
    tmpDir = testInfo.outputDir;
    fs.mkdirSync(tmpDir, { recursive: true });
  });

  test('TC-UPLOAD-015: Uploading first.txt then navigating back and uploading second.txt shows correct names', { tag: ['@sanity', '@regression'] }, async () => {
    const firstPath = path.join(tmpDir, 'first.txt');
    const secondPath = path.join(tmpDir, 'second.txt');
    fs.writeFileSync(firstPath, 'first');
    fs.writeFileSync(secondPath, 'second');

    await uploadPage.navigate();
    await uploadPage.uploadFile(firstPath);

    await expect(uploadPage.successHeading).toBeVisible();
    await expect(uploadPage.uploadedFiles).toHaveText('first.txt');

    await uploadPage.navigate();
    await expect(uploadPage.fileInput).toHaveValue('');

    await uploadPage.uploadFile(secondPath);

    await expect(uploadPage.successHeading).toBeVisible();
    await expect(uploadPage.uploadedFiles).toHaveText('second.txt');
  });

  test('TC-UPLOAD-016: Uploading three different files sequentially shows correct name each time', { tag: ['@functional', '@regression'] }, async () => {
    const file1 = path.join(tmpDir, 'file1.txt');
    const file2 = path.join(tmpDir, 'file2.json');
    const file3 = path.join(tmpDir, 'file3.png');
    fs.writeFileSync(file1, 'content1');
    fs.writeFileSync(file2, '{}');
    fs.writeFileSync(file3, Buffer.from([0x89, 0x50, 0x4e, 0x47]));

    await uploadPage.navigate();
    await uploadPage.uploadFile(file1);
    await expect(uploadPage.uploadedFiles).toHaveText('file1.txt');

    await uploadPage.navigate();
    await uploadPage.uploadFile(file2);
    await expect(uploadPage.uploadedFiles).toHaveText('file2.json');

    await uploadPage.navigate();
    await uploadPage.uploadFile(file3);
    await expect(uploadPage.uploadedFiles).toHaveText('file3.png');
  });
});
