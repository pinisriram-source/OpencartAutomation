import { test, expect } from '@playwright/test';
import { UploadPage } from './page-objects/upload.page';
import { stepShot } from '../_shared/step-shot';
import path from 'path';
import fs from 'fs';

test.describe('Happy Path Upload', () => {
  let uploadPage: UploadPage;
  const testDataDir = path.join(__dirname, 'test-data');

  test.beforeAll(async () => {
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
    fs.writeFileSync(path.join(testDataDir, 'test-file.txt'), 'hello world');
    fs.writeFileSync(path.join(testDataDir, 'CLAUDE.md'), '# Test markdown');
  });

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
  });

  test('TC-UPLOAD-002: Upload a text file successfully shows File Uploaded confirmation', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    // expect: Initial state is correct (File Uploader heading visible)
    await expect(uploadPage.pageHeading).toBeVisible();

    await stepShot(page, 1);

    // 2. Select a text file (e.g., 'test-file.txt') using the file input
    await uploadPage.selectFile(path.join(testDataDir, 'test-file.txt'));

    // expect: File is selected in the input
    // expect: File input shows the selected file
    await expect(uploadPage.fileInput).not.toHaveValue('');

    await stepShot(page, 2);

    // 3. Click the Upload button
    await uploadPage.clickUpload();

    // expect: Page reloads/navigates
    // expect: URL remains https://the-internet.herokuapp.com/upload
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    // expect: Heading changes to 'File Uploaded!' (h3)
    await expect(uploadPage.uploadedHeading).toBeVisible();

    // expect: The exact filename 'test-file.txt' is displayed on the confirmation view
    await expect(uploadPage.uploadedFileName).toHaveText('test-file.txt');

    // expect: The original file input and instructional text are no longer present
    await expect(uploadPage.instructionText).not.toBeAttached();

    await stepShot(page, 3);
  });

  test('TC-UPLOAD-003: Upload a markdown file successfully shows File Uploaded confirmation', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    // 1. Navigate to https://the-internet.herokuapp.com/upload
    await uploadPage.navigate();

    // expect: Page loads successfully
    await expect(page).toHaveURL('https://the-internet.herokuapp.com/upload');

    await stepShot(page, 1);

    // 2. Select a markdown file (e.g., 'CLAUDE.md') using the file input
    await uploadPage.selectFile(path.join(testDataDir, 'CLAUDE.md'));

    // expect: File is selected in the input
    await expect(uploadPage.fileInput).not.toHaveValue('');

    await stepShot(page, 2);

    // 3. Click the Upload button
    await uploadPage.clickUpload();

    // expect: Page reloads to confirmation view
    // expect: Heading is 'File Uploaded!'
    await expect(uploadPage.uploadedHeading).toBeVisible();

    // expect: The exact filename 'CLAUDE.md' is displayed
    await expect(uploadPage.uploadedFileName).toHaveText('CLAUDE.md');

    await stepShot(page, 3);
  });
});
