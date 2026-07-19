import { test, expect, uniqueEmail, stringOfLength } from '../fixtures/registration.fixture';
import testData from '../test-data/registration.json';

const { validCustomer, boundary, invalidEmailSamples, messages } = testData;

test.describe('Registration', () => {
  // TC-REG-001: Functional - register with all valid mandatory fields
  test('TC-REG-001 registers successfully with valid mandatory fields', async ({ registrationPage }) => {
    await registrationPage.open();

    await registrationPage.register({
      firstName: validCustomer.firstName,
      lastName: validCustomer.lastName,
      email: uniqueEmail('valid'),
      telephone: validCustomer.telephone,
      password: validCustomer.password,
    });

    await expect(registrationPage.page).toHaveURL(/route=account\/success/);
    await expect(registrationPage.successHeading).toBeVisible();
    await expect(registrationPage.successMessage).toBeVisible();
  });

  // TC-REG-002: Functional - register with newsletter subscription enabled
  test('TC-REG-002 registers successfully with newsletter subscription enabled', async ({ registrationPage }) => {
    await registrationPage.open();

    await registrationPage.register({
      firstName: validCustomer.firstName,
      lastName: validCustomer.lastName,
      email: uniqueEmail('newsletter'),
      telephone: validCustomer.telephone,
      password: validCustomer.password,
      subscribeNewsletter: true,
    });

    await expect(registrationPage.page).toHaveURL(/route=account\/success/);
    await expect(registrationPage.successHeading).toBeVisible();
  });

  // TC-REG-003: Negative - submit completely empty form
  test('TC-REG-003 rejects an empty form with a required-field message per field', async ({ registrationPage }) => {
    await registrationPage.open();

    await registrationPage.submit();

    await expect(registrationPage.alertBanner).toHaveText(messages.agreeRequired);
    await expect(registrationPage.firstNameError).toHaveText(messages.firstNameLength);
    await expect(registrationPage.lastNameError).toHaveText(messages.lastNameLength);
    await expect(registrationPage.emailError).toHaveText(messages.emailInvalid);
    await expect(registrationPage.telephoneError).toHaveText(messages.telephoneLength);
    await expect(registrationPage.passwordError).toHaveText(messages.passwordLength);
    await expect(registrationPage.page).toHaveURL(/route=account\/register/);
  });

  // TC-REG-004: Negative/Validation - invalid email format
  // Note: the email input is type="email", so a string with no "@" (e.g. "plainaddress") is blocked by the
  // browser's native constraint validation before any request is sent. invalidEmailSamples[0] ("a@b") passes
  // that native check but still fails the server's stricter format rule, so it reaches the app's own message.
  test('TC-REG-004 rejects an invalid email format', async ({ registrationPage }) => {
    await registrationPage.open();

    await registrationPage.fillForm({
      firstName: validCustomer.firstName,
      lastName: validCustomer.lastName,
      email: invalidEmailSamples[0],
      telephone: validCustomer.telephone,
      password: validCustomer.password,
      confirmPassword: validCustomer.password,
      agreeToPolicy: true,
    });
    await registrationPage.submit();

    await expect(registrationPage.emailError).toHaveText(messages.emailInvalid);
    await expect(registrationPage.page).toHaveURL(/route=account\/register/);
  });

  // TC-REG-005: Negative/Validation - password confirmation mismatch
  test('TC-REG-005 rejects a mismatched password confirmation', async ({ registrationPage }) => {
    await registrationPage.open();

    await registrationPage.fillForm({
      firstName: validCustomer.firstName,
      lastName: validCustomer.lastName,
      email: uniqueEmail('mismatch'),
      telephone: validCustomer.telephone,
      password: validCustomer.password,
      confirmPassword: `${validCustomer.password}X`,
      agreeToPolicy: true,
    });
    await registrationPage.submit();

    await expect(registrationPage.confirmPasswordError).toHaveText(messages.passwordMismatch);
    await expect(registrationPage.page).toHaveURL(/route=account\/register/);
  });

  // TC-REG-006: Negative/Business rule - duplicate email is rejected
  test('TC-REG-006 rejects registration with an email that is already registered', async ({ registrationPage }) => {
    const email = uniqueEmail('duplicate');

    await registrationPage.open();
    await registrationPage.register({
      firstName: validCustomer.firstName,
      lastName: validCustomer.lastName,
      email,
      telephone: validCustomer.telephone,
      password: validCustomer.password,
    });
    await expect(registrationPage.page).toHaveURL(/route=account\/success/);

    await registrationPage.logout();
    await registrationPage.open();
    await registrationPage.register({
      firstName: validCustomer.firstName,
      lastName: validCustomer.lastName,
      email,
      telephone: validCustomer.telephone,
      password: validCustomer.password,
    });

    await expect(registrationPage.alertBanner).toHaveText(messages.emailDuplicate);
    await expect(registrationPage.page).toHaveURL(/route=account\/register/);
  });

  // TC-REG-007: Negative/Validation - must agree to Privacy Policy
  test('TC-REG-007 blocks submission when Privacy Policy is not agreed to', async ({ registrationPage }) => {
    await registrationPage.open();

    await registrationPage.fillForm({
      firstName: validCustomer.firstName,
      lastName: validCustomer.lastName,
      email: uniqueEmail('noagree'),
      telephone: validCustomer.telephone,
      password: validCustomer.password,
      confirmPassword: validCustomer.password,
    });
    await registrationPage.submit();

    await expect(registrationPage.alertBanner).toHaveText(messages.agreeRequired);
    await expect(registrationPage.page).toHaveURL(/route=account\/register/);
  });

  // TC-REG-008: Boundary - first name at minimum length (1 character) is accepted
  test('TC-REG-008 accepts a first name at the minimum length of 1 character', async ({ registrationPage }) => {
    await registrationPage.open();

    await registrationPage.register({
      firstName: stringOfLength(boundary.firstNameMinLength),
      lastName: validCustomer.lastName,
      email: uniqueEmail('fnmin'),
      telephone: validCustomer.telephone,
      password: validCustomer.password,
    });

    await expect(registrationPage.page).toHaveURL(/route=account\/success/);
  });

  // TC-REG-009: Boundary - first name at maximum length (32 characters) is accepted
  test('TC-REG-009 accepts a first name at the maximum length of 32 characters', async ({ registrationPage }) => {
    await registrationPage.open();

    await registrationPage.register({
      firstName: stringOfLength(boundary.firstNameMaxLength),
      lastName: validCustomer.lastName,
      email: uniqueEmail('fnmax'),
      telephone: validCustomer.telephone,
      password: validCustomer.password,
    });

    await expect(registrationPage.page).toHaveURL(/route=account\/success/);
  });

  // TC-REG-010: Boundary - first name exceeding maximum length (33 characters) is rejected
  test('TC-REG-010 rejects a first name exceeding the maximum length of 32 characters', async ({ registrationPage }) => {
    await registrationPage.open();

    await registrationPage.fillForm({
      firstName: stringOfLength(boundary.firstNameOverMax),
      lastName: validCustomer.lastName,
      email: uniqueEmail('fnovermax'),
      telephone: validCustomer.telephone,
      password: validCustomer.password,
      confirmPassword: validCustomer.password,
      agreeToPolicy: true,
    });
    await registrationPage.submit();

    await expect(registrationPage.firstNameError).toHaveText(messages.firstNameLength);
    await expect(registrationPage.page).toHaveURL(/route=account\/register/);
  });

  // TC-REG-011: Boundary - telephone below minimum length (2 characters) is rejected
  test('TC-REG-011 rejects a telephone number below the minimum length of 3 characters', async ({ registrationPage }) => {
    await registrationPage.open();

    await registrationPage.fillForm({
      firstName: validCustomer.firstName,
      lastName: validCustomer.lastName,
      email: uniqueEmail('telbelowmin'),
      telephone: stringOfLength(boundary.telephoneBelowMin),
      password: validCustomer.password,
      confirmPassword: validCustomer.password,
      agreeToPolicy: true,
    });
    await registrationPage.submit();

    await expect(registrationPage.telephoneError).toHaveText(messages.telephoneLength);
    await expect(registrationPage.page).toHaveURL(/route=account\/register/);
  });

  // TC-REG-012: Boundary - password below minimum length (3 characters) is rejected
  test('TC-REG-012 rejects a password below the minimum length of 4 characters', async ({ registrationPage }) => {
    await registrationPage.open();
    const shortPassword = stringOfLength(boundary.passwordBelowMin);

    await registrationPage.fillForm({
      firstName: validCustomer.firstName,
      lastName: validCustomer.lastName,
      email: uniqueEmail('pwbelowmin'),
      telephone: validCustomer.telephone,
      password: shortPassword,
      confirmPassword: shortPassword,
      agreeToPolicy: true,
    });
    await registrationPage.submit();

    await expect(registrationPage.passwordError).toHaveText(messages.passwordLength);
    await expect(registrationPage.page).toHaveURL(/route=account\/register/);
  });
});
