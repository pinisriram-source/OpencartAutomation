import { Locator } from '@playwright/test';
import { BasePage } from '../../_shared/base-page';

export class UploadPage extends BasePage {
  private readonly url = 'https://the-internet.herokuapp.com/upload';

  get pageHeading(): Locator {
    return this.page.getByRole('heading', { name: 'File Uploader' });
  }

  get fileInput(): Locator {
    return this.page.locator('#file-upload');
  }

  get uploadButton(): Locator {
    return this.page.locator('#file-submit');
  }

  get confirmationHeading(): Locator {
    return this.page.getByRole('heading', { name: 'File Uploaded!' });
  }

  get uploadedFileName(): Locator {
    return this.page.locator('#uploaded-files');
  }

  get errorHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Internal Server Error' });
  }

  async navigate(): Promise<void> {
    await this.open(this.url);
  }

  async uploadFile(fileName: string, content: Buffer): Promise<void> {
    await this.fileInput.setInputFiles({
      name: fileName,
      mimeType: 'application/octet-stream',
      buffer: content,
    });
  }

  async clickUpload(): Promise<void> {
    await this.uploadButton.click();
  }
}
