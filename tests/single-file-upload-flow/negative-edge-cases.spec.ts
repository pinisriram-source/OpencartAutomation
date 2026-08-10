import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';

test.describe('Negative and Edge Cases', () => {
  let uploadPage: UploadPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
  });

  test('TC-UPLOAD-011: Click Upload with no file selected and verify behavior', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    // expect: File input shows no file selected
    await expect(uploadPage.fileInput).toHaveValue('');

    // 2. Click the "Upload" button without selecting a file
    await uploadPage.clickUpload();

    // expect: Upload does NOT complete successfully
    // expect: No "File Uploaded!" heading is shown on the resulting page
    await expect(uploadPage.uploadedHeading).not.toBeVisible();

    // expect: Record the actual behavior (error message, "Internal Server Error", or page remains unchanged)
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toContain('File Uploaded!');
  });

  test('TC-UPLOAD-012: Select file, clear selection, then click Upload', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    // 2. Select a test file using the file input
    await uploadPage.selectFile('test-file.txt', Buffer.from('content'));

    // expect: File input reflects the selected filename
    await expect(uploadPage.fileInput).toHaveValue(/test-file\.txt/);

    // 3. Clear the file selection by setting the input to empty
    await uploadPage.clearFileSelection();

    // expect: File input shows no file selected
    await expect(uploadPage.fileInput).toHaveValue('');

    // 4. Click the "Upload" button
    await uploadPage.clickUpload();

    // expect: Behavior matches TC-UPLOAD-011 (no successful upload occurs)
    await expect(uploadPage.uploadedHeading).not.toBeVisible();
  });

  test('TC-UPLOAD-013: Upload file with very long filename', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    // 2. Select a test file with a very long filename (200+ characters)
    const longName = 'a'.repeat(200) + '.txt';
    await uploadPage.selectFile(longName, Buffer.from('content'));

    // expect: File input accepts the file
    await expect(uploadPage.fileInput).toHaveValue(new RegExp(longName.replace(/\./g, '\\.')));

    // 3. Click the "Upload" button
    await uploadPage.clickUpload();

    // expect: Upload succeeds or fails gracefully
    // expect: If successful, the full filename is displayed on the confirmation view
    // expect: If failed, an appropriate error or page response is shown (no unhandled crash)
    const hasUploaded = await uploadPage.uploadedHeading.isVisible().catch(() => false);
    if (hasUploaded) {
      await expect(uploadPage.uploadedFileName).toHaveText(longName);
    } else {
      await expect(page.locator('body')).not.toHaveText('');
    }
  });

  test('TC-UPLOAD-014: Upload same file twice in succession', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    // 2. Select and upload a test file (e.g., "test-file.txt")
    await uploadPage.uploadFile('test-file.txt', Buffer.from('content'));

    // expect: "File Uploaded!" heading is visible
    await expect(uploadPage.uploadedHeading).toBeVisible();

    // expect: Filename "test-file.txt" is displayed
    await expect(uploadPage.uploadedFileName).toHaveText('test-file.txt');

    // 3. Navigate back to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page returns to initial empty state
    await expect(uploadPage.fileInput).toHaveValue('');

    // 4. Select and upload the same file again
    await uploadPage.uploadFile('test-file.txt', Buffer.from('content'));

    // expect: "File Uploaded!" heading is visible
    await expect(uploadPage.uploadedHeading).toBeVisible();

    // expect: Filename "test-file.txt" is displayed exactly as before
    await expect(uploadPage.uploadedFileName).toHaveText('test-file.txt');

    // expect: No error or duplicate-file warning is shown
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toMatch(/duplicate|already exists|error/i);
  });
});
