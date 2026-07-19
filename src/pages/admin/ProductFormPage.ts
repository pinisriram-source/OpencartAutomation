import { AdminBasePage } from './AdminBasePage';

export class ProductFormPage extends AdminBasePage {
  async openForEdit(productId: string): Promise<void> {
    await this.gotoAdminRoute(`catalog/product/edit&product_id=${productId}`);
  }

  async openForAdd(): Promise<void> {
    await this.gotoAdminRoute('catalog/product/add');
  }

  async openTab(tab: 'General' | 'Data' | 'Links' | 'Discount' | 'Special' | 'SEO'): Promise<void> {
    await this.page.getByRole('link', { name: tab, exact: true }).click();
  }

  async fillGeneral(productName: string, metaTitle: string): Promise<void> {
    await this.openTab('General');
    await this.page.locator('#input-name1').fill(productName);
    await this.page.locator('#input-meta-title1').fill(metaTitle);
  }

  async fillData(model: string, price: string, quantity: string): Promise<void> {
    await this.openTab('Data');
    await this.page.locator('#input-model').fill(model);
    await this.page.locator('#input-price').fill(price);
    await this.page.locator('#input-quantity').fill(quantity);
  }

  async setStatus(enabled: boolean): Promise<void> {
    await this.openTab('Data');
    await this.page.locator('#input-status').selectOption(enabled ? 'Enabled' : 'Disabled');
  }

  async setPrice(price: string): Promise<void> {
    await this.openTab('Data');
    await this.page.locator('#input-price').fill(price);
  }

  async addSpecialPrice(price: string): Promise<void> {
    await this.openTab('Special');
    await this.page.getByRole('button', { name: /add special/i }).click();
    const row = this.page.locator('#tab-special tbody tr').last();
    await row.locator('input[name*="[price]"]').fill(price);
  }

  async save(): Promise<void> {
    await this.saveButton.click();
    await this.waitForSuccessAlert();
  }
}
