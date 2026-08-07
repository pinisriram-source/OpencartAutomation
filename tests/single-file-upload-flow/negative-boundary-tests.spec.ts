import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { UploadPage } from './page-objects/upload.page';

test.describe('Negative and Boundary Tests', () => {
  let uploadPage: UploadPage;
  let tmpDir: string;

  test.beforeEach(async ({ page }, testInfo) => {
    uploadPage = new UploadPage(page);
    tmpDir = testInfo.outputDir;
    fs.mkdirSync(tmpDir, { recursive: true });
  });

  test('TC-UPLOAD-026: Double-clicking Upload button with file selected does not cause errors', { tag: ['@functional', '@regression'] }, async () => {
    const filePath = path.join(tmpDir, 'test.txt');
    fs.writeFileSync(filePath, 'content');

    await uploadPage.navigate();
    await uploadPage.selectFile(filePath);

    await uploadPage.uploadButton.dblclick();

    await expect(uploadPage.successHeading).toBeVisible();
    await expect(uploadPage.uploadedFiles).toHaveText('test.txt');
  });

  test('TC-UPLOAD-027: File input does not accept multiple files (single file only enforced)', { tag: ['@functional', '@regression'] }, async () => {
    const file1 = path.join(tmpDir, 'a.txt');
    const file2 = path.join(tmpDir, 'b.txt');
    fs.writeFileSync(file1, 'a');
    fs.writeFileSync(file2, 'b');

    await uploadPage.navigate();

    await expect(uploadPage.fileInput).not.toHaveAttribute('multiple', /.*/);

    await uploadPage.selectFile(file1);
    await expect(uploadPage.fileInput).toHaveValue(/a\.txt/);

    await uploadPage.selectFile(file2);
    await expect(uploadPage.fileInput).toHaveValue(/b\.txt/);
  });

  test('TC-UPLOAD-028: Success page does not have a form element', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    const filePath = path.join(tmpDir, 'test.txt');
    fs.writeFileSync(filePath, 'content');

    await uploadPage.navigate();
    await uploadPage.uploadFile(filePath);

    await expect(uploadPage.successHeading).toBeVisible();
    await expect(page.locator('form')).not.toBeAttached();
    await expect(uploadPage.fileInput).not.toBeAttached();
    await expect(uploadPage.uploadButton).not.toBeAttached();
    await expect(uploadPage.uploadedFiles).toBeVisible();
  });

  test('TC-UPLOAD-029: Clicking Upload multiple times with no file returns error each time', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    await uploadPage.navigate();
    await expect(uploadPage.fileInput).toHaveValue('');

    await uploadPage.clickUpload();
    await expect(page.getByRole('heading', { name: 'Internal Server Error' })).toBeVisible();

    await uploadPage.navigate();
    await expect(uploadPage.pageHeading).toBeVisible();

    await uploadPage.clickUpload();
    await expect(page.getByRole('heading', { name: 'Internal Server Error' })).toBeVisible();
  });

  test('TC-UPLOAD-030: Refreshing the success page does NOT re-upload the file', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    const filePath = path.join(tmpDir, 'test.txt');
    fs.writeFileSync(filePath, 'content');

    await uploadPage.navigate();
    await uploadPage.uploadFile(filePath);

    await expect(uploadPage.successHeading).toBeVisible();
    await expect(uploadPage.uploadedFiles).toHaveText('test.txt');

    await page.reload();

    await expect(uploadPage.pageHeading).toBeVisible();
    await expect(uploadPage.fileInput).toHaveValue('');
    await expect(uploadPage.successHeading).not.toBeAttached();
  });
});
