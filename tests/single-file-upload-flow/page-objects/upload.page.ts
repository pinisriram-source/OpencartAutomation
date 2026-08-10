import { Locator } from '@playwright/test';
import { BasePage } from '../../_shared/base-page';

export class UploadPage extends BasePage {
  private readonly url = 'https://the-internet.herokuapp.com/upload';

  get pageHeading(): Locator {
    return this.page.getByRole('heading', { name: 'File Uploader', level: 3 });
  }

  get uploadedHeading(): Locator {
    return this.page.getByRole('heading', { name: 'File Uploaded!', level: 3 });
  }

  get fileInput(): Locator {
    return this.page.locator('#file-upload');
  }

  get uploadButton(): Locator {
    return this.page.locator('#file-submit');
  }

  get instructionText(): Locator {
    return this.page.getByText('Choose a file on your system and then click upload.');
  }

  get uploadedFileName(): Locator {
    return this.page.locator('#uploaded-files');
  }

  get internalServerErrorHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Internal Server Error', level: 1 });
  }

  async navigate(): Promise<void> {
    await this.open(this.url);
  }

  async selectFile(filePath: string): Promise<void> {
    await this.fileInput.setInputFiles(filePath);
  }

  async clearFileSelection(): Promise<void> {
    await this.fileInput.setInputFiles([]);
  }

  async clickUpload(): Promise<void> {
    await this.uploadButton.click();
  }

  async uploadFile(filePath: string): Promise<void> {
    await this.selectFile(filePath);
    await this.clickUpload();
  }
}
