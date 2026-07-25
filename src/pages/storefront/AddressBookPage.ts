import { BasePage } from './BasePage';
import { GuestCustomer } from '../../utils/randomData';

export class AddressBookPage extends BasePage {
  async open(): Promise<void> {
    await this.gotoRoute('account/address');
  }

  async addNewAddress(customer: GuestCustomer, setDefault = false): Promise<void> {
    await this.page.getByRole('link', { name: /new address/i }).click();
    await this.page.getByLabel('First Name').fill(customer.firstName);
    await this.page.getByLabel('Last Name').fill(customer.lastName);
    await this.page.getByLabel('Address 1').fill(customer.address1);
    await this.page.getByLabel('City').fill(customer.city);
    await this.page.getByLabel('Post Code').fill(customer.postcode);
    // The zone <select> is already pre-populated (with whatever country was
    // last selected) at page load, so checking "an option is attached" can
    // pass instantly while the AJAX reload this selectOption triggers is
    // still in flight -- and when that response lands moments later, it can
    // clobber a zone selection made in the meantime. Waiting for the actual
    // country-change AJAX round trip to finish before touching the zone
    // field removes the race instead of guessing at it.
    await Promise.all([
      this.page.waitForResponse((r) => /route=account\/account\/country/.test(r.url())),
      this.page.getByLabel('Country').selectOption({ label: customer.country }),
    ]);
    const zoneSelect = this.page.getByLabel('Region / State');
    await zoneSelect.selectOption({ label: customer.zone });
    if (setDefault) {
      await this.page.getByRole('radio', { name: 'Yes' }).check();
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
