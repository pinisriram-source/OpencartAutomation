import { BasePage } from './BasePage';
import { GuestCustomer } from '../../utils/randomData';

export class CheckoutPage extends BasePage {
  async open(): Promise<void> {
    await this.gotoRoute('checkout/checkout');
  }

  // ---- Step 1: Checkout Options ----

  async chooseGuestCheckout(): Promise<void> {
    await this.page.locator('input[name="account"][value="guest"]').check();
    await this.page.locator('#button-account').click();
    await this.page.locator('#collapse-payment-address').waitFor({ state: 'visible' });
  }

  async chooseLoginAtCheckout(): Promise<void> {
    await this.page.locator('input[name="account"][value="login"]').check();
    await this.page.locator('#button-account').click();
  }

  async loginDuringCheckout(email: string, password: string): Promise<void> {
    await this.page.locator('#collapse-checkout-option input[name="email"]').fill(email);
    await this.page.locator('#collapse-checkout-option input[name="password"]').fill(password);
    await this.page.getByRole('button', { name: /^login$/i }).click();
  }

  // ---- Step 2: Billing Details (guest) ----

  async fillGuestBillingDetails(customer: GuestCustomer): Promise<void> {
    const p = '#collapse-payment-address';
    await this.page.locator(`${p} #input-payment-firstname`).fill(customer.firstName);
    await this.page.locator(`${p} #input-payment-lastname`).fill(customer.lastName);
    await this.page.locator(`${p} #input-payment-email`).fill(customer.email);
    await this.page.locator(`${p} #input-payment-telephone`).fill(customer.telephone);
    await this.page.locator(`${p} #input-payment-address-1`).fill(customer.address1);
    await this.page.locator(`${p} #input-payment-city`).fill(customer.city);
    await this.page.locator(`${p} #input-payment-postcode`).fill(customer.postcode);
    await this.page.locator(`${p} select[name="country_id"]`).selectOption({ label: customer.country });
    const zoneSelect = this.page.locator(`${p} select[name="zone_id"]`);
    await this.page.waitForFunction(
      (el) => (el as HTMLSelectElement).options.length > 1,
      await zoneSelect.elementHandle(),
    );
    await zoneSelect.selectOption({ label: customer.zone });

    // For shippable products, a "shipping_address" checkbox appears here,
    // checked by default. Checked means "use this billing address for
    // shipping too" (goes straight to the Delivery Method step); unchecked
    // means "ship to a different address" (inserts an extra Delivery
    // Address form). Leaving it at its checked default is what we want.
  }

  async submitGuestBillingDetails(): Promise<void> {
    await this.page.locator('#button-guest').click();
  }

  /**
   * A logged-in customer's Billing Details panel has no email/telephone
   * fields (those belong to the account already) — otherwise same layout.
   */
  async fillLoggedInBillingDetails(customer: GuestCustomer): Promise<void> {
    const p = '#collapse-payment-address';
    await this.page.locator(`${p} #input-payment-firstname`).fill(customer.firstName);
    await this.page.locator(`${p} #input-payment-lastname`).fill(customer.lastName);
    await this.page.locator(`${p} #input-payment-address-1`).fill(customer.address1);
    await this.page.locator(`${p} #input-payment-city`).fill(customer.city);
    await this.page.locator(`${p} #input-payment-postcode`).fill(customer.postcode);
    await this.page.locator(`${p} select[name="country_id"]`).selectOption({ label: customer.country });
    const zoneSelect = this.page.locator(`${p} select[name="zone_id"]`);
    await this.page.waitForFunction(
      (el) => (el as HTMLSelectElement).options.length > 1,
      await zoneSelect.elementHandle(),
    );
    await zoneSelect.selectOption({ label: customer.zone });
  }

  async submitAddress(): Promise<void> {
    await this.page.locator('#button-payment-address').click();
  }

  // ---- Step 3/4: Shipping, Payment method & Confirm ----
  //
  // OpenCart merges these steps dynamically depending on the cart: if no
  // product requires shipping, the "Payment Method" panel already contains
  // the order comment, the Terms & Conditions checkbox, and the final place-
  // order button together (a separate "Confirm Order" step never renders).
  // If shipping IS required, a distinct Delivery Method panel appears first.
  // Handling both shapes here (rather than assuming one) keeps the same
  // spec working regardless of which demo product is used.

  async continueShippingMethodIfPresent(): Promise<void> {
    const shippingRadio = this.page.locator('input[name="shipping_method"]').first();
    try {
      // The shipping method fragment loads asynchronously right after the
      // billing step; a plain .count() can race it and see zero, so give
      // it a real (but short) window before concluding shipping isn't required.
      await shippingRadio.waitFor({ state: 'visible', timeout: 8_000 });
    } catch {
      return;
    }
    if (!(await shippingRadio.isChecked())) {
      await shippingRadio.check();
    }
    await this.page.locator('#button-shipping-method').click();
    await this.page.waitForTimeout(800);
  }

  async selectPaymentMethodIfPresent(): Promise<void> {
    const paymentRadio = this.page.locator('input[name="payment_method"]').first();
    await paymentRadio.waitFor({ state: 'visible', timeout: 15_000 });
    if (!(await paymentRadio.isChecked())) {
      await paymentRadio.check();
    }
  }

  async enterOrderComment(comment: string): Promise<void> {
    await this.page.locator('textarea[name="comment"]').fill(comment);
  }

  async agreeToTerms(): Promise<void> {
    await this.page.locator('input[name="agree"]').check();
  }

  /**
   * Submits the payment step (comment + agree already filled) and, if
   * OpenCart then renders a genuine Step 4 "Confirm Order" panel (order
   * summary + its own Confirm Order button), clicks that too. When no
   * shipping is required some flows finalize directly on the first click,
   * so the second click is skipped if #button-confirm never appears.
   */
  async placeOrder(): Promise<void> {
    await this.page.locator('#button-payment-method').click();
    const confirmButton = this.page.getByRole('button', { name: 'Confirm Order' });
    await confirmButton.waitFor({ state: 'visible', timeout: 15_000 });

    // This environment's PHP prints a mail() warning ahead of the AJAX
    // JSON body (no local SMTP configured), which breaks the page's own
    // jQuery success handler and pops a JS alert() instead of redirecting.
    // The order is still created server-side and the redirect URL is still
    // present at the end of the response, so read it directly and follow
    // it ourselves rather than relying on the (broken) client-side redirect.
    this.page.once('dialog', (d) => d.dismiss());
    const [response] = await Promise.all([
      this.page.waitForResponse((r) => /route=extension\/payment\/[^/]+\/confirm/.test(r.url())),
      confirmButton.click(),
    ]);
    const body = await response.text();
    const match = body.match(/\{"redirect":"([^"]+)"\}\s*$/);
    if (!match) {
      throw new Error(`Could not find a redirect URL in the order confirmation response: ${body.slice(-300)}`);
    }
    await this.page.goto(match[1].replace(/\\\//g, '/'));
  }

  get confirmationHeading() {
    return this.page.getByRole('heading', { name: /order.*(confirm|placed|complete)/i });
  }
}
