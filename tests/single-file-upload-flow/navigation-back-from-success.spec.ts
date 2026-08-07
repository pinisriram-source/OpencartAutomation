import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { UploadPage } from './page-objects/upload.page';

test.describe('Navigation Back from Success Page', () => {
  let uploadPage: UploadPage;
  let tmpDir: string;

  test.beforeEach(async ({ page }, testInfo) => {
    uploadPage = new UploadPage(page);
    tmpDir = testInfo.outputDir;
    fs.mkdirSync(tmpDir, { recursive: true });
  });

  test('TC-UPLOAD-024: After successful upload, browser back button retains file in input', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
    const filePath = path.join(tmpDir, 'test.txt');
    fs.writeFileSync(filePath, 'content');

    await uploadPage.navigate();
    await uploadPage.uploadFile(filePath);

    await expect(uploadPage.successHeading).toBeVisible();

    await uploadPage.goBack();

    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');
    await expect(uploadPage.pageHeading).toBeVisible();
    await expect(uploadPage.fileInput).toHaveValue(/test\.txt/);
    await expect(uploadPage.uploadButton).toBeVisible();
  });

  test('TC-UPLOAD-025: Fresh navigation to /upload after successful upload resets the page completely', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
    const filePath = path.join(tmpDir, 'uploaded.txt');
    fs.writeFileSync(filePath, 'content');

    await uploadPage.navigate();
    await uploadPage.uploadFile(filePath);

    await expect(uploadPage.successHeading).toBeVisible();
    await expect(uploadPage.uploadedFiles).toHaveText('uploaded.txt');

    await uploadPage.navigate();

    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');
    await expect(uploadPage.pageHeading).toBeVisible();
    await expect(uploadPage.fileInput).toHaveValue('');
    await expect(uploadPage.successHeading).not.toBeAttached();
    await expect(uploadPage.uploadedFiles).not.toBeAttached();
  });
});
