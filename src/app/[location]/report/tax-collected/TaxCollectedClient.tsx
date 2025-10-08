"use client";

import * as React from "react";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { getTaxCollectedList, TaxCollectedItem } from "./tax-collected.api";

import { ReportPageLayout } from "@/components/ReportPageLayout";
import { usePrintReport } from "@/hooks/usePrintReport";
import { formatCurrency } from "@/utils/formatCurrency";

// Client Component
export const TaxCollectedClient = ({ location }: { location: string }) => {
  const [data, setData] = React.useState<TaxCollectedItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [dateRange, setDateRange] = React.useState(() => {
    // Try to get date range from localStorage on initial load
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tax-collected-date-range');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            from: new Date(parsed.from),
            to: new Date(parsed.to),
          };
        } catch (error) {
          console.log('Failed to parse saved date range:', error);
        }
      }
    }
    return {
      from: new Date(),
      to: new Date(),
    };
  });
  const [totals, setTotals] = React.useState({
    subtotal: 0,
    tax: 0,
    total: 0,
  });
  const [activeFilter, setActiveFilter] = React.useState<string | undefined>(undefined);

  // Use ref to store current date range to avoid stale closures
  const dateRangeRef = React.useRef(dateRange);
  dateRangeRef.current = dateRange;

  const fetchTaxCollectedItems = React.useCallback(async (startDate: Date, endDate: Date) => {
    setIsLoading(true);
    setError(null);
    try {
      const sort = sorting[0];

      const response = await getTaxCollectedList(location, {
        startDate,
        endDate,
        sort: sort?.id,
        order: sort ? (sort.desc ? 'desc' : 'asc') : undefined,
      });

      if (response.success) {
        const items = response.data.body || [];
        setData(items);
        
        // Set totals from API response
        setTotals({
          subtotal: response.data.meta?.totalSubtotal || 0,
          tax: response.data.meta?.totalTax || 0,
          total: response.data.meta?.totalAmount || 0,
        });
      } else {
        setError(response.message || "An unknown error occurred");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [location, sorting]);

  // Effect for initial load and location/sorting changes - preserves date range
  React.useEffect(() => {
    console.log('Location/sorting changed, using date range:', {
      from: dateRangeRef.current.from.toISOString().split('T')[0],
      to: dateRangeRef.current.to.toISOString().split('T')[0],
      location
    });
    fetchTaxCollectedItems(dateRangeRef.current.from, dateRangeRef.current.to);
  }, [location, sorting, fetchTaxCollectedItems]);
  
  const handleDateRangeChange = (newDateRange: { from: Date; to: Date }) => {
    console.log('Date range changed to:', {
      from: newDateRange.from.toISOString().split('T')[0],
      to: newDateRange.to.toISOString().split('T')[0],
      location
    });
    
    // Save to localStorage for persistence across location changes
    if (typeof window !== 'undefined') {
      localStorage.setItem('tax-collected-date-range', JSON.stringify({
        from: newDateRange.from.toISOString(),
        to: newDateRange.to.toISOString(),
      }));
    }
    
    setDateRange(newDateRange);
    fetchTaxCollectedItems(newDateRange.from, newDateRange.to);
  };

  const handleFilterChange = (filterKey: string | undefined) => {
    setActiveFilter(filterKey);
  };

  const refetch = () => {
    fetchTaxCollectedItems(dateRange.from, dateRange.to);
  };

  // Group data by date for display
  const groupedData = React.useMemo(() => {
    const grouped: { [key: string]: TaxCollectedItem[] } = {};
    data.forEach(item => {
      const dateKey = item.dateLabel || item.date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    });
    return grouped;
  }, [data]);

  // Create display data with date headers and grouped items
  const displayData = React.useMemo(() => {
    const result: (TaxCollectedItem & { isDateHeader?: boolean; isDateTotal?: boolean })[] = [];
    Object.entries(groupedData).forEach(([dateLabel, items]) => {
      // Calculate totals for this date group
      const groupTotals = items.reduce(
        (totals, item) => ({
          subtotal: totals.subtotal + (item.subtotal || 0),
          tax: totals.tax + (item.tax || 0),
          total: totals.total + (item.total || 0),
        }),
        { subtotal: 0, tax: 0, total: 0 }
      );

      // Add date header row (spans full width)
      result.push({
        isDateHeader: true,
        isDateTotal: false,
        dateLabel,
        subtotal: 0,
        tax: 0,
        total: 0,
        sourceId: '',
        customer: '',
        date: '',
      });

      // Add individual transaction rows
      items.forEach(item => {
        result.push({
          ...item,
          isDateHeader: false,
          isDateTotal: false,
        });
      });

      // Add date total row
      result.push({
        isDateHeader: false,
        isDateTotal: true,
        dateLabel: '',
        subtotal: groupTotals.subtotal,
        tax: groupTotals.tax,
        total: groupTotals.total,
        sourceId: '',
        customer: '',
        date: '',
      });
    });
    return result;
  }, [groupedData]);

  const columns: ColumnDef<TaxCollectedItem & { isDateHeader?: boolean; isDateTotal?: boolean }, unknown>[] = React.useMemo(() => {
    const allColumns = [
    {
      accessorKey: "sourceId",
      header: "Source ID",
      size: 150,
      enableSorting: false,
      cell: ({ row }: { row: { original: TaxCollectedItem & { isDateHeader?: boolean; isDateTotal?: boolean } } }) => {
        if (row.original.isDateHeader) {
          return (
            <div className="date-header-cell font-bold text-foreground text-start">
              {row.original.dateLabel}
            </div>
          );
        }
        if (row.original.isDateTotal) {
          return null; // Date total row - handled in respective columns
        }
        // For summary rows, show the date label in the first column
        if (activeFilter === 'summary_only') {
          return (
            <div className="font-bold text-start">
              {row.original.dateLabel}
            </div>
          );
        }
        return (
          <div className={`text-start ${activeFilter === 'summary_only' ? 'text-muted-foreground' : ''}`}>
            {row.original.sourceId}
          </div>
        );
      },
      meta: {
        printable: true,
        printableName: "Source ID",
      },
    },
    {
      accessorKey: "customer",
      header: "Customer",
      size: 200,
      enableSorting: false,
      meta: {
        printable: true,
        printableName: "Customer",
      },
      cell: ({ row }: { row: { original: TaxCollectedItem & { isDateHeader?: boolean; isDateTotal?: boolean } } }) => {
        if (row.original.isDateHeader) {
          return null; // Date header spans both Source ID and Customer columns
        }
        if (row.original.isDateTotal) {
          return null; // Date total row - handled in respective columns
        }
        // Check if this is a footer row
        const isFooterRow = 'isFooterRow' in row.original && (row.original as { isFooterRow?: boolean }).isFooterRow;
        
        // For summary rows, hide the customer column
        if (activeFilter === 'summary_only') {
          return null;
        }
        
        return (
          <div className={`text-start ${isFooterRow ? 'font-bold' : ''} ${activeFilter === 'summary_only' ? 'text-muted-foreground' : ''}`}>
            {row.original.customer}
          </div>
        );
      },
    },
    {
      accessorKey: "subtotal",
      header: "Subtotal",
      size: 120,
      cell: ({ row }: { row: { original: TaxCollectedItem & { isDateHeader?: boolean; isDateTotal?: boolean } } }) => {
        if (row.original.isDateHeader) {
          return null; // Date header is handled in the first column
        }
        if (row.original.isDateTotal) {
          return (
            <div className={`font-bold rounded text-end ${
              activeFilter === 'summary_only' 
                ? 'text-muted-foreground bg-muted/10 px-2 py-1' 
                : 'text-foreground bg-muted/20 px-2 py-1'
            }`}>
              {formatCurrency(row.original.subtotal)}
            </div>
          );
        }
        // Check if this is a footer row
        const isFooterRow = 'isFooterRow' in row.original && (row.original as { isFooterRow?: boolean }).isFooterRow;
        
        // For summary rows, show values with bold font weight
        if (activeFilter === 'summary_only') {
          return (
            <div className="font-bold text-end">
              {formatCurrency(row.original.subtotal)}
            </div>
          );
        }
        
        return (
          <div className={`text-end ${isFooterRow ? 'font-bold ' : ''} ${activeFilter === 'summary_only' && !isFooterRow ? 'font-bold' : ''}`}>
            {formatCurrency(row.original.subtotal)}
          </div>
        );
      },
      enableSorting: false,
      meta: {
        printable: true,
        printableName: "Subtotal",
        exportFormatter: (value: unknown) => formatCurrency(value as number),
      },
    },
    {
      accessorKey: "tax",
      header: "Tax",
      size: 120,
      cell: ({ row }: { row: { original: TaxCollectedItem & { isDateHeader?: boolean; isDateTotal?: boolean } } }) => {
        if (row.original.isDateHeader) {
          return null; // Date header is handled in the first column
        }
        if (row.original.isDateTotal) {
          return (
            <div className={`font-bold rounded text-end ${
              activeFilter === 'summary_only' 
                ? 'text-muted-foreground bg-muted/10 px-2 py-1' 
                : 'text-foreground bg-muted/20 px-2 py-1'
            }`}>
              {formatCurrency(row.original.tax)}
            </div>
          );
        }
        // Check if this is a footer row
        const isFooterRow = 'isFooterRow' in row.original && (row.original as { isFooterRow?: boolean }).isFooterRow;
        
        // For summary rows, show values with bold font weight
        if (activeFilter === 'summary_only') {
          return (
            <div className="font-bold text-end">
              {formatCurrency(row.original.tax)}
            </div>
          );
        }
        
        return (
          <div className={`text-end ${isFooterRow ? 'font-bold text-foreground' : ''} ${activeFilter === 'summary_only' && !isFooterRow ? 'text-muted-foreground' : ''}`}>
            {formatCurrency(row.original.tax)}
          </div>
        );
      },
      enableSorting: false,
      meta: {
        printable: true,
        printableName: "Tax",
        exportFormatter: (value: unknown) => formatCurrency(value as number),
      },
    },
    {
      accessorKey: "total",
      header: "Total",
      size: 120,
      cell: ({ row }: { row: { original: TaxCollectedItem & { isDateHeader?: boolean; isDateTotal?: boolean } } }) => {
        if (row.original.isDateHeader) {
          return null; // Date header is handled in the first column
        }
        if (row.original.isDateTotal) {
          return (
            <div className={`font-bold rounded text-end ${
              activeFilter === 'summary_only' 
                ? 'text-muted-foreground bg-muted/10 px-2 py-1' 
                : 'text-foreground bg-muted/20 px-2 py-1'
            }`}>
              {formatCurrency(row.original.total)}
            </div>
          );
        }
        // Check if this is a footer row
        const isFooterRow = 'isFooterRow' in row.original && (row.original as { isFooterRow?: boolean }).isFooterRow;
        
        // For summary rows, show values with bold font weight
        if (activeFilter === 'summary_only') {
          return (
            <div className="font-bold text-end">
              {formatCurrency(row.original.total)}
            </div>
          );
        }
        
        return (
          <div className={`text-end ${isFooterRow ? 'font-bold  text-foreground' : ''} ${activeFilter === 'summary_only' && !isFooterRow ? 'text-muted-foreground' : ''}`}>
            {formatCurrency(row.original.total)}
          </div>
        );
      },
      enableSorting: false,
      meta: {
        printable: true,
        printableName: "Total",
        exportFormatter: (value: unknown) => formatCurrency(value as number),
      },
    },
  ];

    // Filter out Customer column when in summary mode
    if (activeFilter === 'summary_only') {
      return allColumns.filter(col => col.accessorKey !== 'customer');
    }
    
    return allColumns;
  }, [activeFilter]);

  // Process data based on filter setting
  const processedDisplayData = React.useMemo(() => {
    if (activeFilter !== 'summary_only') {
      return displayData;
    }
    
    // If summary only is enabled, create combined rows with all values
    const summaryData: (TaxCollectedItem & { isDateHeader?: boolean; isDateTotal?: boolean })[] = [];
    
    Object.entries(groupedData).forEach(([dateLabel, items]) => {
      // Calculate totals for this date group
      const groupTotals = items.reduce(
        (totals, item) => ({
          subtotal: totals.subtotal + (item.subtotal || 0),
          tax: totals.tax + (item.tax || 0),
          total: totals.total + (item.total || 0),
        }),
        { subtotal: 0, tax: 0, total: 0 }
      );

      // Create a single summary row with all values
      summaryData.push({
        isDateHeader: false,
        isDateTotal: false,
        dateLabel,
        subtotal: groupTotals.subtotal,
        tax: groupTotals.tax,
        total: groupTotals.total,
        sourceId: dateLabel, // Use date as the identifier
        customer: '', // Empty for summary rows
        date: '',
      });
    });
    
    return summaryData;
  }, [displayData, activeFilter, groupedData]);

  // Create footer row with totals
  const footerRow = React.useMemo(() => {
    if (data.length === 0) return undefined;
    
    return {
      sourceId: "",
      customer: "TOTAL",
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      date: "",
      dateLabel: "",
      isFooterRow: true, // Add identifier for footer row
    };
  }, [data.length, totals]);

  const { handlePrint } = usePrintReport<TaxCollectedItem>();

  return (
    <>
      <style jsx>{`
        .date-header-cell {
          position: relative;
          grid-column: 1 / 3;
        }
        .date-header-cell::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100%;
          background-color: var(--muted);
          z-index: -1;
        }
        /* Table header alignment */
        table th:nth-child(1),
        table th:nth-child(2) {
          text-align: left;
        }
        table th:nth-child(3),
        table th:nth-child(4),
        table th:nth-child(5) {
          text-align: right;
        }
      `}</style>
    <ReportPageLayout
      title="Tax Collected"
      subtitle="View tax collected transactions and details"
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
    >
       <CustomTable
         columns={columns}
         data={processedDisplayData}
         footerRow={footerRow}
        isLoading={isLoading}
        
        // Visual configuration
        size="compact"
        variant="default"
        
        // Features
        enablePrint={true}
        onPrint={() => handlePrint({
          reportTitle: 'Tax Collected Report',
          columns,
          data: processedDisplayData,
          footer: footerRow,
        })}
        enableDateRangePicker={true}
        
        // Sorting
        manualSorting={true}
        sorting={sorting}
        onSortingChange={setSorting}
  
        // Date Range Picker
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}

        // Filter configuration
        enableFilter={true}
        serverSideFilterOptions={[
          { key: 'summary_only', label: 'Summary Only' },
        ]}
        activeServerSideFilter={activeFilter}
        onServerSideFilterChange={handleFilterChange}
        defaultFilterLabel="All Transactions"
  
        // Disabled Features
        enableSearch={false}
        enableExport={false}
        enableRowsPerPage={false}
      />
    </ReportPageLayout>
    </>
  );
};
