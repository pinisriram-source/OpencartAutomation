import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';

test.describe('Initial Page State', () => {
  let uploadPage: UploadPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
  });

  test('TC-UPLOAD-001: Verify page load shows File Uploader heading, empty file input, and Upload button', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
    await uploadPage.navigate();

    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');
    await expect(uploadPage.pageHeading).toBeVisible();
    await expect(uploadPage.fileInput).toBeVisible();
    await expect(uploadPage.fileInput).toHaveValue('');
    await expect(uploadPage.uploadButton).toBeVisible();
    await expect(uploadPage.successHeading).not.toBeAttached();
    await expect(uploadPage.uploadedFiles).not.toBeAttached();
  });

  test('TC-UPLOAD-002: Verify file input has correct attributes and no restrictions', { tag: ['@sanity', '@regression'] }, async () => {
    await uploadPage.navigate();

    await expect(uploadPage.fileInput).toHaveAttribute('id', 'file-upload');
    await expect(uploadPage.fileInput).toHaveAttribute('name', 'file');
    await expect(uploadPage.fileInput).toHaveAttribute('type', 'file');
    await expect(uploadPage.fileInput).not.toHaveAttribute('required', /.*/);
    await expect(uploadPage.fileInput).not.toHaveAttribute('multiple', /.*/);
    await expect(uploadPage.fileInput).not.toHaveAttribute('accept', /.*/);
  });

  test('TC-UPLOAD-003: Verify form element has correct attributes for multipart file upload', { tag: ['@sanity', '@regression'] }, async () => {
    await uploadPage.navigate();

    const form = uploadPage.form;
    await expect(form).toBeAttached();
    await expect(form).toHaveAttribute('action', /\/upload$/);
    await expect(form).toHaveAttribute('method', 'post');
    await expect(form).toHaveAttribute('enctype', 'multipart/form-data');
  });
});
