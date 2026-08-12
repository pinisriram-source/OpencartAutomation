import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';
import { stepShot } from '../_shared/step-shot';

test.describe('Sequential Uploads', () => {
  let uploadPage: UploadPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
  });

  test('TC-UPLOAD-012: Multiple sequential uploads each show their own correct filename', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a .txt file (e.g., 'first.txt') and click Upload
    await uploadPage.uploadFile('first.txt');

    // expect: Confirmation view appears
    // expect: 'File Uploaded!' heading is visible
    await expect(uploadPage.confirmationHeading).toBeVisible();

    // expect: Filename 'first.txt' is displayed
    await expect(uploadPage.uploadedFileName).toHaveText('first.txt');

    await stepShot(page, 2);

    // 3. Navigate back to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page resets to initial state
    // expect: File input is empty
    await expect(uploadPage.fileInput).toHaveValue('');

    // expect: No confirmation or previous filename is visible
    await expect(uploadPage.confirmationHeading).not.toBeAttached();

    await stepShot(page, 3);

    // 4. Select a different file (e.g., 'second.png') and click Upload
    await uploadPage.uploadFile('second.png');

    // expect: Confirmation view appears
    // expect: 'File Uploaded!' heading is visible
    await expect(uploadPage.confirmationHeading).toBeVisible();

    // expect: Filename 'second.png' is displayed (not 'first.txt')
    await expect(uploadPage.uploadedFileName).toHaveText('second.png');

    await stepShot(page, 4);
  });
});
