import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { UploadPage } from './page-objects/upload.page';

test.describe('Successful Upload Flow', () => {
  let uploadPage: UploadPage;
  let tmpDir: string;

  test.beforeEach(async ({ page }, testInfo) => {
    uploadPage = new UploadPage(page);
    tmpDir = testInfo.outputDir;
    fs.mkdirSync(tmpDir, { recursive: true });
  });

  test('TC-UPLOAD-008: Uploading a .txt file shows success page with File Uploaded! heading', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
    const filePath = path.join(tmpDir, 'sample.txt');
    fs.writeFileSync(filePath, 'sample content');

    await uploadPage.navigate();
    await uploadPage.selectFile(filePath);
    await uploadPage.clickUpload();

    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');
    await expect(uploadPage.successHeading).toBeVisible();
    await expect(uploadPage.page.locator('h3')).toHaveText('File Uploaded!');
  });

  test('TC-UPLOAD-009: After successful upload, the uploaded filename is displayed exactly', { tag: ['@sanity', '@regression'] }, async () => {
    const filePath = path.join(tmpDir, 'sample.txt');
    fs.writeFileSync(filePath, 'sample content');

    await uploadPage.navigate();
    await uploadPage.selectFile(filePath);
    await uploadPage.clickUpload();

    await expect(uploadPage.successHeading).toBeVisible();
    await expect(uploadPage.uploadedFiles).toBeVisible();
    await expect(uploadPage.uploadedFiles).toHaveText('sample.txt');
  });

  test('TC-UPLOAD-010: Uploading a .json file succeeds and displays correct filename', { tag: ['@functional', '@regression'] }, async () => {
    const filePath = path.join(tmpDir, 'data.json');
    fs.writeFileSync(filePath, '{"key": "value"}');

    await uploadPage.navigate();
    await uploadPage.uploadFile(filePath);

    await expect(uploadPage.successHeading).toBeVisible();
    await expect(uploadPage.uploadedFiles).toHaveText('data.json');
  });

  test('TC-UPLOAD-011: Uploading a .png file succeeds and displays correct filename', { tag: ['@functional', '@regression'] }, async () => {
    const filePath = path.join(tmpDir, 'image.png');
    fs.writeFileSync(filePath, Buffer.from([0x89, 0x50, 0x4e, 0x47]));

    await uploadPage.navigate();
    await uploadPage.uploadFile(filePath);

    await expect(uploadPage.successHeading).toBeVisible();
    await expect(uploadPage.uploadedFiles).toHaveText('image.png');
  });

  test('TC-UPLOAD-012: Uploading a .md file succeeds and displays correct filename', { tag: ['@functional', '@regression'] }, async () => {
    const filePath = path.join(tmpDir, 'readme.md');
    fs.writeFileSync(filePath, '# Readme');

    await uploadPage.navigate();
    await uploadPage.uploadFile(filePath);

    await expect(uploadPage.successHeading).toBeVisible();
    await expect(uploadPage.uploadedFiles).toHaveText('readme.md');
  });
});
