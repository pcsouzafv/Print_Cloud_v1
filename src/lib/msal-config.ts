import { Configuration, PopupRequest } from '@azure/msal-browser';

const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID || 'fb7bea67-2fbc-4891-8a13-e01d6bcab417',
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID || '4e478318-c461-4365-8da2-f6b0809542b1'}`,
    redirectUri: typeof window !== 'undefined' ? window.location.origin : 'https://printcloud-app-prod.wittypebble-a8e9df9c.eastus.azurecontainerapps.io',
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

export const loginRequest: PopupRequest = {
  scopes: ['User.Read', 'Group.Read.All'],
};

export { msalConfig };