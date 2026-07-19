import { ProductListingBase } from './ProductListingBase';

export class SpecialsPage extends ProductListingBase {
  async open(): Promise<void> {
    await this.gotoRoute('product/special');
  }
}
