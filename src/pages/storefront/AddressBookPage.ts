import { BasePage } from './BasePage';
import { GuestCustomer } from '../../utils/randomData';

export class AddressBookPage extends BasePage {
  async open(): Promise<void> {
    await this.gotoRoute('account/address');
  }

  async addNewAddress(customer: GuestCustomer, setDefault = false): Promise<void> {
    await this.page.getByRole('link', { name: /new address/i }).click();
    await this.page.locator('#input-firstname').fill(customer.firstName);
    await this.page.locator('#input-lastname').fill(customer.lastName);
    await this.page.locator('#input-address-1').fill(customer.address1);
    await this.page.locator('#input-city').fill(customer.city);
    await this.page.locator('#input-postcode').fill(customer.postcode);
    await this.page.locator('select[name="country_id"]').selectOption({ label: customer.country });
    await this.page.waitForTimeout(500);
    await this.page.locator('select[name="zone_id"]').selectOption({ label: customer.zone });
    if (setDefault) {
      await this.page.locator('input[name="default"][value="1"]').check();
    }
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }

  addressRow(fullName: string) {
    return this.page.locator('.address-list, #content').getByText(fullName);
  }

  async deleteAddress(fullName: string): Promise<void> {
    const card = this.page.locator('.panel, .address').filter({ hasText: fullName });
    await card.getByRole('link', { name: /delete/i }).click();
    this.page.once('dialog', (d) => d.accept());
  }
}
