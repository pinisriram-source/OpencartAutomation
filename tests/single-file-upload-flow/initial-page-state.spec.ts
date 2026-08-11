import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';
import { stepShot } from '../_shared/step-shot';

test.describe('Initial Page State', () => {
  let uploadPage: UploadPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
  });

  test('TC-UPLOAD-001: Verify initial page load state shows File Uploader heading, empty file input, and no confirmation', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
    // 1. Navigate to the File Uploader page (https://the-internet.herokuapp.com/upload)
    await uploadPage.navigate();
    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');
    await stepShot(page, 1);

    // 2. Inspect the page content
    // expect: "File Uploader" heading is visible
    await expect(uploadPage.pageHeading).toBeVisible();
    // expect: File input (id="file-upload") is visible and empty (no file selected)
    await expect(uploadPage.fileInput).toBeVisible();
    await expect(uploadPage.fileInput).toHaveValue('');
    // expect: "Upload" submit button (id="file-submit") is visible
    await expect(uploadPage.uploadButton).toBeVisible();
    // expect: No "File Uploaded!" confirmation heading is present
    await expect(uploadPage.confirmationHeading).not.toBeAttached();
    // expect: No uploaded filename is displayed anywhere on the page
    await expect(uploadPage.uploadedFileName).not.toBeAttached();
    await stepShot(page, 2);
  });

  test('TC-UPLOAD-015: Verify file input is not marked as required', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to the File Uploader page
    await uploadPage.navigate();
    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');
    await stepShot(page, 1);

    // 2. Inspect the file input element's attributes
    // expect: File input (id="file-upload") is NOT marked with the HTML "required" attribute
    await expect(uploadPage.fileInput).not.toHaveAttribute('required', '');
    // expect: File input does not have browser-level validation enforcing file selection
    await expect(uploadPage.fileInput).toHaveAttribute('type', 'file');
    await stepShot(page, 2);
  });
});
