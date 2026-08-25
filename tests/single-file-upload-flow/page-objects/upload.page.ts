import { Locator } from '@playwright/test';
import { BasePage } from '../../_shared/base-page';

export class UploadPage extends BasePage {
  private readonly url = 'https://the-internet.herokuapp.com/upload';

  get pageHeading(): Locator {
    return this.page.getByRole('heading', { name: 'File Uploader' });
  }

  get instructionText(): Locator {
    return this.page.getByText('Choose a file on your computer');
  }

  get fileInput(): Locator {
    return this.page.locator('#file-upload');
  }

  get uploadButton(): Locator {
    return this.page.locator('#file-submit');
  }

  get successHeading(): Locator {
    return this.page.getByRole('heading', { name: 'File Uploaded!' });
  }

  get uploadedFileName(): Locator {
    return this.page.locator('#uploaded-files');
  }

  get form(): Locator {
    return this.page.locator('#file-upload-form');
  }

  async navigate(): Promise<void> {
    await this.open(this.url);
  }

  async uploadFile(filePath: string): Promise<void> {
    await this.fileInput.setInputFiles(filePath);
  }

  async clearFileInput(): Promise<void> {
    await this.fileInput.setInputFiles([]);
  }

  async clickUpload(): Promise<void> {
    await this.uploadButton.click();
  }

  async goBack(): Promise<void> {
    await this.page.goBack();
  }
}
