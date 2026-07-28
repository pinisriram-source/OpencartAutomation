import { test, expect } from '@playwright/test';
import path from 'path';
import { UploadPage } from './page-objects/upload.page';

const FIXTURES_DIR = path.resolve(__dirname, '../../');
const UPLOAD_SAMPLE = path.join(FIXTURES_DIR, 'upload-sample.txt');
const PACKAGE_JSON = path.join(FIXTURES_DIR, 'package.json');
const CLAUDE_MD = path.join(FIXTURES_DIR, 'CLAUDE.md');

test.describe('File Selection Behavior', () => {
  let uploadPage: UploadPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
    await uploadPage.navigate();
  });

  test('TC-UPLOAD-005: Selecting a valid file populates the file input', { tag: '@smoke' }, async () => {
    await expect(uploadPage.fileInput).toHaveValue('');

    await uploadPage.selectFile(UPLOAD_SAMPLE);

    await expect(uploadPage.fileInput).toHaveValue(/upload-sample\.txt$/);
    const fileCount = await uploadPage.fileInput.evaluate((el: HTMLInputElement) => el.files?.length ?? 0);
    expect(fileCount).toBe(1);
    const fileName = await uploadPage.fileInput.evaluate((el: HTMLInputElement) => el.files?.[0]?.name ?? '');
    expect(fileName).toBe('upload-sample.txt');
  });

  test('TC-UPLOAD-006: Selecting a file with different extension (.json) populates the file input correctly', { tag: '@functional' }, async () => {
    await uploadPage.selectFile(PACKAGE_JSON);

    await expect(uploadPage.fileInput).toHaveValue(/package\.json$/);
    const fileCount = await uploadPage.fileInput.evaluate((el: HTMLInputElement) => el.files?.length ?? 0);
    expect(fileCount).toBe(1);
    const fileName = await uploadPage.fileInput.evaluate((el: HTMLInputElement) => el.files?.[0]?.name ?? '');
    expect(fileName).toBe('package.json');
  });

  test('TC-UPLOAD-007: Selecting a file with .md extension populates the file input correctly', { tag: '@functional' }, async () => {
    await uploadPage.selectFile(CLAUDE_MD);

    await expect(uploadPage.fileInput).toHaveValue(/CLAUDE\.md$/);
    const fileCount = await uploadPage.fileInput.evaluate((el: HTMLInputElement) => el.files?.length ?? 0);
    expect(fileCount).toBe(1);
    const fileName = await uploadPage.fileInput.evaluate((el: HTMLInputElement) => el.files?.[0]?.name ?? '');
    expect(fileName).toBe('CLAUDE.md');
  });

  test('TC-UPLOAD-008: Canceling file chooser leaves file input empty', { tag: '@functional' }, async () => {
    await expect(uploadPage.fileInput).toHaveValue('');

    await uploadPage.cancelFileSelection();

    await expect(uploadPage.fileInput).toHaveValue('');
    const fileCount = await uploadPage.fileInput.evaluate((el: HTMLInputElement) => el.files?.length ?? 0);
    expect(fileCount).toBe(0);
  });

  test('TC-UPLOAD-009: Selecting a second file replaces the first file in the input', { tag: '@sanity' }, async () => {
    await uploadPage.selectFile(UPLOAD_SAMPLE);
    await expect(uploadPage.fileInput).toHaveValue(/upload-sample\.txt$/);
    const firstCount = await uploadPage.fileInput.evaluate((el: HTMLInputElement) => el.files?.length ?? 0);
    expect(firstCount).toBe(1);

    await uploadPage.selectFile(PACKAGE_JSON);
    await expect(uploadPage.fileInput).toHaveValue(/package\.json$/);
    const secondCount = await uploadPage.fileInput.evaluate((el: HTMLInputElement) => el.files?.length ?? 0);
    expect(secondCount).toBe(1);
    const fileName = await uploadPage.fileInput.evaluate((el: HTMLInputElement) => el.files?.[0]?.name ?? '');
    expect(fileName).toBe('package.json');
  });
});
