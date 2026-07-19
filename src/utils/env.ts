export const env = {
  storefrontBaseUrl: process.env.STOREFRONT_BASE_URL ?? 'http://localhost/opencart/upload/',
  adminBaseUrl: process.env.ADMIN_BASE_URL ?? 'http://localhost/opencart/upload/admin/',
  adminUsername: process.env.ADMIN_USERNAME ?? 'admin',
  adminPassword: process.env.ADMIN_PASSWORD ?? 'admin',
};
