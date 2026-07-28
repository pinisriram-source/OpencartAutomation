import { Locator, Page } from '@playwright/test';
import { BasePage } from '../../_shared/base-page';

export class UploadPage extends BasePage {
  private readonly url = 'https://the-internet.herokuapp.com/upload';

  get pageHeading(): Locator {
    return this.page.getByRole('heading', { name: 'File Uploader' });
  }

  get instructionText(): Locator {
    return this.page.getByText('Choose a file on your system and then click upload');
  }

  get fileInput(): Locator {
    return this.page.locator('#file-upload');
  }

  get uploadButton(): Locator {
    return this.page.locator('#file-submit');
  }

  // The form wrapping the file input has no id/role/testid — CSS is the only
  // way to target it for attribute assertions (structural scoping exception).
  get form(): Locator {
    return this.page.locator('form[enctype="multipart/form-data"]');
  }

  async navigate(): Promise<void> {
    await this.open(this.url);
  }

  async selectFile(filePath: string): Promise<void> {
    await this.fileInput.setInputFiles(filePath);
  }

  async cancelFileSelection(): Promise<void> {
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
