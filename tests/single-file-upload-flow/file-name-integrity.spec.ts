import { test, expect } from '@playwright/test';
import path from 'path';
import { UploadPage } from './page-objects/upload.page';
import { UploadSuccessPage } from './page-objects/upload-success.page';

const FIXTURES_DIR = path.resolve(__dirname, '../../');
const UPLOAD_SAMPLE = path.join(FIXTURES_DIR, 'upload-sample.txt');
const CLAUDE_MD = path.join(FIXTURES_DIR, 'CLAUDE.md');

test.describe('File Name Integrity', () => {
  let uploadPage: UploadPage;
  let successPage: UploadSuccessPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
    successPage = new UploadSuccessPage(page);
    await uploadPage.navigate();
  });

  test('TC-UPLOAD-019: File name on success page exactly matches selected file name including extension', { tag: '@sanity' }, async () => {
    await uploadPage.selectFile(UPLOAD_SAMPLE);
    await expect(uploadPage.fileInput).toHaveValue(/upload-sample\.txt$/);

    const inputFileName = await uploadPage.fileInput.evaluate((el: HTMLInputElement) => el.files?.[0]?.name ?? '');
    expect(inputFileName).toBe('upload-sample.txt');

    await uploadPage.clickUpload();

    await expect(successPage.uploadedFileName).toHaveText('upload-sample.txt');
    const displayedName = (await successPage.uploadedFileName.textContent())!.trim();
    expect(displayedName).toBe('upload-sample.txt');
    expect(displayedName).toContain('.txt');
  });

  test('TC-UPLOAD-020: File name with uppercase letters is preserved on success page', { tag: '@functional' }, async () => {
    await uploadPage.selectFile(CLAUDE_MD);
    await expect(uploadPage.fileInput).toHaveValue(/CLAUDE\.md$/);

    await uploadPage.clickUpload();

    await expect(successPage.uploadedFileName).toHaveText('CLAUDE.md');
    const displayedName = (await successPage.uploadedFileName.textContent())!.trim();
    expect(displayedName).toBe('CLAUDE.md');
    expect(displayedName).toContain('CLAUDE');
    expect(displayedName).not.toBe('claude.md');
  });

  test('TC-UPLOAD-021: File name with dots and hyphens is preserved on success page', { tag: '@functional' }, async () => {
    await uploadPage.selectFile(UPLOAD_SAMPLE);
    await expect(uploadPage.fileInput).toHaveValue(/upload-sample\.txt$/);

    await uploadPage.clickUpload();

    await expect(successPage.uploadedFileName).toHaveText('upload-sample.txt');
    const displayedName = (await successPage.uploadedFileName.textContent())!.trim();
    expect(displayedName).toBe('upload-sample.txt');
    expect(displayedName).toContain('-');
    expect(displayedName).toContain('.');
  });
});
