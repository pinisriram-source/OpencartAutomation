import { Locator } from '@playwright/test';
import { BasePage } from '../../_shared/base-page';

export class UploadPage extends BasePage {
  private readonly url = 'https://the-internet.herokuapp.com/upload';

  get pageHeading(): Locator {
    return this.page.getByRole('heading', { name: 'File Uploader', level: 3 });
  }

  get confirmationHeading(): Locator {
    return this.page.getByRole('heading', { name: 'File Uploaded!' });
  }

  get instructionText(): Locator {
    return this.page.getByText('Choose a file on your system and then click upload.');
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

  get errorHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Internal Server Error', level: 1 });
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

  async uploadFile(fileName: string, content?: Buffer): Promise<void> {
    await this.selectFile(fileName, content ?? Buffer.from('test content'));
    await this.clickUpload();
  }
}
