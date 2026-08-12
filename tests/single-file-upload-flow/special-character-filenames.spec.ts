import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';
import { stepShot } from '../_shared/step-shot';

test.describe('Special Character Filenames', () => {
  let uploadPage: UploadPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
  });

  test('TC-UPLOAD-007: Filename with spaces preserved exactly on confirmation', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a file whose name contains spaces (e.g., 'my test file.txt')
    await uploadPage.selectFile('my test file.txt', Buffer.from('content'));

    // expect: File is selected
    await expect(uploadPage.fileInput).toHaveValue(/my test file\.txt/);

    await stepShot(page, 2);

    // 3. Click the Upload button
    await uploadPage.clickUpload();

    // expect: Confirmation view appears
    // expect: 'File Uploaded!' heading is visible
    await expect(uploadPage.confirmationHeading).toBeVisible();

    // expect: The displayed filename is exactly 'my test file.txt', with spaces unmodified
    await expect(uploadPage.uploadedFileName).toHaveText('my test file.txt');

    await stepShot(page, 3);
  });

  test('TC-UPLOAD-008: Filename with parentheses and spaces preserved exactly', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a file with parentheses in the name (e.g., 'my file (1).txt')
    await uploadPage.selectFile('my file (1).txt', Buffer.from('content'));

    // expect: File is selected
    await expect(uploadPage.fileInput).toHaveValue(/my file \(1\)\.txt/);

    await stepShot(page, 2);

    // 3. Click the Upload button
    await uploadPage.clickUpload();

    // expect: Confirmation view appears
    // expect: 'File Uploaded!' heading is visible
    await expect(uploadPage.confirmationHeading).toBeVisible();

    // expect: The displayed filename is exactly 'my file (1).txt', unmodified
    await expect(uploadPage.uploadedFileName).toHaveText('my file (1).txt');

    await stepShot(page, 3);
  });

  test('TC-UPLOAD-009: Filename with dashes and underscores preserved exactly', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a file with dashes and underscores (e.g., 'test_file-v2.txt')
    await uploadPage.selectFile('test_file-v2.txt', Buffer.from('content'));

    // expect: File is selected
    await expect(uploadPage.fileInput).toHaveValue(/test_file-v2\.txt/);

    await stepShot(page, 2);

    // 3. Click the Upload button
    await uploadPage.clickUpload();

    // expect: Confirmation view appears
    // expect: 'File Uploaded!' heading is visible
    await expect(uploadPage.confirmationHeading).toBeVisible();

    // expect: The displayed filename is exactly 'test_file-v2.txt', unmodified
    await expect(uploadPage.uploadedFileName).toHaveText('test_file-v2.txt');

    await stepShot(page, 3);
  });

  test('TC-UPLOAD-010: Filename with dots (multiple extensions pattern) preserved exactly', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a file with multiple dots in the name (e.g., 'backup.2024.01.15.tar.gz')
    await uploadPage.selectFile('backup.2024.01.15.tar.gz', Buffer.from('content'));

    // expect: File is selected
    await expect(uploadPage.fileInput).toHaveValue(/backup\.2024\.01\.15\.tar\.gz/);

    await stepShot(page, 2);

    // 3. Click the Upload button
    await uploadPage.clickUpload();

    // expect: Confirmation view appears
    // expect: 'File Uploaded!' heading is visible
    await expect(uploadPage.confirmationHeading).toBeVisible();

    // expect: The displayed filename is exactly 'backup.2024.01.15.tar.gz', unmodified
    await expect(uploadPage.uploadedFileName).toHaveText('backup.2024.01.15.tar.gz');

    await stepShot(page, 3);
  });
});
