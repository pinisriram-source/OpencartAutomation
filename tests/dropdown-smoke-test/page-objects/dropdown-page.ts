import { Page, Locator, expect } from '@playwright/test';

export class DropdownPage {
  readonly page: Page;
  readonly url = 'https://the-internet.herokuapp.com/dropdown';

  readonly pageHeading: Locator;
  readonly dropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageHeading = page.getByRole('heading', { name: 'Dropdown List' });
    this.dropdown = page.locator('#dropdown');
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.url);
  }

  async selectOption(value: string): Promise<void> {
    await this.dropdown.selectOption([value]);
  }

  async verifyHeadingVisible(): Promise<void> {
    await expect(this.pageHeading).toBeVisible();
  }

  async verifyDropdownValue(expectedValue: string): Promise<void> {
    await expect(this.dropdown).toHaveValue(expectedValue);
  }

  async getDropdownValue(): Promise<string> {
    return await this.dropdown.inputValue();
  }
}
