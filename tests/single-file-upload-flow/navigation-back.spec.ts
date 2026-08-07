import { test, expect } from '@playwright/test';
import path from 'path';
import { UploadPage } from './page-objects/upload.page';
import { UploadSuccessPage } from './page-objects/upload-success.page';

const FIXTURES_DIR = path.resolve(__dirname, '../../');
// upload-sample.txt lives under src/data/fixtures/, not at the repo root.
const UPLOAD_SAMPLE = path.join(FIXTURES_DIR, 'src', 'data', 'fixtures', 'upload-sample.txt');

test.describe('Navigation Back from Success Page', () => {
  let uploadPage: UploadPage;
  let successPage: UploadSuccessPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
    successPage = new UploadSuccessPage(page);
    await uploadPage.navigate();
  });

  test('TC-UPLOAD-022: Navigating back from success page returns to upload form', { tag: '@sanity' }, async ({ page }) => {
    await uploadPage.uploadFile(UPLOAD_SAMPLE);
    await expect(successPage.pageHeading).toBeVisible();

    await page.goBack();

    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');
    await expect(uploadPage.pageHeading).toBeVisible();
    await expect(uploadPage.fileInput).toBeAttached();
    await expect(uploadPage.uploadButton).toBeVisible();
  });

  test('TC-UPLOAD-023: File input retains selected file after navigating back from success page', { tag: '@functional' }, async ({ page }) => {
    await uploadPage.selectFile(UPLOAD_SAMPLE);
    await expect(uploadPage.fileInput).toHaveValue(/upload-sample\.txt$/);

    await uploadPage.clickUpload();
    await expect(successPage.pageHeading).toBeVisible();

    await page.goBack();

    await expect(uploadPage.fileInput).toHaveValue(/upload-sample\.txt$/);
    const fileCount = await uploadPage.fileInput.evaluate((el: HTMLInputElement) => el.files?.length ?? 0);
    expect(fileCount).toBe(1);
  });

  test('TC-UPLOAD-024: Fresh page load after navigation back clears file selection', { tag: '@functional' }, async ({ page }) => {
    await uploadPage.uploadFile(UPLOAD_SAMPLE);
    await expect(successPage.pageHeading).toBeVisible();

    await page.goto('https://the-internet.herokuapp.com/upload');

    await expect(uploadPage.fileInput).toHaveValue('');
    const fileCount = await uploadPage.fileInput.evaluate((el: HTMLInputElement) => el.files?.length ?? 0);
    expect(fileCount).toBe(0);
  });
});
