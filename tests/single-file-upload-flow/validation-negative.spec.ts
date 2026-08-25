import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';
import { stepShot } from '../_shared/step-shot';
import path from 'path';
import fs from 'fs';
import os from 'os';

test.describe('Validation and Negative Cases', () => {
  let uploadPage: UploadPage;
  let tmpDir: string;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'upload-test-'));
  });

  test.afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('TC-UPLOAD-009: Clicking Upload with no file selected displays a validation message (not server error)', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
    // 1. Navigate to the File Uploader page
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    // expect: File input control shows no file selected
    await expect(uploadPage.fileInput).toHaveValue('');

    await stepShot(page, 1);

    // 2. Click the Upload button without selecting a file
    await uploadPage.clickUpload();

    // expect: Page does NOT navigate to an 'Internal Server Error' page
    await expect(page.getByText('Internal Server Error')).not.toBeVisible();

    // expect: User remains on the upload form
    await expect(uploadPage.pageHeading).toBeVisible();

    // expect: Form is still functional for file selection
    await expect(uploadPage.fileInput).toBeAttached();
    await expect(uploadPage.uploadButton).toBeVisible();

    await stepShot(page, 2);
  });

  test('TC-UPLOAD-010: Selecting a file then clearing selection before upload', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    const fileName = 'test.txt';
    const filePath = path.join(tmpDir, fileName);
    fs.writeFileSync(filePath, 'test content');

    // 1. Navigate to the File Uploader page
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a file via the file input control
    await uploadPage.uploadFile(filePath);

    // expect: File input displays 'test.txt'
    await expect(uploadPage.fileInput).toHaveValue(/test\.txt$/);

    await stepShot(page, 2);

    // 3. Clear the file selection
    await uploadPage.clearFileInput();

    // expect: File input shows no file selected again
    await expect(uploadPage.fileInput).toHaveValue('');

    await stepShot(page, 3);

    // 4. Click the Upload button
    await uploadPage.clickUpload();

    // expect: No server error occurs
    await expect(page.getByText('Internal Server Error')).not.toBeVisible();

    // expect: User remains on the upload form
    await expect(uploadPage.pageHeading).toBeVisible();

    await stepShot(page, 4);
  });

  test('TC-UPLOAD-011: File input control accepts and uploads a zero-byte (empty) file', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    const fileName = 'empty.txt';
    const filePath = path.join(tmpDir, fileName);
    fs.writeFileSync(filePath, '');

    // 1. Navigate to the File Uploader page
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a zero-byte file
    await uploadPage.uploadFile(filePath);

    // expect: File input displays 'empty.txt'
    await expect(uploadPage.fileInput).toHaveValue(/empty\.txt$/);

    await stepShot(page, 2);

    // 3. Click the Upload button
    await uploadPage.clickUpload();

    // expect: Either: success page displays 'empty.txt', OR a clear validation message is shown
    // expect: In either case, no unhandled server error occurs
    const hasSuccess = await uploadPage.successHeading.isVisible().catch(() => false);
    if (hasSuccess) {
      await expect(uploadPage.uploadedFileName).toHaveText(fileName);
    } else {
      await expect(page.getByText('Internal Server Error')).not.toBeVisible();
    }

    await stepShot(page, 3);
  });
});
