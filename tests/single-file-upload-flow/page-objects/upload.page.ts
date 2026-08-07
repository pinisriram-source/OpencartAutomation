import { Locator } from '@playwright/test';
import { BasePage } from '../../_shared/base-page';

export class UploadPage extends BasePage {
  private readonly url = 'https://the-internet.herokuapp.com/upload';

  get pageHeading(): Locator {
    return this.page.getByRole('heading', { name: 'File Uploader' });
  }

  // CSS locator: file inputs have no accessible role that distinguishes them
  // from other inputs, and this element has no label — only an id.
  get fileInput(): Locator {
    return this.page.locator('#file-upload');
  }

  get uploadButton(): Locator {
    return this.page.getByRole('button', { name: 'Upload' });
  }

  get form(): Locator {
    return this.page.locator('#file-upload').locator('..');
  }

  get successHeading(): Locator {
    return this.page.getByRole('heading', { name: 'File Uploaded!' });
  }

  // CSS locator: div#uploaded-files has no role/label — only an id.
  get uploadedFiles(): Locator {
    return this.page.locator('#uploaded-files');
  }

  async navigate(): Promise<void> {
    await this.open(this.url);
  }

  async selectFile(filePath: string): Promise<void> {
    await this.fileInput.setInputFiles(filePath);
  }

  async selectFiles(filePaths: string[]): Promise<void> {
    await this.fileInput.setInputFiles(filePaths);
  }

  async clickUpload(): Promise<void> {
    await this.uploadButton.click();
  }

  async uploadFile(filePath: string): Promise<void> {
    await this.selectFile(filePath);
    await this.clickUpload();
  }

  async goBack(): Promise<void> {
    await this.page.goBack();
  }
}
