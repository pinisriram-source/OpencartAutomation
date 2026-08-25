import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';
import { stepShot } from '../_shared/step-shot';
import path from 'path';
import fs from 'fs';
import os from 'os';

test.describe('Sequential Upload State Management', () => {
  let uploadPage: UploadPage;
  let tmpDir: string;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'upload-test-'));
  });

  test.afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('TC-UPLOAD-007: Upload a second file after a previous successful upload replaces the displayed filename', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
    const firstFileName = 'first-file.txt';
    const secondFileName = 'second-file.txt';
    const firstFilePath = path.join(tmpDir, firstFileName);
    const secondFilePath = path.join(tmpDir, secondFileName);
    fs.writeFileSync(firstFilePath, 'first file content');
    fs.writeFileSync(secondFilePath, 'second file content');

    // 1. Navigate to the File Uploader page
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a first file
    await uploadPage.uploadFile(firstFilePath);

    // expect: File input shows 'first-file.txt'
    await expect(uploadPage.fileInput).toHaveValue(/first-file\.txt$/);

    await stepShot(page, 2);

    // 3. Click the Upload button
    await uploadPage.clickUpload();

    // expect: Success page displays 'first-file.txt' as the uploaded file
    await expect(uploadPage.uploadedFileName).toHaveText(firstFileName);

    await stepShot(page, 3);

    // 4. Navigate back to the upload form using the browser's back button
    await uploadPage.goBack();

    // expect: Upload form page reloads
    await expect(uploadPage.pageHeading).toBeVisible();

    // expect: File input control is in a clean state (no file pre-selected)
    await expect(uploadPage.fileInput).toHaveValue('');

    // expect: Upload form is ready for a new file selection
    await expect(uploadPage.uploadButton).toBeVisible();

    await stepShot(page, 4);

    // 5. Select a second, different file
    await uploadPage.uploadFile(secondFilePath);

    // expect: File input shows 'second-file.txt'
    await expect(uploadPage.fileInput).toHaveValue(/second-file\.txt$/);

    await stepShot(page, 5);

    // 6. Click the Upload button
    await uploadPage.clickUpload();

    // expect: Success page displays 'second-file.txt'
    await expect(uploadPage.uploadedFileName).toHaveText(secondFileName);

    // expect: Success page does NOT show 'first-file.txt' (no stale state)
    await expect(uploadPage.uploadedFileName).not.toContainText(firstFileName);

    // expect: Only the new file's name is displayed
    await expect(uploadPage.uploadedFileName).toHaveText(secondFileName);

    await stepShot(page, 6);
  });

  test('TC-UPLOAD-008: Navigating back from success page returns to a clean upload form', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
    const fileName = 'test-file.txt';
    const filePath = path.join(tmpDir, fileName);
    fs.writeFileSync(filePath, 'test content');

    // 1. Navigate to the File Uploader page
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a file and upload it
    await uploadPage.uploadFile(filePath);
    await uploadPage.clickUpload();

    // expect: Success page is displayed with 'test-file.txt'
    await expect(uploadPage.uploadedFileName).toHaveText(fileName);

    await stepShot(page, 2);

    // 3. Click the browser's back button
    await uploadPage.goBack();

    // expect: Upload form page reloads
    // expect: File input control shows no file selected (clean state)
    await expect(uploadPage.fileInput).toHaveValue('');

    // expect: Page heading 'File Uploader' is visible
    await expect(uploadPage.pageHeading).toBeVisible();

    // expect: Instructional text is present
    await expect(uploadPage.instructionText).toBeVisible();

    // expect: Upload button is visible and functional
    await expect(uploadPage.uploadButton).toBeVisible();

    await stepShot(page, 3);
  });
});
