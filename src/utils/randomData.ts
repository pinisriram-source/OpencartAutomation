function uniqueSuffix(): string {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

export function uniqueEmail(prefix = 'qa'): string {
  return `${prefix}.${uniqueSuffix()}@example.com`;
}

export function uniqueName(prefix = 'QA'): string {
  return `${prefix}${uniqueSuffix()}`;
}

export function uniqueCode(prefix = 'CODE'): string {
  return `${prefix}${uniqueSuffix()}`.toUpperCase();
}

export interface GuestCustomer {
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  password: string;
  address1: string;
  city: string;
  postcode: string;
  country: string;
  zone: string;
}

export function generateCustomer(): GuestCustomer {
  const suffix = uniqueSuffix();
  return {
    firstName: `QA${suffix}`,
    lastName: 'Tester',
    email: uniqueEmail(),
    telephone: '9876543210',
    password: 'Passw0rd!23',
    address1: '123 Test Street',
    city: 'London',
    postcode: 'SW1A 1AA',
    country: 'United Kingdom',
    zone: 'Greater London',
  };
}
