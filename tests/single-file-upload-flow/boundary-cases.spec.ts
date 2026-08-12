import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';
import { stepShot } from '../_shared/step-shot';

test.describe('Boundary Cases', () => {
  let uploadPage: UploadPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
  });

  test('TC-UPLOAD-017: Large filename (long string) is displayed completely', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    const longFilename = 'this_is_a_very_long_filename_that_contains_many_characters_and_should_still_be_displayed_correctly.txt';

    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a file with a very long filename (100+ chars)
    await uploadPage.selectFile(longFilename, Buffer.from('content'));

    // expect: File is selected
    await expect(uploadPage.fileInput).toHaveValue(new RegExp(longFilename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

    await stepShot(page, 2);

    // 3. Click the Upload button
    await uploadPage.clickUpload();

    // expect: Confirmation view appears
    // expect: 'File Uploaded!' heading is visible
    await expect(uploadPage.confirmationHeading).toBeVisible();

    // expect: The complete long filename is displayed (not truncated or cut off)
    await expect(uploadPage.uploadedFileName).toHaveText(longFilename);

    await stepShot(page, 3);
  });

  test('TC-UPLOAD-018: File with no extension (extensionless filename) uploads successfully', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a file with no extension (e.g., filename 'README')
    await uploadPage.selectFile('README', Buffer.from('readme content'));

    // expect: File is selected
    await expect(uploadPage.fileInput).toHaveValue(/README/);

    await stepShot(page, 2);

    // 3. Click the Upload button
    await uploadPage.clickUpload();

    // expect: Confirmation view appears
    // expect: 'File Uploaded!' heading is visible
    await expect(uploadPage.confirmationHeading).toBeVisible();

    // expect: The exact filename (with no extension) is displayed
    await expect(uploadPage.uploadedFileName).toHaveText('README');

    await stepShot(page, 3);
  });
});
