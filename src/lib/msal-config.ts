import { Configuration, PopupRequest } from '@azure/msal-browser';

const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID || 'f37521b3-eff4-4c2e-94ac-470c858cde33',
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID || 'eac6c00d-e01e-40f8-bb5f-bac6b0ced795'}`,
    redirectUri: typeof window !== 'undefined' ? window.location.origin : 'https://printcloud-app-prod.agreeablegrass-1974a2e0.brazilsouth.azurecontainerapps.io',
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