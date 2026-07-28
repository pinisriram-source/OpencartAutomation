import { Locator } from '@playwright/test';
import { BasePage } from '../../_shared/base-page';

export class UploadSuccessPage extends BasePage {
  get pageHeading(): Locator {
    return this.page.getByRole('heading', { name: 'File Uploaded!' });
  }

  get uploadedFileName(): Locator {
    return this.page.locator('#uploaded-files');
  }
}
