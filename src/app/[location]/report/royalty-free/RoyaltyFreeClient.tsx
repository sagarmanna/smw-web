"use client";

import * as React from "react";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { getRoyaltyFreeList, RoyaltyFreeItem } from "./royalty-free.api";
import { addDays } from "date-fns";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { usePrintReport } from "@/hooks/usePrintReport";
import { formatCurrency } from "@/utils/formatCurrency";
import { LoadingAnimation } from "@/components/LoadingAnimation";

// Client Component
export const RoyaltyFreeClient = ({ location }: { location: string }) => {
  const [data, setData] = React.useState<RoyaltyFreeItem[]>([]);
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [dateRange, setDateRange] = React.useState({
    from: new Date(),
    to: new Date(),
  });
  const [totalAmount, setTotalAmount] = React.useState(0);

  const fetchRoyaltyFreeItems = React.useCallback(async (page: number, startDate?: Date, endDate?: Date) => {
    setIsLoading(true);
    setError(null);
    try {
      const sort = sorting[0];
      const response = await getRoyaltyFreeList(location, {
        page,
        startDate: startDate || dateRange.from,
        endDate: endDate || dateRange.to,
        sort: sort?.id,
        order: sort ? (sort.desc ? 'desc' : 'asc') : undefined,
      });

      if (response.success) {
        const items = response.data.body || [];
        setData(items);
        setPagination(response.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
        
        // Calculate total amount from items if not provided by API
        const calculatedTotal = items.reduce((sum: number, item: RoyaltyFreeItem) => {
          const amount = typeof item.total === 'string' ? parseFloat(item.total) : item.total;
          return sum + (amount || 0);
        }, 0);
        setTotalAmount(response.data.meta?.totalAmount || calculatedTotal);
      } else {
        setError(response.message || "An unknown error occurred");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [location, dateRange, sorting]);

  React.useEffect(() => {
    fetchRoyaltyFreeItems(1, dateRange.from, dateRange.to);
  }, [fetchRoyaltyFreeItems, dateRange, sorting]);

  const handlePageChange = (newPage: number) => {
    fetchRoyaltyFreeItems(newPage, dateRange.from, dateRange.to);
  };
  
  const handleDateRangeChange = (newDateRange: { from: Date; to: Date }) => {
    setDateRange(newDateRange);
    fetchRoyaltyFreeItems(1, newDateRange.from, newDateRange.to);
  };

  const refetch = () => {
    fetchRoyaltyFreeItems(1, dateRange.from, dateRange.to);
  };

  const columns: ColumnDef<RoyaltyFreeItem>[] = [
    {
      accessorKey: "id",
      header: "ID",
      size: 100,
      enableSorting: false,
      meta: {
        printable: true,
        printableName: "ID",
      },
    },
    {
      accessorKey: "date",
      header: "Date",
      size: 150,
      cell: ({ row }) => {
        // Use the pre-formatted dateLabel from API
        return row.original.date || "";
      },
      enableSorting: false,
      meta: {
        printable: true,
        printableName: "Date",
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      size: 300,
      enableSorting: false,
      meta: {
        printable: true,
        printableName: "Description",
      },
    },
    {
      accessorKey: "total",
      header: "Total",
      size: 120,
      cell: ({ row }) => {
        const total = typeof row.original.total === 'string' 
          ? parseFloat(row.original.total) 
          : row.original.total;
        return <span className="text-right block">{formatCurrency(total)}</span>;
      },
      enableSorting: false,
      meta: {
        printable: true,
        printableName: "Total",
      },
    },
  ];

  // Create footer row with total amount
  const footerRow = React.useMemo(() => {
    if (data.length === 0) return undefined;
    
    return {
      id: "TOTAL",
      date: "",
      dateLabel: "",
      description: "",
      total: totalAmount,
    };
  }, [data.length, totalAmount]);

  const { handlePrint } = usePrintReport<RoyaltyFreeItem>();

   // Show loading animation
   if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation 
          size="xl" 
          text="Loading royalty free data..." 
          className="text-center"
        />
      </div>  
    );
  }

  return (
    <ReportPageLayout
      title="Royalty Free Items"
      subtitle="View royalty free items and transactions"
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
    >
      <CustomTable
        columns={columns}
        data={data}
        footerRow={footerRow}
        isLoading={isLoading}
        
        // Visual configuration
        size="compact"
        variant="default"
        
        // Features
        enablePrint={true}
        onPrint={() => handlePrint({
          reportTitle: 'Royalty Free Items Report',
          columns,
          data,
          footer: footerRow,
          location,
          dateRange,
          rightAlignedColumns: ["Total"],
        })}
        enableDateRangePicker={true}
        
        // Sorting
        manualSorting={true}
        sorting={sorting}
        onSortingChange={setSorting}

        // Server-side Pagination
        serverSidePagination={pagination}
        onServerSidePageChange={handlePageChange}
  
        // Date Range Picker
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
  
        // Disabled Features
        enableSearch={false}
        enableExport={false}
        enableFilter={false}
        enableRowsPerPage={false}
      />
    </ReportPageLayout>
  );
};
