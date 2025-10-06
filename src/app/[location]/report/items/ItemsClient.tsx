"use client";

import * as React from "react";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { getItemsList, Item } from "./items.api";
import { addDays } from "date-fns";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { usePrintReport } from "@/hooks/usePrintReport";
import { formatCurrency } from "@/utils/formatCurrency";

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

  const fetchItems = React.useCallback(async (page: number, startDate?: Date, endDate?: Date) => {
    setIsLoading(true);
    setError(null);
    try {
      const sort = sorting[0];
      const response = await getItemsList(location, {
        page,
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
    fetchItems(1, dateRange.from, dateRange.to);
  }, [fetchItems, dateRange, sorting]);

  const handlePageChange = (newPage: number) => {
    fetchItems(newPage, dateRange.from, dateRange.to);
  };
  
  const handleDateRangeChange = (newDateRange: { from: Date; to: Date }) => {
    setDateRange(newDateRange);
    fetchItems(1, newDateRange.from, newDateRange.to);
  };

  const refetch = () => {
    fetchItems(1, dateRange.from, dateRange.to);
  };

  const columns: ColumnDef<Item>[] = [
    {
      accessorKey: "dateLabel",
      header: "",
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
        return formatCurrency(amount);
      },
      enableSorting: false,
      meta: {
        printable: true,
        printableName: "Amount",
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
      itemName: "TOTAL",
      itemCode: "TOTAL",
      amount: totalAmount,
    };
  }, [data.length, totalAmount]);

  const { handlePrint } = usePrintReport<Item>();

  return (
    <ReportPageLayout
      title="Items"
      subtitle="View items and transactions"
      isLoading={isLoading}
      error={error}
      isEmpty={data.length === 0}
      onRetry={refetch}
      emptyStateProps={{
        title: "No items found",
        description: "There are no items available for the selected date range.",
      }}
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
        enableRowsPerPage={false}
      />
    </ReportPageLayout>
  );
};
