"use client";

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/redux/hooks';

interface DashboardProtectionProps {
  children: React.ReactNode;
  location: string;
}

export function DashboardProtection({ children, location }: DashboardProtectionProps) {
  const router = useRouter();
  const { userInfo } = useAppSelector((state) => state.user);
  const { permissions, isLoading: permissionsLoading } = useAppSelector((state) => state.permissions);
  const { flags } = useAppSelector((state) => state.locationFlags);
  const locationFlags = useMemo(() => flags[location] || {}, [flags, location]);

  useEffect(() => {
    // Only check for staff members and only once when permissions are loaded
    if (userInfo?.role === 'staffmember' && permissions && !permissionsLoading) {
      // Check if user has any dashboard permissions (exclude manageEnrolments)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { manageEnrolments, ...chartPermissions } = permissions.dashboardPermissions || {};
      const hasAnyDashboardPermission = Object.values(chartPermissions).some(
        permission => permission === true
      );

      if (!hasAnyDashboardPermission) {
        // Redirect to schedule page
        const scheduleSource = locationFlags.schedule === 'modern' ? 'modern' : 'legacy';
        
        if (scheduleSource === 'modern') {
          router.push(`/${location}/schedule`);
        } else {
          // Redirect to legacy schedule page
          const legacyBaseUrl = process.env.NEXT_PUBLIC_LEGACY_URL || 'http://localhost:8080';
          window.location.href = `${legacyBaseUrl}/schedule`;
        }
      }
    }
  }, [userInfo, permissions, permissionsLoading, locationFlags, location, router]);

  // Show loading while checking permissions for staff members
  if (userInfo?.role === 'staffmember' && permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // For admin/owner or staff with permissions, show the dashboard
  return <>{children}</>;
}
