import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';
import { stepShot } from '../_shared/step-shot';

test.describe('Basic Upload Happy Path', () => {
  let uploadPage: UploadPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
  });

  test('TC-UPLOAD-002: Basic upload with .txt file succeeds and shows confirmation', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a .txt file in the file input (e.g., 'test.txt')
    await uploadPage.selectFile('test.txt', Buffer.from('hello world'));

    // expect: File is selected in the input
    await expect(uploadPage.fileInput).toHaveValue(/test\.txt/);

    await stepShot(page, 2);

    // 3. Click the Upload button
    await uploadPage.clickUpload();

    // expect: Page navigates/reloads to the confirmation view
    // expect: URL remains https://the-internet.herokuapp.com/upload
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    // expect: 'File Uploaded!' heading is visible
    await expect(uploadPage.confirmationHeading).toBeVisible();

    // expect: The exact filename 'test.txt' is displayed on the confirmation view
    await expect(uploadPage.uploadedFileName).toHaveText('test.txt');

    await stepShot(page, 3);
  });

  test('TC-UPLOAD-003: Upload confirmation displays exact uploaded filename', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a .txt file with a unique name (e.g., 'my-test-file.txt')
    await uploadPage.selectFile('my-test-file.txt', Buffer.from('content'));

    // expect: File is selected
    await expect(uploadPage.fileInput).toHaveValue(/my-test-file\.txt/);

    await stepShot(page, 2);

    // 3. Click the Upload button
    await uploadPage.clickUpload();

    // expect: Confirmation view appears
    // expect: 'File Uploaded!' heading is visible
    await expect(uploadPage.confirmationHeading).toBeVisible();

    await stepShot(page, 3);

    // 4. Verify the displayed filename
    // expect: The displayed filename exactly matches 'my-test-file.txt' (the name provided)
    await expect(uploadPage.uploadedFileName).toHaveText('my-test-file.txt');

    // expect: Filename is displayed in the content area below the 'File Uploaded!' heading
    await expect(uploadPage.uploadedFileName).toBeVisible();

    await stepShot(page, 4);
  });
});
