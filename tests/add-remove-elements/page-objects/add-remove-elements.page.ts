import { Page, Locator, expect } from '@playwright/test';

export class AddRemoveElementsPage {
  readonly page: Page;
  readonly url = 'https://the-internet.herokuapp.com/add_remove_elements/';

  readonly pageHeading: Locator;
  readonly addElementButton: Locator;
  readonly deleteButtons: Locator;
  readonly elementsContainer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageHeading = page.getByRole('heading', { name: 'Add/Remove Elements' });
    this.addElementButton = page.getByRole('button', { name: 'Add Element' });
    this.deleteButtons = page.locator('#elements button.added-manually');
    this.elementsContainer = page.locator('#elements');
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.url);
  }

  async addElements(count: number): Promise<void> {
    for (let i = 0; i < count; i++) {
      await this.addElementButton.click();
    }
  }

  async getDeleteButtonCount(): Promise<number> {
    return await this.deleteButtons.count();
  }

  async deleteButtonAtIndex(index: number): Promise<void> {
    await this.deleteButtons.nth(index).click();
  }
}
