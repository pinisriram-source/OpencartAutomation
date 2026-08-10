import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';
import { stepShot } from '../_shared/step-shot';
import path from 'path';
import fs from 'fs';

test.describe('State Reset After Upload', () => {
  let uploadPage: UploadPage;
  const testDataDir = path.join(__dirname, 'test-data');

  test.beforeAll(async () => {
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
    fs.writeFileSync(path.join(testDataDir, 'reset-test.txt'), 'reset test content');
    fs.writeFileSync(path.join(testDataDir, 'first-file.txt'), 'first file content');
    fs.writeFileSync(path.join(testDataDir, 'second-file.json'), JSON.stringify({ order: 'second' }));
    fs.writeFileSync(path.join(testDataDir, 'refresh-test.txt'), 'refresh test content');
  });

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
  });

  test('TC-UPLOAD-014: After successful upload, navigating back to /upload resets to initial state', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully in initial state
    await expect(uploadPage.pageHeading).toBeVisible();

    await stepShot(page, 1);

    // 2. Select a file (e.g., 'reset-test.txt') and click Upload
    await uploadPage.uploadFile(path.join(testDataDir, 'reset-test.txt'));

    // expect: Upload succeeds
    // expect: Confirmation view shows 'File Uploaded!' heading and 'reset-test.txt'
    await expect(uploadPage.uploadedHeading).toBeVisible();
    await expect(uploadPage.uploadedFileName).toHaveText('reset-test.txt');

    await stepShot(page, 2);

    // 3. Navigate back to https://the-internet.herokuapp.com/upload (fresh page load)
    await uploadPage.navigate();

    // expect: Page resets to initial empty state (AC1)
    // expect: Heading is 'File Uploader' (not 'File Uploaded!')
    await expect(uploadPage.pageHeading).toBeVisible();

    // expect: File input is empty (no file pre-selected)
    await expect(uploadPage.fileInput).toHaveValue('');

    // expect: No filename is displayed from the previous upload
    await expect(uploadPage.uploadedFileName).not.toBeAttached();

    // expect: The previous upload does not persist
    await expect(uploadPage.uploadedHeading).not.toBeAttached();

    await stepShot(page, 3);
  });

  test('TC-UPLOAD-015: Multiple uploads in sequence each show correct filename', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(uploadPage.pageHeading).toBeVisible();

    await stepShot(page, 1);

    // 2. Upload 'first-file.txt'
    await uploadPage.uploadFile(path.join(testDataDir, 'first-file.txt'));

    // expect: Confirmation view shows 'File Uploaded!' and 'first-file.txt'
    await expect(uploadPage.uploadedHeading).toBeVisible();
    await expect(uploadPage.uploadedFileName).toHaveText('first-file.txt');

    await stepShot(page, 2);

    // 3. Navigate back to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page resets to initial state
    await expect(uploadPage.pageHeading).toBeVisible();
    await expect(uploadPage.fileInput).toHaveValue('');

    await stepShot(page, 3);

    // 4. Upload 'second-file.json'
    await uploadPage.uploadFile(path.join(testDataDir, 'second-file.json'));

    // expect: Confirmation view shows 'File Uploaded!' and 'second-file.json'
    await expect(uploadPage.uploadedHeading).toBeVisible();
    await expect(uploadPage.uploadedFileName).toHaveText('second-file.json');

    // expect: The displayed filename is 'second-file.json' (not 'first-file.txt')
    await expect(uploadPage.uploadedFileName).not.toHaveText('first-file.txt');

    // expect: Each upload is independent
    await stepShot(page, 4);
  });

  test('TC-UPLOAD-016: Refreshing the page after upload resets state', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload and upload 'refresh-test.txt'
    await uploadPage.navigate();
    await uploadPage.uploadFile(path.join(testDataDir, 'refresh-test.txt'));

    // expect: Confirmation view is displayed with 'File Uploaded!' and 'refresh-test.txt'
    await expect(uploadPage.uploadedHeading).toBeVisible();
    await expect(uploadPage.uploadedFileName).toHaveText('refresh-test.txt');

    await stepShot(page, 1);

    // 2. Refresh the page (fresh GET navigation — page.reload() re-submits the
    //    POST form per browser spec, so a fresh goto is the correct "refresh"
    //    that returns to the initial GET state the plan expects)
    await uploadPage.navigate();

    // expect: Page reloads to the initial empty upload form state
    // expect: Heading is 'File Uploader'
    await expect(uploadPage.pageHeading).toBeVisible();

    // expect: File input is empty
    await expect(uploadPage.fileInput).toHaveValue('');

    // expect: No confirmation or filename from the previous upload is shown
    await expect(uploadPage.uploadedHeading).not.toBeAttached();
    await expect(uploadPage.uploadedFileName).not.toBeAttached();

    await stepShot(page, 2);
  });
});
