import { AdminBasePage } from './AdminBasePage';

export class ReturnDetailPage extends AdminBasePage {
  async openById(returnId: string): Promise<void> {
    await this.gotoAdminRoute(`sale/returns.form&return_id=${returnId}`);
  }

  async setStatus(status: string): Promise<void> {
    await this.page.locator('#input-return-status').selectOption({ label: status });
  }

  async save(): Promise<void> {
    await this.saveButton.click();
    await this.waitForSuccessAlert();
  }
}
