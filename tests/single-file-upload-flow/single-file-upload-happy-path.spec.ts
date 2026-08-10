import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';

test.describe('Single File Upload Happy Path', () => {
  let uploadPage: UploadPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
  });

  test('TC-UPLOAD-003: Upload a single .txt file and verify confirmation view', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    // 2. Select a test .txt file using the file input (id="file-upload")
    await uploadPage.selectFile('test-file.txt', Buffer.from('test content'));

    // expect: File input reflects the selected filename (e.g., "test-file.txt")
    await expect(uploadPage.fileInput).toHaveValue(/test-file\.txt/);

    // 3. Click the "Upload" button (id="file-submit")
    await uploadPage.clickUpload();

    // expect: Page navigates to the confirmation view
    // expect: "File Uploaded!" heading is visible
    await expect(uploadPage.uploadedHeading).toBeVisible();

    // expect: Uploaded filename "test-file.txt" is displayed on the page
    await expect(uploadPage.uploadedFileName).toHaveText('test-file.txt');
  });
});
