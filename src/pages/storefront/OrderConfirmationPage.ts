import { BasePage } from './BasePage';

export class OrderConfirmationPage extends BasePage {
  get heading() {
    return this.page.locator('#content h1');
  }

  get successText() {
    return this.page.getByText(/your order has been (placed|processed)/i);
  }
}
