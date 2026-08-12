import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';
import { stepShot } from '../_shared/step-shot';

test.describe('State Reset After Upload', () => {
  let uploadPage: UploadPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
  });

  test('TC-UPLOAD-013: After successful upload, navigating back resets page to initial state', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a file (e.g., 'test.txt') and click Upload
    await uploadPage.uploadFile('test.txt');

    // expect: Confirmation view appears
    // expect: 'File Uploaded!' heading is visible
    await expect(uploadPage.confirmationHeading).toBeVisible();

    // expect: Filename 'test.txt' is displayed
    await expect(uploadPage.uploadedFileName).toHaveText('test.txt');

    await stepShot(page, 2);

    // 3. Navigate back to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    // expect: 'File Uploader' heading is visible (not 'File Uploaded!')
    await expect(uploadPage.pageHeading).toBeVisible();

    // expect: File input is empty and visible
    await expect(uploadPage.fileInput).toBeVisible();
    await expect(uploadPage.fileInput).toHaveValue('');

    // expect: Upload button is visible
    await expect(uploadPage.uploadButton).toBeVisible();

    // expect: No 'File Uploaded!' heading is present
    await expect(uploadPage.confirmationHeading).not.toBeAttached();

    // expect: No uploaded filename is displayed
    await expect(uploadPage.uploadedFileName).not.toBeAttached();

    await stepShot(page, 3);
  });
});
