import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';
import { stepShot } from '../_shared/step-shot';

test.describe('Initial Page State', () => {
  let uploadPage: UploadPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
  });

  test('TC-UPLOAD-001: Verify page loads with upload form elements present', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
    // 1. Navigate to the File Uploader page
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    // expect: Page heading 'File Uploader' is visible
    await expect(uploadPage.pageHeading).toBeVisible();

    // expect: Instructional text about choosing/dragging a file is present
    await expect(uploadPage.instructionText).toBeVisible();

    // expect: File input control is visible
    await expect(uploadPage.fileInput).toBeAttached();

    // expect: Upload button is visible
    await expect(uploadPage.uploadButton).toBeVisible();

    await stepShot(page, 1);
  });

  test('TC-UPLOAD-002: Verify file input control displays no file selected initially', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
    // 1. Navigate to the File Uploader page
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Inspect the file input control
    // expect: File input control shows no file selected (empty value)
    await expect(uploadPage.fileInput).toHaveValue('');

    // expect: File input ID is 'file-upload'
    await expect(uploadPage.fileInput).toHaveAttribute('id', 'file-upload');

    // expect: File input name attribute is 'file'
    await expect(uploadPage.fileInput).toHaveAttribute('name', 'file');

    await stepShot(page, 2);
  });
});
