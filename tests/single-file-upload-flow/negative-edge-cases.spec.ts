import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';
import { stepShot } from '../_shared/step-shot';
import path from 'path';
import fs from 'fs';

test.describe('Negative and Edge Cases', () => {
  let uploadPage: UploadPage;
  const testDataDir = path.join(__dirname, 'test-data');

  test.beforeAll(async () => {
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
    fs.writeFileSync(path.join(testDataDir, 'test.txt'), 'test content');
  });

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
  });

  test('TC-UPLOAD-011: Clicking Upload without selecting a file shows Internal Server Error', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    // expect: File input is empty (no file selected)
    await expect(uploadPage.fileInput).toHaveValue('');

    await stepShot(page, 1);

    // 2. Click the Upload button without selecting any file
    await uploadPage.clickUpload();

    // expect: Page navigates/reloads
    // expect: An 'Internal Server Error' heading (h1) is displayed
    await expect(uploadPage.internalServerErrorHeading).toBeVisible();

    // expect: The upload does NOT complete successfully (no 'File Uploaded!' message)
    await expect(uploadPage.uploadedHeading).not.toBeAttached();

    // expect: URL remains https://the-internet.herokuapp.com/upload
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 2);
  });

  test('TC-UPLOAD-012: File input accepts file selection via browser dialog', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a file using the file input via Playwright's setInputFiles API
    await uploadPage.selectFile(path.join(testDataDir, 'test.txt'));

    // expect: File input element now shows the selected filename
    await expect(uploadPage.fileInput).not.toHaveValue('');

    // expect: The file is queued for upload (verifiable via input.files.length > 0)
    const filesCount = await uploadPage.fileInput.evaluate((el: HTMLInputElement) => el.files?.length ?? 0);
    expect(filesCount).toBeGreaterThan(0);

    await stepShot(page, 2);

    // 3. Verify the file input reflects the selection before submission
    // expect: Upload button remains enabled and ready to submit
    await expect(uploadPage.uploadButton).toBeEnabled();

    await stepShot(page, 3);
  });

  test('TC-UPLOAD-013: Selecting then clearing a file leaves input empty and submit fails', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    // expect: File input is empty
    await expect(uploadPage.fileInput).toHaveValue('');

    await stepShot(page, 1);

    // 2. Select a file (e.g., 'test.txt')
    await uploadPage.selectFile(path.join(testDataDir, 'test.txt'));

    // expect: File input shows 'test.txt' is selected
    await expect(uploadPage.fileInput).not.toHaveValue('');

    await stepShot(page, 2);

    // 3. Clear the file selection (setInputFiles with empty array)
    await uploadPage.clearFileSelection();

    // expect: File input is now empty
    await expect(uploadPage.fileInput).toHaveValue('');

    // expect: No file is selected (input.files.length === 0)
    const filesCount = await uploadPage.fileInput.evaluate((el: HTMLInputElement) => el.files?.length ?? 0);
    expect(filesCount).toBe(0);

    await stepShot(page, 3);

    // 4. Click the Upload button
    await uploadPage.clickUpload();

    // expect: Behaves as AC6 (no file selected case): 'Internal Server Error' is displayed
    await expect(uploadPage.internalServerErrorHeading).toBeVisible();

    await stepShot(page, 4);
  });
});
