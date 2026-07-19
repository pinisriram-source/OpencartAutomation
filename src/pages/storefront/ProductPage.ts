import path from 'path';
import { BasePage } from './BasePage';

export class ProductPage extends BasePage {
  async openById(productId: string): Promise<void> {
    await this.gotoRoute(`product/product&product_id=${productId}`);
  }

  get name() {
    return this.page.locator('h1');
  }

  get price() {
    return this.page.locator('h2').filter({ hasText: '$' });
  }

  get addToCartButton() {
    return this.page.locator('#button-cart');
  }

  // These icon-only buttons sometimes render with an empty native `title`
  // (Bootstrap's tooltip() moves it into `data-original-title` once
  // initialized), so they can end up with no accessible name for
  // getByRole — match either attribute directly instead.
  get addToWishlistButton() {
    return this.page.locator('button[title="Add to Wish List"], button[data-original-title="Add to Wish List"]');
  }

  get addToCompareButton() {
    return this.page.locator('button[title="Compare this Product"], button[data-original-title="Compare this Product"]');
  }

  async setQuantity(qty: number): Promise<void> {
    await this.page.locator('#input-quantity').fill(String(qty));
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async addToWishlist(): Promise<void> {
    await this.addToWishlistButton.click();
  }

  async addToCompare(): Promise<void> {
    await this.addToCompareButton.click();
  }

  // ---- Options ----

  async selectRadioOption(optionId: string, valueIndex = 0): Promise<void> {
    await this.page
      .locator(`#input-option${optionId} input[type="radio"]`)
      .nth(valueIndex)
      .check();
  }

  async checkCheckboxOption(optionId: string, valueIndexes: number[] = [0]): Promise<void> {
    const checkboxes = this.page.locator(`#input-option${optionId} input[type="checkbox"]`);
    for (const idx of valueIndexes) {
      await checkboxes.nth(idx).check();
    }
  }

  async fillTextOption(optionId: string, value: string): Promise<void> {
    await this.page.locator(`#input-option${optionId}`).fill(value);
  }

  async fillTextareaOption(optionId: string, value: string): Promise<void> {
    await this.page.locator(`#input-option${optionId}`).fill(value);
  }

  /** Option labels in this store's demo data carry trailing whitespace, so
   * select by visible text via a relative index (1-based, skipping the
   * "Please Select" placeholder) rather than an exact label match. */
  async selectDropdownOptionByPosition(optionId: string, position: number): Promise<void> {
    await this.page.locator(`#input-option${optionId}`).selectOption({ index: position });
  }

  async uploadFileOption(optionId: string, filePath = path.join(__dirname, '../../data/fixtures/upload-sample.txt')): Promise<void> {
    const [chooser] = await Promise.all([
      this.page.waitForEvent('filechooser'),
      this.page.locator(`#button-upload${optionId}`).click(),
    ]);
    await chooser.setFiles(filePath);
    // OpenCart uploads the file via AJAX and stores a token in the hidden
    // input once done; wait for that value to be populated.
    await this.page.waitForFunction(
      (id) => {
        const el = document.querySelector<HTMLInputElement>(`#input-option${id}`);
        return !!el && el.value.length > 0;
      },
      optionId,
    );
  }

  // ---- Tabs ----

  async openTab(name: 'Description' | 'Specification' | 'Reviews'): Promise<void> {
    await this.page.getByRole('link', { name, exact: false }).click();
  }

  // ---- Reviews ----

  async submitReview(reviewerName: string, reviewText: string, rating: number): Promise<void> {
    await this.openTab('Reviews');
    await this.page.locator('#input-name').fill(reviewerName);
    await this.page.locator('#input-review').fill(reviewText);
    await this.page.locator(`input[name="rating"][value="${rating}"]`).check();
    await this.page.locator('#button-review').click();
  }

  async clickReviewContinueWithoutFilling(): Promise<void> {
    await this.openTab('Reviews');
    await this.page.locator('#button-review').click();
  }
}
