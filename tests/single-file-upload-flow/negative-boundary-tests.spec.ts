import { test, expect } from '@playwright/test';
import path from 'path';
import { UploadPage } from './page-objects/upload.page';
import { UploadSuccessPage } from './page-objects/upload-success.page';

const FIXTURES_DIR = path.resolve(__dirname, '../../');
// upload-sample.txt lives under src/data/fixtures/, unlike PACKAGE_JSON
// below which really is at the repo root.
const UPLOAD_SAMPLE = path.join(FIXTURES_DIR, 'src', 'data', 'fixtures', 'upload-sample.txt');
const PACKAGE_JSON = path.join(FIXTURES_DIR, 'package.json');

test.describe('Negative and Boundary Tests', () => {
  let uploadPage: UploadPage;
  let successPage: UploadSuccessPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
    successPage = new UploadSuccessPage(page);
    await uploadPage.navigate();
  });

  test('TC-UPLOAD-025: Clicking Upload button multiple times with the same file does not cause errors', { tag: '@functional' }, async ({ page }) => {
    await uploadPage.selectFile(UPLOAD_SAMPLE);
    await uploadPage.clickUpload();
    await expect(successPage.uploadedFileName).toHaveText('upload-sample.txt');

    await page.goBack();
    await uploadPage.clickUpload();
    await expect(successPage.uploadedFileName).toHaveText('upload-sample.txt');
  });

  test('TC-UPLOAD-026: File input only accepts single file selection, not multiple', { tag: '@functional' }, async () => {
    const multiple = await uploadPage.fileInput.getAttribute('multiple');
    expect(multiple).toBeNull();

    await uploadPage.selectFile(UPLOAD_SAMPLE);
    await uploadPage.selectFile(PACKAGE_JSON);

    const fileCount = await uploadPage.fileInput.evaluate((el: HTMLInputElement) => el.files?.length ?? 0);
    expect(fileCount).toBe(1);
    const fileName = await uploadPage.fileInput.evaluate((el: HTMLInputElement) => el.files?.[0]?.name ?? '');
    expect(fileName).toBe('package.json');
  });

  test('TC-UPLOAD-027: Form submission works even without client-side JavaScript enabled', { tag: '@functional' }, async () => {
    await expect(uploadPage.form).toHaveAttribute('method', /post/i);
    await expect(uploadPage.form).toHaveAttribute('enctype', 'multipart/form-data');
    await expect(uploadPage.uploadButton).toHaveAttribute('type', 'submit');
  });

  test('TC-UPLOAD-028: Navigating away and back to upload page resets to clean state', { tag: '@functional' }, async ({ page }) => {
    await uploadPage.selectFile(UPLOAD_SAMPLE);
    await expect(uploadPage.fileInput).toHaveValue(/upload-sample\.txt$/);

    await page.goto('https://the-internet.herokuapp.com/');
    await page.goto('https://the-internet.herokuapp.com/upload');

    await expect(uploadPage.fileInput).toHaveValue('');
    const fileCount = await uploadPage.fileInput.evaluate((el: HTMLInputElement) => el.files?.length ?? 0);
    expect(fileCount).toBe(0);
  });

  test('TC-UPLOAD-029: File input accept attribute is not restrictive (no file type filtering)', { tag: '@functional' }, async () => {
    const accept = await uploadPage.fileInput.getAttribute('accept');
    expect(accept).toBeNull();
  });

  test('TC-UPLOAD-030: Success page does not have a form or upload controls', { tag: '@functional' }, async ({ page }) => {
    await uploadPage.uploadFile(UPLOAD_SAMPLE);
    await expect(successPage.pageHeading).toBeVisible();
    await expect(successPage.uploadedFileName).toBeVisible();

    await expect(page.locator('#file-upload')).not.toBeAttached();
    await expect(page.locator('#file-submit')).not.toBeAttached();
    await expect(page.locator('form[enctype="multipart/form-data"]')).not.toBeAttached();
  });
});
