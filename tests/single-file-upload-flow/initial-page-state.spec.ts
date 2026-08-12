import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';
import { stepShot } from '../_shared/step-shot';

test.describe('Initial Page State', () => {
  let uploadPage: UploadPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
  });

  test('TC-UPLOAD-001: Verify initial page state shows empty file input and no confirmation', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    // expect: Page title is 'The Internet'
    await expect(page).toHaveTitle('The Internet');

    await stepShot(page, 1);

    // 2. Inspect the page content
    // expect: 'File Uploader' heading (h3) is visible
    await expect(uploadPage.pageHeading).toBeVisible();

    // expect: Instruction text is visible
    await expect(uploadPage.instructionText).toBeVisible();

    // expect: File input (#file-upload) is visible and empty
    await expect(uploadPage.fileInput).toBeVisible();
    await expect(uploadPage.fileInput).toHaveValue('');

    // expect: Upload button (#file-submit) with text 'Upload' is visible and enabled
    await expect(uploadPage.uploadButton).toBeVisible();
    await expect(uploadPage.uploadButton).toBeEnabled();

    // expect: No 'File Uploaded!' heading is present on the page
    await expect(uploadPage.confirmationHeading).not.toBeAttached();

    // expect: No uploaded filename is displayed anywhere on the page
    await expect(uploadPage.uploadedFileName).not.toBeAttached();

    await stepShot(page, 2);
  });
});
