import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';
import { stepShot } from '../_shared/step-shot';

test.describe('File Input Behavior', () => {
  let uploadPage: UploadPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
  });

  test('TC-UPLOAD-014: File input accepts selection change before upload', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a .txt file (e.g., 'original.txt')
    await uploadPage.selectFile('original.txt', Buffer.from('original content'));

    // expect: File 'original.txt' is selected in the input
    await expect(uploadPage.fileInput).toHaveValue(/original\.txt/);

    await stepShot(page, 2);

    // 3. Before clicking Upload, select a different file (e.g., 'replacement.json')
    await uploadPage.selectFile('replacement.json', Buffer.from('{"replaced":true}'));

    // expect: File 'replacement.json' is now selected, replacing 'original.txt'
    await expect(uploadPage.fileInput).toHaveValue(/replacement\.json/);

    await stepShot(page, 3);

    // 4. Click the Upload button
    await uploadPage.clickUpload();

    // expect: Confirmation view appears
    // expect: 'File Uploaded!' heading is visible
    await expect(uploadPage.confirmationHeading).toBeVisible();

    // expect: The displayed filename is 'replacement.json' (the last selected file, not 'original.txt')
    await expect(uploadPage.uploadedFileName).toHaveText('replacement.json');

    await stepShot(page, 4);
  });

  test('TC-UPLOAD-015: Upload button remains enabled throughout interaction', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    // expect: Upload button is visible and enabled
    await expect(uploadPage.uploadButton).toBeVisible();
    await expect(uploadPage.uploadButton).toBeEnabled();

    await stepShot(page, 1);

    // 2. Select a file in the file input
    await uploadPage.selectFile('temp.txt', Buffer.from('temp'));

    // expect: Upload button remains enabled (not disabled)
    await expect(uploadPage.uploadButton).toBeEnabled();

    await stepShot(page, 2);

    // 3. Clear the file selection (select then cancel file dialog)
    await uploadPage.clearFileSelection();

    // expect: Upload button remains enabled even with no file selected
    await expect(uploadPage.uploadButton).toBeEnabled();

    await stepShot(page, 3);
  });

  test('TC-UPLOAD-016: Page URL remains /upload throughout the upload flow', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    // expect: URL is exactly https://the-internet.herokuapp.com/upload
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a file and click Upload
    await uploadPage.uploadFile('url-test.txt');

    // expect: Confirmation view appears
    await expect(uploadPage.confirmationHeading).toBeVisible();

    // expect: URL remains exactly https://the-internet.herokuapp.com/upload (no query params or path change)
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 2);

    // 3. Navigate back to /upload
    await uploadPage.navigate();

    // expect: URL is still exactly https://the-internet.herokuapp.com/upload
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 3);
  });
});
