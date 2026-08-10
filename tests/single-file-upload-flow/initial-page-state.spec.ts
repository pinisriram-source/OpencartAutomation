import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';

test.describe('Initial Page State', () => {
  let uploadPage: UploadPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
  });

  test('TC-UPLOAD-001: Verify page load shows empty file input and no upload confirmation', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    // expect: URL is https://the-internet.herokuapp.com/upload
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    // 2. Inspect the page content
    // expect: "File Uploader" heading is visible
    await expect(uploadPage.pageHeading).toBeVisible();

    // expect: File input with id="file-upload" is present and visible
    await expect(uploadPage.fileInput).toBeVisible();

    // expect: File input shows no file selected (displays "No file chosen" or equivalent)
    await expect(uploadPage.fileInput).toHaveValue('');

    // expect: "Upload" button with id="file-submit" is present and visible
    await expect(uploadPage.uploadButton).toBeVisible();

    // expect: No "File Uploaded!" heading is present
    await expect(uploadPage.uploadedHeading).not.toBeAttached();

    // expect: No uploaded filename is displayed anywhere on the page
    await expect(uploadPage.uploadedFileName).not.toBeAttached();
  });

  test('TC-UPLOAD-002: Verify instructional text and page structural elements', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    // 2. Inspect the page for instructional content and structural elements
    // expect: Instructional text about choosing a file and uploading is visible
    await expect(uploadPage.instructionText).toBeVisible();

    // expect: Drag-and-drop upload widget (id="drag-drop-upload") is present on the page
    await expect(uploadPage.dragDropArea).toBeAttached();

    // expect: Drag-and-drop widget is visually distinct from the file input under test
    await expect(uploadPage.dragDropArea).toBeVisible();

    // expect: The file input and Upload button are separate from the drag-and-drop area
    await expect(uploadPage.fileInput).toBeVisible();
    await expect(uploadPage.uploadButton).toBeVisible();
  });
});
