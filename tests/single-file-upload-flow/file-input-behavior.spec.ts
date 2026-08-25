import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';
import { stepShot } from '../_shared/step-shot';
import path from 'path';
import fs from 'fs';
import os from 'os';

test.describe('File Input Control Behavior', () => {
  let uploadPage: UploadPage;
  let tmpDir: string;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'upload-test-'));
  });

  test.afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('TC-UPLOAD-012: Selecting a file via file input populates the control with the filename before submission', { tag: ['@sanity', '@regression'] }, async ({ page }) => {
    const fileName = 'sample.txt';
    const filePath = path.join(tmpDir, fileName);
    fs.writeFileSync(filePath, 'sample content');

    // 1. Navigate to the File Uploader page
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    // expect: File input control shows no file selected
    await expect(uploadPage.fileInput).toHaveValue('');

    await stepShot(page, 1);

    // 2. Click the 'Choose File' button and select a file from the file picker dialog
    await uploadPage.uploadFile(filePath);

    // expect: File input control immediately displays 'sample.txt'
    await expect(uploadPage.fileInput).toHaveValue(/sample\.txt$/);

    // expect: No page reload or navigation occurs from file selection alone
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    // expect: Upload button remains on the page, ready to be clicked
    await expect(uploadPage.uploadButton).toBeVisible();

    await stepShot(page, 2);
  });

  test('TC-UPLOAD-013: Replacing a selected file with a different file updates the file input display', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    const firstFileName = 'file-one.txt';
    const secondFileName = 'file-two.txt';
    const firstFilePath = path.join(tmpDir, firstFileName);
    const secondFilePath = path.join(tmpDir, secondFileName);
    fs.writeFileSync(firstFilePath, 'first content');
    fs.writeFileSync(secondFilePath, 'second content');

    // 1. Navigate to the File Uploader page
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a first file
    await uploadPage.uploadFile(firstFilePath);

    // expect: File input displays 'file-one.txt'
    await expect(uploadPage.fileInput).toHaveValue(/file-one\.txt$/);

    await stepShot(page, 2);

    // 3. Click 'Choose File' again and select a different file, replacing the first selection
    await uploadPage.uploadFile(secondFilePath);

    // expect: File input now displays 'file-two.txt' (not 'file-one.txt')
    await expect(uploadPage.fileInput).toHaveValue(/file-two\.txt$/);

    // expect: Only one file is selected (no multi-file list)
    const inputValue = await uploadPage.fileInput.inputValue();
    expect(inputValue).not.toContain('file-one');

    // expect: Upload button remains functional
    await expect(uploadPage.uploadButton).toBeVisible();

    await stepShot(page, 3);

    // 4. Click the Upload button
    await uploadPage.clickUpload();

    // expect: Success page displays 'file-two.txt' (the most recently selected file)
    await expect(uploadPage.uploadedFileName).toHaveText(secondFileName);

    // expect: Success page does NOT show 'file-one.txt'
    await expect(uploadPage.uploadedFileName).not.toContainText(firstFileName);

    await stepShot(page, 4);
  });

  test('TC-UPLOAD-014: File input control does not accept multiple files simultaneously (single file upload)', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    const fileOneName = 'multi-one.txt';
    const fileTwoName = 'multi-two.txt';
    const fileOnePath = path.join(tmpDir, fileOneName);
    const fileTwoPath = path.join(tmpDir, fileTwoName);
    fs.writeFileSync(fileOnePath, 'one');
    fs.writeFileSync(fileTwoPath, 'two');

    // 1. Navigate to the File Uploader page
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Inspect the file input control's HTML attributes
    // expect: File input does NOT have a 'multiple' attribute
    const multipleAttr = await uploadPage.fileInput.getAttribute('multiple');
    expect(multipleAttr).toBeNull();

    // expect: File input is configured to accept only a single file
    await stepShot(page, 2);

    // 3. Attempt to select multiple files via the file picker
    await uploadPage.fileInput.setInputFiles([fileOnePath, fileTwoPath]);

    // expect: File input displays only one filename (browser typically takes the last or first)
    const inputValue = await uploadPage.fileInput.inputValue();
    const fileCount = inputValue.split(',').filter(s => s.trim()).length;

    // expect: No multi-file list appears — single file control only holds one
    expect(fileCount).toBeLessThanOrEqual(1);

    await stepShot(page, 3);
  });
});
