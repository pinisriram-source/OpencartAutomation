import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';
import { stepShot } from '../_shared/step-shot';

test.describe('Form Element Attributes and Accessibility', () => {
  let uploadPage: UploadPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
  });

  test('TC-UPLOAD-015: File input control has correct HTML attributes (id, name, type)', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
    // 1. Navigate to the File Uploader page
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Inspect the file input control's HTML attributes
    // expect: File input type attribute is 'file'
    await expect(uploadPage.fileInput).toHaveAttribute('type', 'file');

    // expect: File input id is 'file-upload'
    await expect(uploadPage.fileInput).toHaveAttribute('id', 'file-upload');

    // expect: File input name attribute is 'file'
    await expect(uploadPage.fileInput).toHaveAttribute('name', 'file');

    // expect: File input is not marked as 'required' in HTML
    const requiredAttr = await uploadPage.fileInput.getAttribute('required');
    expect(requiredAttr).toBeNull();

    await stepShot(page, 2);
  });

  test('TC-UPLOAD-016: Upload button has correct attributes and is clickable before file selection', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to the File Uploader page
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Inspect the Upload button's attributes
    // expect: Upload button id is 'file-submit'
    await expect(uploadPage.uploadButton).toHaveAttribute('id', 'file-submit');

    // expect: Upload button type is 'submit'
    await expect(uploadPage.uploadButton).toHaveAttribute('type', 'submit');

    // expect: Upload button is NOT disabled initially (enabled even before file selection)
    await expect(uploadPage.uploadButton).toBeEnabled();

    // expect: Upload button is clickable
    await expect(uploadPage.uploadButton).toBeVisible();

    await stepShot(page, 2);
  });

  test('TC-UPLOAD-017: Form element has correct action and method attributes', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to the File Uploader page
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Inspect the form element's attributes
    // expect: Form action attribute contains '/upload'
    const actionAttr = await uploadPage.form.getAttribute('action');
    expect(actionAttr).toContain('/upload');

    // expect: Form method attribute is 'post'
    await expect(uploadPage.form).toHaveAttribute('method', 'post');

    // expect: Form enctype is 'multipart/form-data' (required for file uploads)
    await expect(uploadPage.form).toHaveAttribute('enctype', 'multipart/form-data');

    await stepShot(page, 2);
  });
});
