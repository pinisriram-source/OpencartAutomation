import { Locator } from '@playwright/test';
import { BasePage } from '../../_shared/base-page';

export class UploadPage extends BasePage {
  private readonly url = 'https://the-internet.herokuapp.com/upload';

  get pageHeading(): Locator {
    return this.page.getByRole('heading', { name: 'File Uploader' });
  }

  get uploadedHeading(): Locator {
    return this.page.getByRole('heading', { name: 'File Uploaded!' });
  }

  get fileInput(): Locator {
    return this.page.locator('#file-upload');
  }

  get uploadButton(): Locator {
    return this.page.locator('#file-submit');
  }

  get uploadedFileName(): Locator {
    return this.page.locator('#uploaded-files');
  }

  get dragDropArea(): Locator {
    return this.page.locator('#drag-drop-upload');
  }

  get instructionText(): Locator {
    return this.page.getByText('Choose a file on your computer');
  }

  async navigate(): Promise<void> {
    await this.open(this.url);
  }

  async selectFile(fileName: string, content: Buffer): Promise<void> {
    await this.fileInput.setInputFiles({
      name: fileName,
      mimeType: 'application/octet-stream',
      buffer: content,
    });
  }

  async clearFileSelection(): Promise<void> {
    await this.fileInput.setInputFiles([]);
  }

  async clickUpload(): Promise<void> {
    await this.uploadButton.click();
  }

  async uploadFile(fileName: string, content: Buffer): Promise<void> {
    await this.selectFile(fileName, content);
    await this.clickUpload();
  }
}
