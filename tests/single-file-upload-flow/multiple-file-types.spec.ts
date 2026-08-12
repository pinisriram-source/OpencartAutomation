import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';
import { stepShot } from '../_shared/step-shot';

test.describe('Multiple File Types', () => {
  let uploadPage: UploadPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
  });

  test('TC-UPLOAD-004: Upload .png image file succeeds and shows correct filename', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a .png file in the file input (e.g., 'image.png')
    await uploadPage.selectFile('image.png', Buffer.from('fake png content'));

    // expect: File is selected
    await expect(uploadPage.fileInput).toHaveValue(/image\.png/);

    await stepShot(page, 2);

    // 3. Click the Upload button
    await uploadPage.clickUpload();

    // expect: Confirmation view appears
    // expect: 'File Uploaded!' heading is visible
    await expect(uploadPage.confirmationHeading).toBeVisible();

    // expect: The exact filename 'image.png' is displayed
    await expect(uploadPage.uploadedFileName).toHaveText('image.png');

    await stepShot(page, 3);
  });

  test('TC-UPLOAD-005: Upload .json file succeeds and shows correct filename', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a .json file in the file input (e.g., 'data.json')
    await uploadPage.selectFile('data.json', Buffer.from('{"key":"value"}'));

    // expect: File is selected
    await expect(uploadPage.fileInput).toHaveValue(/data\.json/);

    await stepShot(page, 2);

    // 3. Click the Upload button
    await uploadPage.clickUpload();

    // expect: Confirmation view appears
    // expect: 'File Uploaded!' heading is visible
    await expect(uploadPage.confirmationHeading).toBeVisible();

    // expect: The exact filename 'data.json' is displayed
    await expect(uploadPage.uploadedFileName).toHaveText('data.json');

    await stepShot(page, 3);
  });

  test('TC-UPLOAD-006: Upload .pdf file succeeds and shows correct filename', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a .pdf file in the file input (e.g., 'document.pdf')
    await uploadPage.selectFile('document.pdf', Buffer.from('fake pdf content'));

    // expect: File is selected
    await expect(uploadPage.fileInput).toHaveValue(/document\.pdf/);

    await stepShot(page, 2);

    // 3. Click the Upload button
    await uploadPage.clickUpload();

    // expect: Confirmation view appears
    // expect: 'File Uploaded!' heading is visible
    await expect(uploadPage.confirmationHeading).toBeVisible();

    // expect: The exact filename 'document.pdf' is displayed
    await expect(uploadPage.uploadedFileName).toHaveText('document.pdf');

    await stepShot(page, 3);
  });
});
