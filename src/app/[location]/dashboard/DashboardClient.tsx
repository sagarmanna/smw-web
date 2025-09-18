"use client";

import { PaymentsOverview } from "@/components/Charts/payments-overview";
import { PieChartGraph } from "@/components/Charts/pie-chart-graph";
import { DateRangePicker } from "@/components/DateRangePicker";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { useDateRange } from "./DateRangeContext";
import { useState, useEffect } from "react";
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

export function DashboardClient({ location }: DashboardClientProps) {
  const { dateRange, setDateRange } = useDateRange();
  const formattedLocation = location.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const fromDate = format(dateRange.from, 'yyyy-MM-dd');
        const toDate = format(dateRange.to, 'yyyy-MM-dd');
        
        // Fetch all data in parallel using Promise.all
        const [monthlyRevenueResult, enrolmentGainsResult, enrolmentLossesResult, instructionHoursResult] = await Promise.all([
          getMonthlyRevenueData({ location }),
          getPieChartData({ fromDate, toDate, location, type: "enrolment-gains" }),
          getPieChartData({ fromDate, toDate, location, type: "enrolment-losses" }),
          getPieChartData({ fromDate, toDate, location, type: "instruction-hours" })
        ]);

        setDashboardData({
          monthlyRevenue: monthlyRevenueResult?.data?.values ?? [],
          enrolmentGains: enrolmentGainsResult?.data?.values ?? [],
          enrolmentLosses: enrolmentLossesResult?.data?.values ?? [],
          instructionHours: instructionHoursResult?.data?.values ?? [],
        });
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [location, dateRange]);

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

      
      {/* Monthly Revenue Chart */}
      <PaymentsOverview 
        location={location} 
        data={dashboardData?.monthlyRevenue}
      />
      
      {/* Pie Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <PieChartGraph 
          location={location}
          title="Enrolment Gains"
          type="enrolment-gains"
          data={dashboardData?.enrolmentGains}
        />
        <PieChartGraph 
          location={location}
          title="Enrolment Losses"
          type="enrolment-losses"
          data={dashboardData?.enrolmentLosses}
        />
        <PieChartGraph 
          location={location}
          title="Instruction Hours"
          type="instruction-hours"
          data={dashboardData?.instructionHours}
        />
      </div>
      
    </div>
  );
}
