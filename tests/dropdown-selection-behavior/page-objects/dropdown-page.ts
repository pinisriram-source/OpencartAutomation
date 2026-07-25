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
    await this.dropdown.selectOption(value);
  }

  async getSelectedValue(): Promise<string> {
    return await this.dropdown.inputValue();
  }

  async getSelectedText(): Promise<string> {
    return await this.page.evaluate(() => {
      const select = document.querySelector('#dropdown') as HTMLSelectElement;
      return select.options[select.selectedIndex].text;
    });
  }

  async getSelectedIndex(): Promise<number> {
    return await this.page.evaluate(() => {
      const select = document.querySelector('#dropdown') as HTMLSelectElement;
      return select.selectedIndex;
    });
  }

  async getOptionCount(): Promise<number> {
    return await this.page.evaluate(() => {
      const select = document.querySelector('#dropdown') as HTMLSelectElement;
      return select.options.length;
    });
  }

  async getOptionAt(index: number): Promise<{ text: string; value: string; disabled: boolean }> {
    return await this.page.evaluate((idx) => {
      const select = document.querySelector('#dropdown') as HTMLSelectElement;
      const option = select.options[idx];
      return { text: option.text, value: option.value, disabled: option.disabled };
    }, index);
  }

  async verifyHeadingVisible(): Promise<void> {
    await expect(this.pageHeading).toBeVisible();
  }

  async verifyDropdownVisible(): Promise<void> {
    await expect(this.dropdown).toBeVisible();
  }

  async verifyDropdownValue(expectedValue: string): Promise<void> {
    await expect(this.dropdown).toHaveValue(expectedValue);
  }

  getCurrentUrl(): string {
    return this.page.url();
  }

  async reload(): Promise<void> {
    await this.page.reload();
  }
}
