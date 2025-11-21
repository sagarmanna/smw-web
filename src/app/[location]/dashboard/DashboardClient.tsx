"use client";

import { PaymentsOverview } from "@/components/Charts/payments-overview";
import { PieChartGraph } from "@/components/Charts/pie-chart-graph";
import { DateRangePicker } from "@/components/DateRangePicker";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { useDateRange } from "./DateRangeContext";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { useEffect, useMemo, useCallback } from "react";
import { fetchDashboardData } from "./dashboard.slice";
import { format } from "date-fns";

interface DashboardClientProps {
  location: string;
}

export function DashboardClient({ location }: DashboardClientProps) {
  const { dateRange, setDateRange } = useDateRange();
  const dispatch = useAppDispatch();
  const { userInfo } = useAppSelector((state) => state.user);
  const { permissions } = useAppSelector((state) => state.permissions);
  const formattedLocation = location.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  
  // Get dashboard data from Redux
  const dashboardState = useAppSelector((state) => state.dashboard);
  const isLoading = dashboardState.isLoading;
  const error = dashboardState.error;

  // Memoize permission checks to prevent unnecessary re-renders
  const chartPermissions = useMemo(() => {
    // Admin and owner have access to all charts
    if (userInfo?.role === 'administrator' || userInfo?.role === 'owner') {
      return {
        manageMonthlyRevenue: true,
        manageEnrolmentGains: true,
        manageEnrolmentLosses: true,
        manageInstructionHours: true,
      };
    }
    
    // For staff members, check dashboard permissions (exclude manageEnrolments)
    if (userInfo?.role === 'staffmember' && permissions?.dashboardPermissions) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { manageEnrolments, ...chartPerms } = permissions.dashboardPermissions;
      return chartPerms;
    }
    
    return {};
  }, [userInfo?.role, permissions?.dashboardPermissions]);

  // Memoized permission check function
  const hasPermission = useCallback((permission: string): boolean => {
    return chartPermissions[permission] === true;
  }, [chartPermissions]);

  // Create cache key for current location and date range
  const cacheKey = useMemo(() => {
    const fromDate = format(dateRange.from, 'yyyy-MM-dd');
    const toDate = format(dateRange.to, 'yyyy-MM-dd');
    return `${location}_${fromDate}_${toDate}`;
  }, [location, dateRange.from, dateRange.to]);

  // Get dashboard data from Redux state using cache key
  const dashboardData = useMemo(() => {
    return dashboardState.data[cacheKey] || null;
  }, [dashboardState.data, cacheKey]);

  // Check if data exists and is recent (within 5 minutes)
  const hasCachedData = useMemo(() => {
    const lastFetched = dashboardState.lastFetched[cacheKey];
    if (!lastFetched) return false;
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return lastFetched > fiveMinutesAgo && dashboardData !== null;
  }, [dashboardState.lastFetched, cacheKey, dashboardData]);

  useEffect(() => {
    // Only fetch data if we have user info and don't have cached data
    if (!userInfo) return;

    // For admin/owner, fetch immediately if no cached data
    if (userInfo.role === 'administrator' || userInfo.role === 'owner') {
      if (!hasCachedData) {
        const fromDate = format(dateRange.from, 'yyyy-MM-dd');
        const toDate = format(dateRange.to, 'yyyy-MM-dd');
        
        dispatch(
          fetchDashboardData({
            location,
            fromDate,
            toDate,
            permissions: chartPermissions,
          })
        );
      }
    } else if (userInfo.role === 'staffmember' && permissions) {
      // For staff, wait for permissions and fetch if no cached data
      if (!hasCachedData) {
        const fromDate = format(dateRange.from, 'yyyy-MM-dd');
        const toDate = format(dateRange.to, 'yyyy-MM-dd');
        
        dispatch(
          fetchDashboardData({
            location,
            fromDate,
            toDate,
            permissions: chartPermissions,
          })
        );
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, dateRange.from, dateRange.to, userInfo?.id, userInfo?.role, chartPermissions, hasCachedData, dispatch]);

  // Show full-page loading animation while fetching data (only if no cached data)
  if (isLoading && !hasCachedData) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation 
          size="xl" 
          text="Loading dashboard data..." 
          className="text-center"
        />
      </div>  
    );
  }

  // Show error state (only if we don't have cached data to show)
  if (error && !hasCachedData) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Dashboard</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // If no data and not loading, show empty state (user has no permissions)
  if (!dashboardData && !isLoading) {
    const hasAnyPermission = Object.values(chartPermissions).some(perm => perm === true);
    if (!hasAnyPermission) {
      return (
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">No Dashboard Access</h2>
            <p className="text-muted-foreground">You don&apos;t have permission to view any dashboard charts.</p>
          </div>
        </div>
      );
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the {formattedLocation} dashboard
          </p>
        </div>
        <div className="flex justify-end">
          <DateRangePicker 
            value={dateRange}
            onChange={setDateRange}
          />
        </div>
      </div>

      
      {/* Monthly Revenue Chart - Only show if user has permission */}
      {hasPermission('manageMonthlyRevenue') && (
        <PaymentsOverview 
          location={location} 
          data={dashboardData?.monthlyRevenue}
        />
      )}
      
      {/* Pie Charts Grid - Only show charts user has permission for */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {hasPermission('manageEnrolmentGains') && (
          <PieChartGraph 
            location={location}
            title="Enrolment Gains"
            type="enrolment-gains"
            data={dashboardData?.enrolmentGains}
          />
        )}
        {hasPermission('manageEnrolmentLosses') && (
          <PieChartGraph 
            location={location}
            title="Enrolment Losses"
            type="enrolment-losses"
            data={dashboardData?.enrolmentLosses}
          />
        )}
        {hasPermission('manageInstructionHours') && (
          <PieChartGraph 
            location={location}
            title="Instruction Hours"
            type="instruction-hours"
            data={dashboardData?.instructionHours}
          />
        )}
      </div>
      
    </div>
  );
}
