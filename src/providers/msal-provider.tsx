'use client';

import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from '@/lib/msal-config';
import { useEffect, useState } from 'react';

interface MSALProviderProps {
  children: React.ReactNode;
}

export function MSALProviderWrapper({ children }: MSALProviderProps) {
  const [msalInstance, setMsalInstance] = useState<PublicClientApplication | null>(null);

  useEffect(() => {
    const instance = new PublicClientApplication(msalConfig);
    
    // Initialize MSAL instance
    instance.initialize().then(() => {
      setMsalInstance(instance);
    }).catch((error) => {
      console.error('MSAL initialization failed:', error);
    });
  }, []);

  if (!msalInstance) {
    return <div>Loading authentication...</div>;
  }

  return (
    <MsalProvider instance={msalInstance}>
      {children}
    </MsalProvider>
  );
}