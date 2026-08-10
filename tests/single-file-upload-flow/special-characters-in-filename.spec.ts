import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';
import { stepShot } from '../_shared/step-shot';
import path from 'path';
import fs from 'fs';

test.describe('Special Characters in Filename', () => {
  let uploadPage: UploadPage;
  const testDataDir = path.join(__dirname, 'test-data');

  test.beforeAll(async () => {
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
    fs.writeFileSync(path.join(testDataDir, 'my file.txt'), 'spaces in name');
    fs.writeFileSync(path.join(testDataDir, 'file (1).txt'), 'parentheses in name');
    fs.writeFileSync(path.join(testDataDir, 'my file (1).txt'), 'spaces and parentheses');
    fs.writeFileSync(path.join(testDataDir, 'test_file-name.txt'), 'underscore and hyphen');
  });

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
  });

  test('TC-UPLOAD-007: Upload file with spaces in name preserves exact filename', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a file named 'my file.txt' (contains spaces)
    await uploadPage.selectFile(path.join(testDataDir, 'my file.txt'));

    // expect: File is selected in the input
    await expect(uploadPage.fileInput).not.toHaveValue('');

    await stepShot(page, 2);

    // 3. Click the Upload button
    await uploadPage.clickUpload();

    // expect: Page reloads to confirmation view
    // expect: Heading is 'File Uploaded!'
    await expect(uploadPage.uploadedHeading).toBeVisible();

    // expect: The displayed filename is exactly 'my file.txt' with spaces preserved
    await expect(uploadPage.uploadedFileName).toHaveText('my file.txt');

    // expect: Spaces are not replaced with underscores or URL-encoded
    await expect(uploadPage.uploadedFileName).not.toContainText('my_file');
    await expect(uploadPage.uploadedFileName).not.toContainText('my%20file');

    await stepShot(page, 3);
  });

  test('TC-UPLOAD-008: Upload file with parentheses in name preserves exact filename', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a file named 'file (1).txt' (contains parentheses)
    await uploadPage.selectFile(path.join(testDataDir, 'file (1).txt'));

    // expect: File is selected in the input
    await expect(uploadPage.fileInput).not.toHaveValue('');

    await stepShot(page, 2);

    // 3. Click the Upload button
    await uploadPage.clickUpload();

    // expect: Page reloads to confirmation view
    // expect: Heading is 'File Uploaded!'
    await expect(uploadPage.uploadedHeading).toBeVisible();

    // expect: The displayed filename is exactly 'file (1).txt' with parentheses preserved
    await expect(uploadPage.uploadedFileName).toHaveText('file (1).txt');

    // expect: Parentheses are not escaped or removed
    await expect(uploadPage.uploadedFileName).toContainText('(1)');

    await stepShot(page, 3);
  });

  test('TC-UPLOAD-009: Upload file with spaces and parentheses preserves exact filename', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a file named 'my file (1).txt' (contains both spaces and parentheses)
    await uploadPage.selectFile(path.join(testDataDir, 'my file (1).txt'));

    // expect: File is selected in the input
    await expect(uploadPage.fileInput).not.toHaveValue('');

    await stepShot(page, 2);

    // 3. Click the Upload button
    await uploadPage.clickUpload();

    // expect: Page reloads to confirmation view
    // expect: Heading is 'File Uploaded!'
    await expect(uploadPage.uploadedHeading).toBeVisible();

    // expect: The displayed filename is exactly 'my file (1).txt' completely unmodified
    await expect(uploadPage.uploadedFileName).toHaveText('my file (1).txt');

    // expect: All special characters (spaces and parentheses) are preserved exactly as provided
    await expect(uploadPage.uploadedFileName).toContainText(' ');
    await expect(uploadPage.uploadedFileName).toContainText('(1)');

    await stepShot(page, 3);
  });

  test('TC-UPLOAD-010: Upload file with hyphens and underscores in name', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a file named 'test_file-name.txt' (contains underscore and hyphen)
    await uploadPage.selectFile(path.join(testDataDir, 'test_file-name.txt'));

    // expect: File is selected in the input
    await expect(uploadPage.fileInput).not.toHaveValue('');

    await stepShot(page, 2);

    // 3. Click the Upload button
    await uploadPage.clickUpload();

    // expect: Page reloads to confirmation view
    // expect: Heading is 'File Uploaded!'
    await expect(uploadPage.uploadedHeading).toBeVisible();

    // expect: The displayed filename is exactly 'test_file-name.txt' with underscore and hyphen preserved
    await expect(uploadPage.uploadedFileName).toHaveText('test_file-name.txt');

    await stepShot(page, 3);
  });
});
