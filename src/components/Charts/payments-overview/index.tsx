"use client";
import { cn } from "@/lib/utils";
import { PaymentsOverviewChart } from "./chart";
import { getMonthlyRevenueData } from "@/app/[location]/dashboard/dashboard.api";
import { useEffect, useState } from 'react';

type PropsType = {
  className?: string;
  location: string;
};

export function PaymentsOverview({ className, location }: PropsType) {
  const [chartData, setChartData] = useState<Array<{ x: string; y: number }>>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setChartData([]);
      
      try {
        const data = await getMonthlyRevenueData({ location });
        const result: Array<{ x: string; y: number }> = data?.data?.values ?? [];
        setChartData(result);
        
      } catch (err) {
        console.error('Error fetching monthly revenue data:', err);
        setError('Failed to load chart data');
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    if (location) {
      fetchData();
    }
  }, [location]); // Fetch when location changes

  // Loading skeleton
  if (loading) {
    return (
      <div
        className={cn(
          "rounded-lg border bg-card text-card-foreground shadow-sm p-6",
          className
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="h-6 bg-gray-300 rounded w-40 animate-pulse"></div>
        </div>

        <div className="-ml-4 -mr-5 h-[310px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="text-gray-500">Loading chart data...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={cn(
          "rounded-lg border bg-card text-card-foreground shadow-sm p-6",
          className
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">
            Monthly Revenue
          </h2>
        </div>

        <div className="-ml-4 -mr-5 h-[310px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-red-500">
            <div className="text-4xl">⚠️</div>
            <div className="text-center">
              <div className="font-semibold">Error Loading Data</div>
              <div className="text-sm text-gray-500">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm p-6",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">
          Monthly Revenue
        </h2>
      </div>

      {chartData.length === 0 ? (
        <div className="-ml-4 -mr-5 h-[310px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-gray-500">
            <div className="text-4xl">📊</div>
            <div className="text-center">
              <div className="font-semibold">No Data Available</div>
              <div className="text-sm">No revenue data found for the selected date range</div>
            </div>
          </div>
        </div>
      ) : (
        <PaymentsOverviewChart data={chartData} />
      )}
    </div>
  );
}
