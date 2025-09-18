"use client";

import { PaymentsOverview } from "@/components/Charts/payments-overview";
import { PieChartGraph } from "@/components/Charts/pie-chart-graph";
import { DateRangePicker } from "@/components/DateRangePicker";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { useDateRange } from "./DateRangeContext";
import { useAppSelector } from "@/redux/hooks";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { getMonthlyRevenueData, getPieChartData } from "./dashboard.api";
import { format } from "date-fns";

interface DashboardClientProps {
  location: string;
}

interface DashboardData {
  monthlyRevenue: Array<{ x: string; y: number }>;
  enrolmentGains: Array<{ name: string; count: number }>;
  enrolmentLosses: Array<{ name: string; count: number }>;
  instructionHours: Array<{ name: string; count: number }>;
}

interface MonthlyRevenueResponse {
  data: {
    values: Array<{ x: string; y: number }>;
  };
}

interface PieChartResponse {
  data: {
    values: Array<{ name: string; count: number }>;
  };
}

type ChartApiResponse = MonthlyRevenueResponse | PieChartResponse | null;

export function DashboardClient({ location }: DashboardClientProps) {
  const { dateRange, setDateRange } = useDateRange();
  const { userInfo } = useAppSelector((state) => state.user);
  const { permissions } = useAppSelector((state) => state.permissions);
  const formattedLocation = location.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

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

  useEffect(() => {
    const fetchAllData = async () => {
      // Prevent duplicate API calls
      if (isFetchingRef.current) {
        console.log('Dashboard: Skipping fetch - already in progress');
        return;
      }
      
      console.log('Dashboard: Starting fetch for', location, 'role:', userInfo?.role);
      isFetchingRef.current = true;
      
      // Don't show loading if we already have data and just changing date range
      if (!dashboardData) {
        setIsLoading(true);
      }
      setError(null);
      
      try {
        const fromDate = format(dateRange.from, 'yyyy-MM-dd');
        const toDate = format(dateRange.to, 'yyyy-MM-dd');
        
        // Only fetch data for charts the user has permission to see
        const fetchPromises: Promise<ChartApiResponse>[] = [];
        const chartTypes: string[] = [];
        
        // Check permissions and add to fetch promises
        if (hasPermission('manageMonthlyRevenue')) {
          fetchPromises.push(getMonthlyRevenueData({ location }));
          chartTypes.push('monthlyRevenue');
        }
        
        if (hasPermission('manageEnrolmentGains')) {
          fetchPromises.push(getPieChartData({ fromDate, toDate, location, type: "enrolment-gains" }));
          chartTypes.push('enrolmentGains');
        }
        
        if (hasPermission('manageEnrolmentLosses')) {
          fetchPromises.push(getPieChartData({ fromDate, toDate, location, type: "enrolment-losses" }));
          chartTypes.push('enrolmentLosses');
        }
        
        if (hasPermission('manageInstructionHours')) {
          fetchPromises.push(getPieChartData({ fromDate, toDate, location, type: "instruction-hours" }));
          chartTypes.push('instructionHours');
        }

        // If no permissions, set empty data and stop loading
        if (fetchPromises.length === 0) {
          setDashboardData({
            monthlyRevenue: [],
            enrolmentGains: [],
            enrolmentLosses: [],
            instructionHours: [],
          });
          setIsLoading(false);
          isFetchingRef.current = false;
          return;
        }

        // Fetch only the data we need
        const results = await Promise.all(fetchPromises);

        // Build dashboard data object based on what we fetched
        const newDashboardData: DashboardData = {
          monthlyRevenue: [],
          enrolmentGains: [],
          enrolmentLosses: [],
          instructionHours: [],
        };

        let resultIndex = 0;
        chartTypes.forEach(chartType => {
          const result = results[resultIndex];
          if (chartType === 'monthlyRevenue') {
            newDashboardData.monthlyRevenue = (result as MonthlyRevenueResponse)?.data?.values ?? [];
          } else if (chartType === 'enrolmentGains') {
            newDashboardData.enrolmentGains = (result as PieChartResponse)?.data?.values ?? [];
          } else if (chartType === 'enrolmentLosses') {
            newDashboardData.enrolmentLosses = (result as PieChartResponse)?.data?.values ?? [];
          } else if (chartType === 'instructionHours') {
            newDashboardData.instructionHours = (result as PieChartResponse)?.data?.values ?? [];
          }
          resultIndex++;
        });

        setDashboardData(newDashboardData);
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    };

    // Only fetch data if we have user info
    // For admin/owner, fetch immediately
    // For staff, wait for permissions to load
    if (userInfo) {
      if (userInfo.role === 'administrator' || userInfo.role === 'owner') {
        fetchAllData();
      } else if (userInfo.role === 'staffmember' && permissions) {
        fetchAllData();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, dateRange.from, dateRange.to, userInfo?.id, userInfo?.role, chartPermissions]);

  // Show full-page loading animation while fetching data
  if (isLoading) {
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

  // Show error state
  if (error) {
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
