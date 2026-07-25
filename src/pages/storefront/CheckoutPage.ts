import { BasePage } from './BasePage';
import { GuestCustomer } from '../../utils/randomData';

export class CheckoutPage extends BasePage {
  async open(): Promise<void> {
    await this.gotoRoute('checkout/checkout');
  }

  // ---- Step 1: Checkout Options ----

  async chooseGuestCheckout(): Promise<void> {
    await this.page.getByRole('radio', { name: 'Guest Checkout' }).check();
    await this.page.locator('#button-account').click();
    await this.page.locator('#collapse-payment-address').waitFor({ state: 'visible' });
  }

  async loginDuringCheckout(email: string, password: string): Promise<void> {
    await this.page.getByLabel('E-Mail').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Login' }).click();
  }

  // ---- Step 2: Billing Details (guest) ----

  async fillGuestBillingDetails(customer: GuestCustomer): Promise<void> {
    const scope = this.page.locator('#collapse-payment-address');
    await scope.getByLabel('First Name').fill(customer.firstName);
    await scope.getByLabel('Last Name').fill(customer.lastName);
    await scope.getByLabel('E-Mail').fill(customer.email);
    await scope.getByLabel('Telephone').fill(customer.telephone);
    await scope.getByLabel('Address 1').fill(customer.address1);
    await scope.getByLabel('City').fill(customer.city);
    await scope.getByLabel('Post Code').fill(customer.postcode);
    // Selecting the country (re-selecting the already-default one included)
    // always fires this billing form's country-change AJAX, which replaces
    // the zone <select>'s entire option list -- waiting for that response
    // before touching the zone field avoids racing the reload.
    await Promise.all([
      this.page.waitForResponse((r) => /route=checkout\/checkout\/country/.test(r.url())),
      scope.getByLabel('Country').selectOption({ label: customer.country }),
    ]);
    await scope.getByLabel('Region / State').selectOption({ label: customer.zone });

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
    const scope = this.page.locator('#collapse-payment-address');
    await scope.getByLabel('First Name').fill(customer.firstName);
    await scope.getByLabel('Last Name').fill(customer.lastName);
    await scope.getByLabel('Address 1').fill(customer.address1);
    await scope.getByLabel('City').fill(customer.city);
    await scope.getByLabel('Post Code').fill(customer.postcode);
    await Promise.all([
      this.page.waitForResponse((r) => /route=checkout\/checkout\/country/.test(r.url())),
      scope.getByLabel('Country').selectOption({ label: customer.country }),
    ]);
    await scope.getByLabel('Region / State').selectOption({ label: customer.zone });
  }

  async submitAddress(): Promise<void> {
    await this.page.locator('#button-payment-address').click();
  }

  /**
   * Logged-in customers get an extra "Delivery Details" step (choose an
   * existing address or add a new one) that guest checkout never shows --
   * submitting Billing Details auto-saves it to the address book, so this
   * step always has at least that address pre-selected. Guest checkouts
   * never reach this panel at all, so this is a no-op for them.
   */
  async continueDeliveryAddressIfPresent(): Promise<void> {
    const continueButton = this.page.locator('#button-shipping-address');
    try {
      await continueButton.waitFor({ state: 'visible', timeout: 8_000 });
    } catch {
      return;
    }
    await continueButton.click();
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
    const shippingRadio = this.page.locator('#collapse-shipping-method').getByRole('radio').first();
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
    // No wait here: every caller invokes selectPaymentMethodIfPresent() right
    // after, which already does its own explicit waitFor() on the payment
    // panel before proceeding.
  }

  async selectPaymentMethodIfPresent(): Promise<void> {
    const paymentRadio = this.page.locator('#collapse-payment-method').getByRole('radio').first();
    await paymentRadio.waitFor({ state: 'visible', timeout: 15_000 });
    if (!(await paymentRadio.isChecked())) {
      await paymentRadio.check();
    }
  }

  // The comment textarea carries no <label>, and when shipping is required
  // BOTH the shipping-method and payment-method panels render their own copy
  // simultaneously (neither is removed from the DOM) -- .last() targets the
  // payment-method step's copy, which is the one actually submitted.
  async enterOrderComment(comment: string): Promise<void> {
    await this.page.locator('textarea[name="comment"]').last().fill(comment);
  }

  // The "I have read and agree..." checkbox has no <label> either (loose
  // text with an embedded Terms & Conditions link, same as register's), but
  // it's the only checkbox present at this step.
  async agreeToTerms(): Promise<void> {
    await this.page.getByRole('checkbox').check();
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
