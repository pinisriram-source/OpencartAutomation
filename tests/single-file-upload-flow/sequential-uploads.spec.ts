import { test, expect } from '@playwright/test';
import path from 'path';
import { UploadPage } from './page-objects/upload.page';
import { UploadSuccessPage } from './page-objects/upload-success.page';

const FIXTURES_DIR = path.resolve(__dirname, '../../');
const UPLOAD_SAMPLE = path.join(FIXTURES_DIR, 'upload-sample.txt');
const PACKAGE_JSON = path.join(FIXTURES_DIR, 'package.json');
const CLAUDE_MD = path.join(FIXTURES_DIR, 'CLAUDE.md');

test.describe('Sequential Uploads', () => {
  let uploadPage: UploadPage;
  let successPage: UploadSuccessPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
    successPage = new UploadSuccessPage(page);
    await uploadPage.navigate();
  });

  test('TC-UPLOAD-017: Uploading a second file after a successful upload displays the new file name', { tag: '@sanity' }, async ({ page }) => {
    await uploadPage.uploadFile(UPLOAD_SAMPLE);
    await expect(successPage.uploadedFileName).toHaveText('upload-sample.txt');

    await page.goBack();
    await expect(uploadPage.pageHeading).toBeVisible();

    await uploadPage.selectFile(PACKAGE_JSON);
    await expect(uploadPage.fileInput).toHaveValue(/package\.json$/);

    await uploadPage.clickUpload();
    await expect(successPage.uploadedFileName).toHaveText('package.json');
    await expect(successPage.uploadedFileName).not.toHaveText('upload-sample.txt');
  });

  test('TC-UPLOAD-018: Three sequential uploads each display the correct current file name', { tag: '@functional' }, async ({ page }) => {
    await uploadPage.uploadFile(UPLOAD_SAMPLE);
    await expect(successPage.uploadedFileName).toHaveText('upload-sample.txt');

    await page.goBack();
    await uploadPage.uploadFile(PACKAGE_JSON);
    await expect(successPage.uploadedFileName).toHaveText('package.json');

    await page.goBack();
    await uploadPage.uploadFile(CLAUDE_MD);
    await expect(successPage.uploadedFileName).toHaveText('CLAUDE.md');
  });
});
