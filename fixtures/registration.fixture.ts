import { test as base, expect } from '@playwright/test';
import { RegistrationPage } from '../pages/registration.page';

type RegistrationFixtures = {
  registrationPage: RegistrationPage;
};

export const test = base.extend<RegistrationFixtures>({
  registrationPage: async ({ page }, use) => {
    await use(new RegistrationPage(page));
  },
});

export { expect };

/** Generates a unique, non-colliding email for registration tests against the shared public demo instance. */
export function uniqueEmail(tag: string): string {
  const stamp = Date.now();
  const rand = Math.floor(Math.random() * 100000);
  return `qa.${tag}.${stamp}.${rand}@mailinator.com`;
}

/** Generates a string of the given length made of repeated alphabetic characters, for boundary-length inputs. */
export function stringOfLength(length: number): string {
  return 'a'.repeat(length);
}
