'use client';

import { useAccount } from '@azure/msal-react';
import { useEffect, useState } from 'react';

interface AzureUserInfo {
  id: string;
  displayName: string;
  mail: string;
  jobTitle?: string;
  department?: string;
  companyName?: string;
}

export function useAzureUser() {
  const account = useAccount();
  const [userInfo, setUserInfo] = useState<AzureUserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (account) {
      // Extract user information from the account
      const azureUser: AzureUserInfo = {
        id: (account as any)?.homeAccountId || (account as any)?.localAccountId || '',
        displayName: (account as any)?.name || '',
        mail: (account as any)?.username || '',
        jobTitle: (account as any)?.idTokenClaims?.jobTitle,
        department: (account as any)?.idTokenClaims?.department,
        companyName: (account as any)?.idTokenClaims?.companyName,
      };
      
      setUserInfo(azureUser);
    }
    setLoading(false);
  }, [account]);

  return {
    user: userInfo,
    loading,
    isAuthenticated: !!account,
  };
}