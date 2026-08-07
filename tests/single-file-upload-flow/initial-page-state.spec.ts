import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';

test.describe('Initial Page State', () => {
  let uploadPage: UploadPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
  });

  test('TC-UPLOAD-001: Verify upload page loads with file input and upload button', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
    await uploadPage.navigate();

    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');
    await expect(page).toHaveTitle('The Internet');

    await expect(uploadPage.pageHeading).toBeVisible();
    await expect(uploadPage.instructionText).toBeVisible();
    await expect(uploadPage.fileInput).toBeAttached();
    await expect(uploadPage.uploadButton).toBeVisible();
  });

  test('TC-UPLOAD-002: Verify file input is empty on initial page load', { tag: ['@sanity', '@regression'] }, async () => {
    await uploadPage.navigate();

    await expect(uploadPage.fileInput).toHaveValue('');
    const files = await uploadPage.fileInput.evaluate((el: HTMLInputElement) => el.files?.length ?? 0);
    expect(files).toBe(0);
  });

  test('TC-UPLOAD-003: Verify upload button is enabled on initial page load', { tag: ['@sanity', '@regression'] }, async () => {
    await uploadPage.navigate();

    await expect(uploadPage.uploadButton).toBeVisible();
    await expect(uploadPage.uploadButton).toBeEnabled();
    await expect(uploadPage.uploadButton).toHaveAttribute('type', 'submit');
  });

  test('TC-UPLOAD-004: Verify form attributes are configured for file upload', { tag: ['@sanity', '@regression'] }, async () => {
    await uploadPage.navigate();

    await expect(uploadPage.form).toBeAttached();
    await expect(uploadPage.form).toHaveAttribute('method', /post/i);
    await expect(uploadPage.form).toHaveAttribute('enctype', 'multipart/form-data');
    await expect(uploadPage.fileInput).toHaveAttribute('name', 'file');
  });
});
