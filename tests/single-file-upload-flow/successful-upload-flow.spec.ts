import { test, expect } from '@playwright/test';
import path from 'path';
import { UploadPage } from './page-objects/upload.page';
import { UploadSuccessPage } from './page-objects/upload-success.page';

const FIXTURES_DIR = path.resolve(__dirname, '../../');
// upload-sample.txt lives under src/data/fixtures/, unlike the other two
// fixtures below which really are at the repo root.
const UPLOAD_SAMPLE = path.join(FIXTURES_DIR, 'src', 'data', 'fixtures', 'upload-sample.txt');
const PACKAGE_JSON = path.join(FIXTURES_DIR, 'package.json');
const CLAUDE_MD = path.join(FIXTURES_DIR, 'CLAUDE.md');

test.describe('Successful Upload Flow', () => {
  let uploadPage: UploadPage;
  let successPage: UploadSuccessPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
    successPage = new UploadSuccessPage(page);
    await uploadPage.navigate();
  });

  test('TC-UPLOAD-010: Successfully uploading a .txt file navigates to success page with correct file name', { tag: '@smoke' }, async ({ page }) => {
    await uploadPage.selectFile(UPLOAD_SAMPLE);
    await expect(uploadPage.fileInput).toHaveValue(/upload-sample\.txt$/);

    await uploadPage.clickUpload();

    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');
    await expect(successPage.pageHeading).toBeVisible();
    await expect(successPage.pageHeading).toHaveText('File Uploaded!');
    await expect(successPage.uploadedFileName).toHaveText('upload-sample.txt');
  });

  test('TC-UPLOAD-011: Successfully uploading a .json file shows correct file name on success page', { tag: '@functional' }, async () => {
    await uploadPage.selectFile(PACKAGE_JSON);
    await expect(uploadPage.fileInput).toHaveValue(/package\.json$/);

    await uploadPage.clickUpload();

    await expect(successPage.pageHeading).toBeVisible();
    await expect(successPage.pageHeading).toHaveText('File Uploaded!');
    await expect(successPage.uploadedFileName).toHaveText('package.json');
  });

  test('TC-UPLOAD-012: Successfully uploading a .md file shows correct file name on success page', { tag: '@functional' }, async () => {
    await uploadPage.selectFile(CLAUDE_MD);
    await expect(uploadPage.fileInput).toHaveValue(/CLAUDE\.md$/);

    await uploadPage.clickUpload();

    await expect(successPage.pageHeading).toBeVisible();
    await expect(successPage.pageHeading).toHaveText('File Uploaded!');
    await expect(successPage.uploadedFileName).toHaveText('CLAUDE.md');
  });

  test('TC-UPLOAD-013: Upload success page displays only the file name, not the full path', { tag: '@sanity' }, async () => {
    await uploadPage.selectFile(UPLOAD_SAMPLE);
    await uploadPage.clickUpload();

    await expect(successPage.pageHeading).toBeVisible();
    const displayedName = (await successPage.uploadedFileName.textContent())!.trim();
    expect(displayedName).not.toContain('/');
    expect(displayedName).not.toContain('\\');
    expect(displayedName).not.toContain('C:');
    expect(displayedName).not.toContain('fakepath');
    expect(displayedName).toBe('upload-sample.txt');
  });
});
