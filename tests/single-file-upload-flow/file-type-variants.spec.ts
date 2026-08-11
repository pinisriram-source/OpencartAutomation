import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';
import { stepShot } from '../_shared/step-shot';

test.describe('File Type Variants', () => {
  let uploadPage: UploadPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
  });

  test('TC-UPLOAD-003: Upload a PNG image file and verify confirmation with exact filename', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
    // 1. Navigate to the File Uploader page
    await uploadPage.navigate();
    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');
    await stepShot(page, 1);

    // 2. Select a PNG image file (e.g., "image.png") in the file input
    await uploadPage.uploadFile('image.png', Buffer.from('fake-png-content'));
    // expect: File is selected successfully
    await expect(uploadPage.fileInput).not.toHaveValue('');
    await stepShot(page, 2);

    // 3. Click the "Upload" submit button
    await uploadPage.clickUpload();
    // expect: Page navigates to the confirmation view
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');
    // expect: "File Uploaded!" heading is visible
    await expect(uploadPage.confirmationHeading).toBeVisible();
    // expect: Uploaded filename "image.png" is displayed exactly as provided
    await expect(uploadPage.uploadedFileName).toHaveText('image.png');
    await stepShot(page, 3);
  });

  test('TC-UPLOAD-004: Upload a JSON file and verify confirmation with exact filename', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to the File Uploader page
    await uploadPage.navigate();
    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');
    await stepShot(page, 1);

    // 2. Select a JSON file (e.g., "data.json") in the file input
    await uploadPage.uploadFile('data.json', Buffer.from('{"key": "value"}'));
    // expect: File is selected successfully
    await expect(uploadPage.fileInput).not.toHaveValue('');
    await stepShot(page, 2);

    // 3. Click the "Upload" submit button
    await uploadPage.clickUpload();
    // expect: Page navigates to the confirmation view
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');
    // expect: "File Uploaded!" heading is visible
    await expect(uploadPage.confirmationHeading).toBeVisible();
    // expect: Uploaded filename "data.json" is displayed exactly as provided
    await expect(uploadPage.uploadedFileName).toHaveText('data.json');
    await stepShot(page, 3);
  });

  test('TC-UPLOAD-005: Upload a PDF file and verify confirmation with exact filename', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to the File Uploader page
    await uploadPage.navigate();
    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');
    await stepShot(page, 1);

    // 2. Select a PDF file (e.g., "document.pdf") in the file input
    await uploadPage.uploadFile('document.pdf', Buffer.from('fake-pdf-content'));
    // expect: File is selected successfully
    await expect(uploadPage.fileInput).not.toHaveValue('');
    await stepShot(page, 2);

    // 3. Click the "Upload" submit button
    await uploadPage.clickUpload();
    // expect: Page navigates to the confirmation view
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');
    // expect: "File Uploaded!" heading is visible
    await expect(uploadPage.confirmationHeading).toBeVisible();
    // expect: Uploaded filename "document.pdf" is displayed exactly as provided
    await expect(uploadPage.uploadedFileName).toHaveText('document.pdf');
    await stepShot(page, 3);
  });

  test('TC-UPLOAD-014: Verify file input accepts any file type (no extension restriction)', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
    // 1. Navigate to the File Uploader page
    await uploadPage.navigate();
    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');
    await stepShot(page, 1);

    // 2. Inspect the file input element
    // expect: File input (id="file-upload") has no "accept" attribute restriction
    await expect(uploadPage.fileInput).not.toHaveAttribute('accept');
    // expect: File input can accept any file type
    await stepShot(page, 2);

    // 3. Select a file with an uncommon extension (e.g., "data.csv") and click Upload
    await uploadPage.uploadFile('data.csv', Buffer.from('col1,col2\nval1,val2'));
    await uploadPage.clickUpload();
    // expect: Upload succeeds
    // expect: "File Uploaded!" heading is visible
    await expect(uploadPage.confirmationHeading).toBeVisible();
    // expect: Uploaded filename "data.csv" is displayed with the .csv extension preserved
    await expect(uploadPage.uploadedFileName).toHaveText('data.csv');
    await stepShot(page, 3);
  });
});
