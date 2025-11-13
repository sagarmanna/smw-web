"use client";

import { useEffect, useState, ReactNode } from 'react';

interface TokenGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Client component that checks for token in localStorage
 * Only renders children if token exists
 * Redirects to legacy login page if no token is found
 */
export function TokenGuard({ children, fallback }: TokenGuardProps) {
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Check token on client side only
    const token = localStorage.getItem('token');
    const tokenExists = !!token;
    setHasToken(tokenExists);

    // If no token and we haven't redirected yet, redirect to legacy login
    if (!tokenExists && !hasRedirected) {
      const legacyUrl = process.env.NEXT_PUBLIC_LEGACY_URL;
      
      if (!legacyUrl) {
        console.error('❌ NEXT_PUBLIC_LEGACY_URL is not defined. Cannot redirect to login.');
        return;
      }
      
      const loginUrl = `${legacyUrl}/login`;
      
      console.log('🔴 No token found, redirecting to login:', loginUrl);
      setHasRedirected(true);
      window.location.href = loginUrl;
    }
  }, [hasRedirected]);

  // Show nothing while checking (prevents flash of content)
  if (hasToken === null) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If no token, show fallback while redirecting
  if (!hasToken) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Token exists, render children
  return <>{children}</>;
}

