"use client";

import * as React from "react";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { getItemsList, Item } from "./items.api";
import { addDays } from "date-fns";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { usePrintReport } from "@/hooks/usePrintReport";
import { formatCurrency } from "@/utils/formatCurrency";
import { LoadingAnimation } from "@/components/LoadingAnimation";

// Client Component
export const ItemsClient = ({ location }: { location: string }) => {
  const [data, setData] = React.useState<Item[]>([]);
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
    to: addDays(new Date(), 7),
  });
  const [totalAmount, setTotalAmount] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(20);

  const fetchItems = React.useCallback(async (page: number, limit: number, startDate?: Date, endDate?: Date) => {
    setIsLoading(true);
    setError(null);
    try {
      const sort = sorting[0];
      const response = await getItemsList(location, {
        page,
        limit,
        startDate: startDate || dateRange.from,
        endDate: endDate || dateRange.to,
        sort: sort?.id,
        order: sort ? (sort.desc ? 'desc' : 'asc') : undefined,
      });

      if (response.success) {
        console.log('Items data received:', response.data);
        const items = response.data.body || [];
        console.log('Sample item:', items[0]); // Log first item to see structure
        setData(items);
        setPagination(response.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
        
        // Calculate total amount from items if not provided by API
        const calculatedTotal = items.reduce((sum: number, item: Item) => {
          const amount = typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount;
          return sum + (amount || 0);
        }, 0);
        console.log('Calculated total:', calculatedTotal);
        setTotalAmount(response.data.meta?.totalAmount || calculatedTotal);
      } else {
        console.error('Items API error:', response.message);
        setError(response.message || "An unknown error occurred");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      console.error("Failed to fetch items:", err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [location, dateRange, sorting]);

  React.useEffect(() => {
    const limit = rowsPerPage === -1 ? 999999 : rowsPerPage;
    fetchItems(1, limit, dateRange.from, dateRange.to);
  }, [fetchItems, dateRange, sorting, rowsPerPage]);

  const handlePageChange = (newPage: number) => {
    const limit = rowsPerPage === -1 ? 999999 : rowsPerPage;
    fetchItems(newPage, limit, dateRange.from, dateRange.to);
  };
  
  const handleDateRangeChange = (newDateRange: { from: Date; to: Date }) => {
    setDateRange(newDateRange);
  };

  const refetch = () => {
    const limit = rowsPerPage === -1 ? 999999 : rowsPerPage;
    fetchItems(1, limit, dateRange.from, dateRange.to);
  };

  const columns: ColumnDef<Item>[] = [
    {
      accessorKey: "dateLabel",
      header: "Date",
      size: 150,
      cell: ({ row }) => {
        // Use the pre-formatted dateLabel from API
        return row.original.dateLabel || "";
      },
      enableSorting: false,
      meta: {
        printable: true,
        printableName: "Date",
      },
    },
    {
      accessorKey: "itemCode",
      header: "Item",
      size: 200,
      enableSorting: false,
      meta: {
        printable: true,
        printableName: "Item",
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      size: 120,
      cell: ({ row }) => {
        const amount = typeof row.original.amount === 'string' 
          ? parseFloat(row.original.amount) 
          : row.original.amount;
        return <span className="text-right block">{formatCurrency(amount)}</span>;
      },
      enableSorting: false,
      meta: {
        printable: true,
        printableName: "Amount",
        exportFormatter: (value: unknown) => formatCurrency(value as number),
      },
    },
  ];

  // Create footer row with total amount
  const footerRow = React.useMemo(() => {
    if (data.length === 0) return undefined;
    
    return {
      id: "-1",
      date: "",
      dateLabel: "",
      itemName: "",
      itemCode: "TOTAL",
      amount: totalAmount,
    };
  }, [data.length, totalAmount]);

  const { handlePrint } = usePrintReport<Item>();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation
          size="xl"
          text="Loading items data..."
          className="text-center"
        />
      </div>
    );
  }

  return (
    <ReportPageLayout
      title="Items"
      subtitle="View items and transactions"
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
          reportTitle: 'Items Report',
          columns,
          data,
          footer: footerRow,
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
        enableRowsPerPage={true}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(newRowsPerPage) => {
          setRowsPerPage(newRowsPerPage);
        }}
      />
    </ReportPageLayout>
  );
};
