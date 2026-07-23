import { Page, Locator, expect } from '@playwright/test';

export class DynamicControlsPage {
  readonly page: Page;
  readonly url = 'https://the-internet.herokuapp.com/dynamic_controls';

  readonly pageHeading: Locator;

  readonly checkboxSectionHeading: Locator;
  readonly checkbox: Locator;
  readonly checkboxLabel: Locator;
  readonly removeAddButton: Locator;
  readonly checkboxLoadingIndicator: Locator;
  readonly checkboxMessage: Locator;

  readonly inputSectionHeading: Locator;
  readonly textInput: Locator;
  readonly enableDisableButton: Locator;
  readonly inputLoadingIndicator: Locator;
  readonly inputMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.pageHeading = page.getByRole('heading', { name: 'Dynamic Controls' });

    this.checkboxSectionHeading = page.getByRole('heading', { name: 'Remove/add' });
    this.checkbox = page.locator('#checkbox-example input[type="checkbox"]');
    this.checkboxLabel = page.locator('#checkbox-example #checkbox');
    this.removeAddButton = page.locator('#checkbox-example button');
    this.checkboxLoadingIndicator = page.locator('#checkbox-example #loading').first();
    this.checkboxMessage = page.locator('#checkbox-example #message').last();

    this.inputSectionHeading = page.getByRole('heading', { name: 'Enable/disable' });
    this.textInput = page.locator('#input-example input[type="text"]');
    this.enableDisableButton = page.locator('#input-example button');
    this.inputLoadingIndicator = page.locator('#input-example #loading').first();
    this.inputMessage = page.locator('#input-example #message').last();
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.url);
  }

  async clickRemoveButton(): Promise<void> {
    await expect(this.removeAddButton).toHaveText('Remove');
    await this.removeAddButton.click();
  }

  async clickAddButton(): Promise<void> {
    await expect(this.removeAddButton).toHaveText('Add');
    await this.removeAddButton.click();
  }

  async clickEnableButton(): Promise<void> {
    await expect(this.enableDisableButton).toHaveText('Enable');
    await this.enableDisableButton.click();
  }

  async clickDisableButton(): Promise<void> {
    await expect(this.enableDisableButton).toHaveText('Disable');
    await this.enableDisableButton.click();
  }

  async waitForCheckboxRemoved(): Promise<void> {
    await expect(this.checkbox).toHaveCount(0, { timeout: 30000 });
    await expect(this.removeAddButton).toHaveText('Add');
  }

  async waitForCheckboxAdded(): Promise<void> {
    await expect(this.checkbox).toBeVisible({ timeout: 30000 });
    await expect(this.removeAddButton).toHaveText('Remove');
  }

  async waitForInputEnabled(): Promise<void> {
    await expect(this.textInput).toBeEnabled({ timeout: 30000 });
  }

  async waitForInputDisabled(): Promise<void> {
    await expect(this.textInput).toBeDisabled({ timeout: 30000 });
  }

  async removeCheckboxAndWait(): Promise<void> {
    await this.clickRemoveButton();
    await this.waitForCheckboxRemoved();
  }

  async addCheckboxAndWait(): Promise<void> {
    await this.clickAddButton();
    await this.waitForCheckboxAdded();
  }

  async enableInputAndWait(): Promise<void> {
    await this.clickEnableButton();
    await this.waitForInputEnabled();
  }

  async disableInputAndWait(): Promise<void> {
    await this.clickDisableButton();
    await this.waitForInputDisabled();
  }
}
