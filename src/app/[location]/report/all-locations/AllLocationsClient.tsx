"use client";

import * as React from "react";
import { CustomTable } from "@/components/CustomTable";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { getAllLocationsData, LocationStats } from "./all-locations.api";
import { useExportableData } from "@/hooks/useExportableData";
import { usePrintReport } from "@/hooks/usePrintReport";
import { formatCurrency } from "@/utils";
import { ColumnDef } from "@tanstack/react-table";
import { LoadingAnimation } from "@/components/LoadingAnimation";

interface AllLocationsClientProps {
  location: string;
}

const columns: ColumnDef<LocationStats>[] = [
  {
    accessorKey: "name",
    header: "Name",
    meta: { printable: true, printableName: "Name" },
  },
  {
    accessorKey: "activeEnrolments",
    header: "Active Enrolments",


    cell: ({ row }) => <span className="text-right block">{row.original.activeEnrolments}</span>,
    meta: { printable: true, printableName: "Active Enrolments" },
  },
  {
    accessorKey: "revenue",
    header: "Revenue",
    cell: ({ row }) => <span className="text-right block">{formatCurrency(row.original.revenue)}</span>,
    meta: { printable: true, printableName: "Revenue", exportFormatter: (value: unknown) => formatCurrency(value as number) },
  },
  {
    accessorKey: "royalty",
    header: "Royalty",
    cell: ({ row }) => <span className="text-right block">{formatCurrency(row.original.royalty)}</span>,
    meta: { printable: true, printableName: "Royalty", exportFormatter: (value: unknown) => formatCurrency(value as number) },
  },
  {
    accessorKey: "advertisement",
    header: "Advertisement",
    cell: ({ row }) => <span className="text-right block">{formatCurrency(row.original.advertisement)}</span>,
    meta: { printable: true, printableName: "Advertisement", exportFormatter: (value: unknown) => formatCurrency(value as number) },
  },
  {
    accessorKey: "hst",
    header: "HST",
    cell: ({ row }) => <span className="text-right block">{formatCurrency(row.original.hst)}</span>,
    meta: { printable: true, printableName: "HST", exportFormatter: (value: unknown) => formatCurrency(value as number) },
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => <span className="text-right block">{formatCurrency(row.original.total)}</span>,
    meta: { printable: true, printableName: "Total", exportFormatter: (value: unknown) => formatCurrency(value as number) },
  }
];

export function AllLocationsClient({ location }: AllLocationsClientProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [locationData, setLocationData] = React.useState<LocationStats[]>([]);
  const [dateRange, setDateRange] = React.useState(() => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    return {
      from: lastMonth,
      to: lastDayOfLastMonth,
    };
  });


  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use local date formatting to avoid timezone issues
      const startDate = `${dateRange.from.getFullYear()}-${String(dateRange.from.getMonth() + 1).padStart(2, '0')}-${String(dateRange.from.getDate()).padStart(2, '0')}`;
      const endDate = `${dateRange.to.getFullYear()}-${String(dateRange.to.getMonth() + 1).padStart(2, '0')}-${String(dateRange.to.getDate()).padStart(2, '0')}`;
      
      const response = await getAllLocationsData({ location, startDate, endDate });
      
      if (response.success) {
        setLocationData(response.data);
      } else {
        setError(response.message || 'API returned an error');
      }
    } catch (err) {
      setError('Error fetching data');
      console.error('Error fetching all locations data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [location, dateRange]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const footerRow = React.useMemo(() => {
    if (locationData.length === 0) return undefined;
    const totals = locationData.reduce(
      (acc, loc) => ({
        activeEnrolments: acc.activeEnrolments + loc.activeEnrolments,
        revenue: acc.revenue + loc.revenue,
        royalty: acc.royalty + loc.royalty,
        advertisement: acc.advertisement + loc.advertisement,
        hst: acc.hst + loc.hst,
        total: acc.total + loc.total,
      }),
      { activeEnrolments: 0, revenue: 0, royalty: 0, advertisement: 0, hst: 0, total: 0 }
    );
    return { name: "TOTAL", ...totals };
  }, [locationData]);

  const { handlePrint } = usePrintReport<LocationStats>();
  const { exportToCsv, exportToPdf, exportToHtml, exportToJson, exportToText, exportToExcel } = useExportableData({
    reportTitle: 'All Locations Report',
    columns,
    data: locationData,
    footer: footerRow,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation
          size="xl"
          text="Loading all locations data..."
          className="text-center"
        />
      </div>
    );
  }

  return (
    <ReportPageLayout
      title="All Locations Report"
      subtitle="Statistics and financial data for all locations"
      isLoading={isLoading}
      error={error}
      onRetry={fetchData}
    >
      <CustomTable
        data={locationData}
        columns={columns}
        footerRow={footerRow}

        // Date Range Picker
        enableDateRangePicker={true}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}

        // Features
        enablePrint={true}
        onPrint={() => handlePrint({
          reportTitle: 'All Locations Report',
          columns,
          data: locationData,
          footer: footerRow,
          location,
          dateRange,
        })}
        enableExport={true}
        onExport={{
          html: exportToHtml,
          csv: exportToCsv,
          text: exportToText,
          excel: exportToExcel,
          pdf: exportToPdf,
          json: exportToJson,
        }}

        // Disabled Features
        enableSearch={false}
        enableFilter={false}
        enableSorting={false}
        enableRowsPerPage={false}
      />
    </ReportPageLayout>
  );
}
