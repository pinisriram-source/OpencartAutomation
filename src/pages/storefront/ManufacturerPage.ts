import { ProductListingBase } from './ProductListingBase';

export class ManufacturerPage extends ProductListingBase {
  async openIndex(): Promise<void> {
    await this.gotoRoute('product/manufacturer');
  }

  async openBrand(brandName: string): Promise<void> {
    await this.openIndex();
    await this.page.getByRole('link', { name: brandName, exact: true }).click();
  }
}
