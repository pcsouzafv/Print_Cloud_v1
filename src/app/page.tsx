'use client';

import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { useEffect } from 'react';
import LoginPage from '@/components/auth/login-page';
import Dashboard from '@/components/dashboard/dashboard';

export default function Home() {
  const isAuthenticated = useIsAuthenticated();
  const { instance } = useMsal();

  useEffect(() => {
    // Handle redirect callback
    instance.handleRedirectPromise().then((response) => {
      if (response) {
        console.log('Login successful:', response);
      }
    }).catch((error) => {
      console.error('Login failed:', error);
    });
  }, [instance]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <Dashboard />;
}