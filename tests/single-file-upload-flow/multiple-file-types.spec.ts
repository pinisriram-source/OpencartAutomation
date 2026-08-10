import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';
import { stepShot } from '../_shared/step-shot';
import path from 'path';
import fs from 'fs';

test.describe('Multiple File Types', () => {
  let uploadPage: UploadPage;
  const testDataDir = path.join(__dirname, 'test-data');

  test.beforeAll(async () => {
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
    // Create a minimal 1x1 PNG (smallest valid PNG)
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    fs.writeFileSync(path.join(testDataDir, 'test-image.png'), pngBuffer);
    fs.writeFileSync(path.join(testDataDir, 'package.json'), JSON.stringify({ name: 'test' }));
    fs.writeFileSync(path.join(testDataDir, 'document.pdf'), '%PDF-1.4 test content');
  });

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
  });

  test('TC-UPLOAD-004: Upload a PNG image file successfully', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a PNG file (e.g., 'test-image.png') using the file input
    await uploadPage.selectFile(path.join(testDataDir, 'test-image.png'));

    // expect: File is selected in the input
    await expect(uploadPage.fileInput).not.toHaveValue('');

    await stepShot(page, 2);

    // 3. Click the Upload button
    await uploadPage.clickUpload();

    // expect: Page reloads to confirmation view
    // expect: Heading is 'File Uploaded!'
    await expect(uploadPage.uploadedHeading).toBeVisible();

    // expect: The exact filename 'test-image.png' is displayed
    await expect(uploadPage.uploadedFileName).toHaveText('test-image.png');

    await stepShot(page, 3);
  });

  test('TC-UPLOAD-005: Upload a JSON file successfully', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a JSON file (e.g., 'package.json') using the file input
    await uploadPage.selectFile(path.join(testDataDir, 'package.json'));

    // expect: File is selected in the input
    await expect(uploadPage.fileInput).not.toHaveValue('');

    await stepShot(page, 2);

    // 3. Click the Upload button
    await uploadPage.clickUpload();

    // expect: Page reloads to confirmation view
    // expect: Heading is 'File Uploaded!'
    await expect(uploadPage.uploadedHeading).toBeVisible();

    // expect: The exact filename 'package.json' is displayed
    await expect(uploadPage.uploadedFileName).toHaveText('package.json');

    await stepShot(page, 3);
  });

  test('TC-UPLOAD-006: Upload a PDF file successfully', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a PDF file (e.g., 'document.pdf') using the file input
    await uploadPage.selectFile(path.join(testDataDir, 'document.pdf'));

    // expect: File is selected in the input
    await expect(uploadPage.fileInput).not.toHaveValue('');

    await stepShot(page, 2);

    // 3. Click the Upload button
    await uploadPage.clickUpload();

    // expect: Page reloads to confirmation view
    // expect: Heading is 'File Uploaded!'
    await expect(uploadPage.uploadedHeading).toBeVisible();

    // expect: The exact filename 'document.pdf' is displayed
    await expect(uploadPage.uploadedFileName).toHaveText('document.pdf');

    await stepShot(page, 3);
  });
});
