import { Page, Locator } from '@playwright/test';

export class KeyPressesPage {
  readonly page: Page;
  readonly inputField: Locator;
  readonly resultParagraph: Locator;
  readonly resultText: Locator;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.inputField = page.locator('#target');
    this.resultParagraph = page.locator('#result');
    this.resultText = this.resultParagraph;
    this.heading = page.locator('h3');
  }

  async navigate() {
    await this.page.goto('https://the-internet.herokuapp.com/key_presses');
  }

  async goto() {
    await this.navigate();
  }

  async pressKey(key: string) {
    await this.page.keyboard.press(key);
  }

  async clickInput() {
    await this.inputField.click();
  }

  async focusInput() {
    await this.clickInput();
  }

  async getInputValue(): Promise<string> {
    return await this.inputField.inputValue();
  }

  async getResultText(): Promise<string> {
    return await this.resultParagraph.textContent() || '';
  }

  async getResultMessage(): Promise<string> {
    return await this.getResultText();
  }

  async isInputVisible(): Promise<boolean> {
    return await this.inputField.isVisible();
  }

  async isResultVisible(): Promise<boolean> {
    return await this.resultParagraph.isVisible();
  }
}
