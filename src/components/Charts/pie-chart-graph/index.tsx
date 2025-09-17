"use client";

import { cn } from "@/lib/utils";
import { PieChart } from "./chart";
import { getPieChartData } from "@/app/[location]/dashboard/dashboard.api";
import { useDateRange } from "@/app/[location]/dashboard/DateRangeContext";
import { useEffect, useState } from "react";
import { format } from "date-fns";

type PropsType = {
  className?: string;
  title?: string;
  type?: string;
  location: string;
};

export function PieChartGraph({ className, title, type, location }: PropsType) {
  const { dateRange } = useDateRange();
  const [piechartData, setPiechartData] = useState<Array<{ name: string; count: number }>>([]);
  const [data, setData] = useState<{ data: { total: number } } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only fetch data when mounted
    if (!isMounted) return;

    const fetchData = async () => {
      setLoading(true);
      setPiechartData([]);
      
      try {
        const fromDate = format(dateRange.from, 'yyyy-MM-dd');
        const toDate = format(dateRange.to, 'yyyy-MM-dd');
        
        const body = {
          fromDate: fromDate,
          toDate: toDate,
          location: location,
          type: type ?? "enrolment-gains",
        };
        
        const result = await getPieChartData(body);
        setData(result);
        const values: Array<{ name: string; count: number }> = result?.data?.values ?? [];
        setPiechartData(values);
        
      } catch (error) {
        console.error(`Error fetching ${type} pie chart data:`, error);
        setPiechartData([]);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, location, isMounted, dateRange]);

  // Show loading skeleton until mounted
  if (!isMounted) {
    return (
      <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm p-6", className)}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="h-6 bg-gray-300 rounded w-32 animate-pulse"></div>
        </div>
        <div className="flex w-full justify-center">
          <div className="h-64 w-64 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm p-6", className)}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">
          {title} {' ('} {data?.data?.total || 0} {')'}
        </h2>
      </div>
      <div className="flex w-full justify-center">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <PieChart
            key={`${type}-${location}`}
            data={
              piechartData && piechartData.length > 0
                ? piechartData.map((item) => ({ name: item.name, amount: Number(item.count) }))
                : []
            }
            type={type || 'enrolment-gains'}
          />
        )}
      </div>
    </div>
  );
}
