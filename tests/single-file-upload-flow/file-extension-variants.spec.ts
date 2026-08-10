import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';

test.describe('File Extension Variants', () => {
  let uploadPage: UploadPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
  });

  test('TC-UPLOAD-004: Upload a .png file and verify filename displayed correctly', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    // 2. Select a test .png file using the file input
    await uploadPage.selectFile('test-image.png', Buffer.from('fake png content'));

    // expect: File input reflects the selected filename (e.g., "test-image.png")
    await expect(uploadPage.fileInput).toHaveValue(/test-image\.png/);

    // 3. Click the "Upload" button
    await uploadPage.clickUpload();

    // expect: Page navigates to the confirmation view and shows "File Uploaded!" heading
    await expect(uploadPage.uploadedHeading).toBeVisible();

    // expect: Uploaded filename "test-image.png" is displayed exactly as provided
    await expect(uploadPage.uploadedFileName).toHaveText('test-image.png');
  });

  test('TC-UPLOAD-005: Upload a .json file and verify filename displayed correctly', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    // 2. Select a test .json file using the file input
    await uploadPage.selectFile('test-data.json', Buffer.from('{"key": "value"}'));

    // expect: File input reflects the selected filename (e.g., "test-data.json")
    await expect(uploadPage.fileInput).toHaveValue(/test-data\.json/);

    // 3. Click the "Upload" button
    await uploadPage.clickUpload();

    // expect: Page navigates to the confirmation view and shows "File Uploaded!" heading
    await expect(uploadPage.uploadedHeading).toBeVisible();

    // expect: Uploaded filename "test-data.json" is displayed exactly as provided
    await expect(uploadPage.uploadedFileName).toHaveText('test-data.json');
  });

  test('TC-UPLOAD-006: Upload a .pdf file and verify filename displayed correctly', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    // 2. Select a test .pdf file using the file input
    await uploadPage.selectFile('test-document.pdf', Buffer.from('fake pdf content'));

    // expect: File input reflects the selected filename (e.g., "test-document.pdf")
    await expect(uploadPage.fileInput).toHaveValue(/test-document\.pdf/);

    // 3. Click the "Upload" button
    await uploadPage.clickUpload();

    // expect: Page navigates to the confirmation view and shows "File Uploaded!" heading
    await expect(uploadPage.uploadedHeading).toBeVisible();

    // expect: Uploaded filename "test-document.pdf" is displayed exactly as provided
    await expect(uploadPage.uploadedFileName).toHaveText('test-document.pdf');
  });
});
