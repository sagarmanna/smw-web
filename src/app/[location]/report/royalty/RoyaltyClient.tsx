"use client";

import * as React from "react";
import { getRoyalty, Royalty } from "./royalty.api";
import { addDays, subDays } from "date-fns";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatCurrency";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { formatLocationName } from "@/utils";

// Client Component
export const RoyaltyClient = ({ location }: { location: string }) => {
  const [data, setData] = React.useState<Royalty | null>(null);
  const [meta, setMeta] = React.useState<{ startDate: string; endDate: string; location: string } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [dateRange, setDateRange] = React.useState({
    from: new Date(),
    to: new Date(),
  });

  const fetchRoyaltyReport = React.useCallback(async (startDate?: Date, endDate?: Date) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getRoyalty(location, {
        startDate: startDate || dateRange.from,
        endDate: endDate || dateRange.to,
      });

      if (response.success) {
        setData(response.data.body);
        setMeta(response.data.meta);
      } else {
        setError(response.message || "An unknown error occurred");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      console.error("Failed to fetch royalty report:", err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [location, dateRange]);

  React.useEffect(() => {
    fetchRoyaltyReport(dateRange.from, dateRange.to);
  }, [fetchRoyaltyReport, dateRange]);

  const handleDateRangeChange = (newDateRange: { from: Date | undefined; to: Date | undefined }) => {
    if (newDateRange.from && newDateRange.to) {
      setDateRange({ from: newDateRange.from, to: newDateRange.to });
      fetchRoyaltyReport(newDateRange.from, newDateRange.to);
    }
  };

  const refetch = () => {
    fetchRoyaltyReport(dateRange.from, dateRange.to);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const reportContent = `
        <html>
          <head>
            <title>Royalty Report</title>
            <style>
              body { font-family: sans-serif; margin: 2rem; }
              h1 { color: #333; }
              table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
              th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #ddd; }
              th { background-color: #f7f7f7; }
              .total { font-weight: bold; font-size: 1.25rem; }
            </style>
          </head>
          <body>
            <h1>Royalty Report</h1>
            <p><strong>Location:</strong> ${formatLocationName(meta?.location || "")} | <strong>Date Range:</strong> ${meta?.startDate} - ${meta?.endDate}</p>
            <table>
              ${Object.entries(data || {})
                .filter(([key]) => key !== "Total")
                .map(
                  ([key, value]) => `
                    <tr>
                      <td>${key}</td>
                      <td style="text-align: right;">${formatCurrency(
                        parseFloat(value)
                      )}</td>
                    </tr>
                  `
                )
                .join("")}
              ${
                data?.Total
                  ? `
                    <tr class="total">
                      <td>Total</td>
                      <td style="text-align: right;">${formatCurrency(
                        parseFloat(data.Total)
                      )}</td>
                    </tr>
                  `
                  : ""
              }
            </table>
          </body>
        </html>
      `;
      printWindow.document.write(reportContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation
          size="xl"
          text="Loading royalty report..."
          className="text-center"
        />
      </div>
    );
  }

  return (
    <ReportPageLayout
      title="Royalty Report"
      subtitle={`Royalty report for ${meta?.location}`}
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
    >
      <div className="flex justify-end items-center gap-4 mb-4">
        <DateRangePicker
          value={{ from: dateRange.from, to: dateRange.to }}
          onChange={handleDateRangeChange}
        />
        <Button onClick={handlePrint} variant="outline" size="icon" className="mr-4">
          <Printer className="h-5 w-5" />
        </Button>
      </div>
      {data && (
        <Card className="max-w-2xl" id="royalty-report">
          <CardHeader>
            <CardTitle>
              Report from {meta?.startDate} to {meta?.endDate}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
              {Object.entries(data)
                .filter(([key]) => key !== 'Total')
                .map(([key, value]) => (
                  <li key={key} className="flex items-center justify-between py-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{key}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatCurrency(parseFloat(value))}</p>
                  </li>
                ))}
            </ul>
            {data.Total && (
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">Total</p>
                <p className="text-base font-bold text-gray-900 dark:text-gray-100">{formatCurrency(parseFloat(data.Total))}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </ReportPageLayout>
  );
};
