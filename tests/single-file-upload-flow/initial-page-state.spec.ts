import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';
import { stepShot } from '../_shared/step-shot';

test.describe('Initial Page State', () => {
  let uploadPage: UploadPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
  });

  test('TC-UPLOAD-001: Verify initial page load state shows file input and no confirmation', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    // expect: Page title is 'The Internet'
    await expect(page).toHaveTitle('The Internet');

    await stepShot(page, 1);

    // 2. Verify the initial page content
    // expect: Heading 'File Uploader' (h3) is visible
    await expect(uploadPage.pageHeading).toBeVisible();

    // expect: File input element (id='file-upload') is present and empty
    await expect(uploadPage.fileInput).toBeAttached();
    await expect(uploadPage.fileInput).toHaveValue('');

    // expect: Upload button (id='file-submit') is visible and enabled
    await expect(uploadPage.uploadButton).toBeVisible();
    await expect(uploadPage.uploadButton).toBeEnabled();

    // expect: Instructional text 'Choose a file on your system and then click upload.' is present
    await expect(uploadPage.instructionText).toBeVisible();

    // expect: No 'File Uploaded!' heading is present
    await expect(uploadPage.uploadedHeading).not.toBeAttached();

    // expect: No uploaded filename is displayed anywhere on the page
    await expect(uploadPage.uploadedFileName).not.toBeAttached();

    await stepShot(page, 2);
  });
});
