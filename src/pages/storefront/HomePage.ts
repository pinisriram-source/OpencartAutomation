import { ProductListingBase } from './ProductListingBase';

export class HomePage extends ProductListingBase {
  async open(): Promise<void> {
    await this.gotoHome();
  }

  async openTopCategory(name: string): Promise<void> {
    await this.page.locator('#menu').getByRole('link', { name, exact: true }).first().click();
  }

  get featuredHeading() {
    return this.page.getByRole('heading', { name: 'Featured' });
  }
}
