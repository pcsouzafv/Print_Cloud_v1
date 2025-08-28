/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    AZURE_AD_CLIENT_ID: process.env.AZURE_AD_CLIENT_ID,
    AZURE_AD_TENANT_ID: process.env.AZURE_AD_TENANT_ID,
  },
};

module.exports = nextConfig;