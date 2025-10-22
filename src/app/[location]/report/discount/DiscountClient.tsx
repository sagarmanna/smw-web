"use client";

import * as React from "react";
import { format } from "date-fns";
import { CustomTable } from "@/components/CustomTable";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { getDiscounts, DiscountRow, DiscountFooter } from "./discount.api";
import { useExportableData } from "@/hooks/useExportableData";
import { usePrintReport } from "@/hooks/usePrintReport";
import { formatLocationName } from "@/utils";

interface DiscountClientProps {
  location: string;
}

// All discounts columns (detailed view)
const allDiscountsColumns = [
  {
    accessorKey: "customer",
    header: "Customer",
    size: 200,
    minSize: 180,
    maxSize: 250,
    meta: {
      printable: true,
      printableName: "Customer",
    },
    cell: ({ row }: { row: { original: DiscountRow & { isFooter?: boolean } } }) => {
      const value = row.original.customer;
      const isFooter = row.original.isFooter;
      return (
        <span className="font-semibold whitespace-normal break-words print:text-xs print:break-words">
          {isFooter ? value : (value || '-')}
        </span>
      );
    }
  },
  {
    accessorKey: "code",
    header: "Code",
    size: 80,
    minSize: 60,
    maxSize: 100,
    meta: {
      printable: true,
      printableName: "Code",
    },
    cell: ({ row }: { row: { original: DiscountRow & { isFooter?: boolean } } }) => {
      const value = row.original.code;
      const isFooter = row.original.isFooter;
      return <span className="print:text-xs">{isFooter ? value : (value || '-')}</span>;
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    size: 240,
    minSize: 120,
    maxSize: 240,
    meta: {
      printable: true,
      printableName: "Description",
    },
    cell: ({ row }: { row: { original: DiscountRow & { isFooter?: boolean } } }) => {
      const value = row.original.description;
      const isFooter = row.original.isFooter;
      return <span className="block print:text-xs">
        {isFooter ? value : (value || '-')}
      </span>;
    },
  },
  {
    accessorKey: "pf",
    header: "PF",
    size: 140,
    minSize: 100,
    maxSize: 140,
    meta: {
      printable: true,
      printableName: "PF",
    },
    cell: ({ row }: { row: { original: DiscountRow & { isFooter?: boolean } } }) => {
      const value = row.original.pf;
      const isFooter = row.original.isFooter;
      return <span className="print:text-xs print:text-right">{isFooter ? value : (value || '-')}</span>;
    },
  },
  {
    accessorKey: "qty",
    header: "Qty",
    size: 60,
    minSize: 50,
    maxSize: 70,
    meta: {
      printable: true,
      printableName: "Qty",
    },
    cell: ({ row }: { row: { original: DiscountRow & { isFooter?: boolean } } }) => {
      const value = row.original.qty;
      const isFooter = row.original.isFooter;
      return <span className="text-right block print:text-xs print:text-right">{isFooter ? value : (value || '-')}</span>;
    },
  },
  {
    accessorKey: "pfPercent",
    header: "PF(%)",
    size: 60,
    minSize: 60,
    maxSize: 70,
    meta: {
      printable: true,
      printableName: "PF(%)",
    },
    cell: ({ row }: { row: { original: DiscountRow & { isFooter?: boolean } } }) => {
      const value = row.original.pfPercent;
      const isFooter = row.original.isFooter;
      return <span className="text-right block print:text-xs print:text-right">{isFooter ? value : (value || '-')}</span>;
    },
  },
  {
    accessorKey: "enrolDollar",
    header: "Enrol($)",
    size: 80,
    minSize: 70,
    maxSize: 90,
    meta: {
      printable: true,
      printableName: "Enrol($)",
    },
    cell: ({ row }: { row: { original: DiscountRow & { isFooter?: boolean } } }) => {
      const value = row.original.enrolDollar;
      const isFooter = row.original.isFooter;
      return <span className="text-right block print:text-xs print:text-right">{isFooter ? value : (value || '-')}</span>;
    },
  },
  {
    accessorKey: "customerPercent",
    header: "Customer(%)",
    size: 90,
    minSize: 80,
    maxSize: 100,
    meta: {
      printable: true,
      printableName: "Customer(%)",
    },
    cell: ({ row }: { row: { original: DiscountRow & { isFooter?: boolean } } }) => {
      const value = row.original.customerPercent;
      const isFooter = row.original.isFooter;
      return <span className="text-right block print:text-xs print:text-right">{isFooter ? value : (value || '-')}</span>;
    },
  },
  {
    accessorKey: "itemDollar",
    header: "Item($)",
    size: 80,
    minSize: 70,
    maxSize: 90,
    meta: {
      printable: true,
      printableName: "Item($)",
    },
    cell: ({ row }: { row: { original: DiscountRow & { isFooter?: boolean } } }) => {
      const value = row.original.itemDollar;
      const isFooter = row.original.isFooter;
      return <span className="text-right block print:text-xs print:text-right">{isFooter ? value : (value || '-')}</span>;
    },
  },
  {
    accessorKey: "netDollar",
    header: "Net($)",
    size: 80,
    minSize: 70,
    maxSize: 90,
    meta: {
      printable: true,
      printableName: "Net($)",
    },
    cell: ({ row }: { row: { original: DiscountRow & { isFooter?: boolean } } }) => {
      const value = row.original.netDollar;
      const isFooter = row.original.isFooter;
      return <span className="text-right block print:text-xs print:text-right">{isFooter ? value : (value || '-')}</span>;
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    size: 80,
    minSize: 70,
    maxSize: 90,
    meta: {
      printable: true,
      printableName: "Price",
    },
    cell: ({ row }: { row: { original: DiscountRow & { isFooter?: boolean } } }) => {
      const value = row.original.price;
      const isFooter = row.original.isFooter;
      return <span className="text-right block print:text-xs print:text-right">{isFooter ? value : (value || '-')}</span>;
    },
  },
];

// Summary columns (only Customer, Code, Net($), Price)
const summaryColumns = [
  {
    accessorKey: "customer",
    header: "Customer",
    size: 300,
    minSize: 250,
    maxSize: 400,
    meta: {
      printable: true,
      printableName: "Customer",
    },
    cell: ({ row }: { row: { original: DiscountRow & { isFooter?: boolean } } }) => {
      const value = row.original.customer;
      const isFooter = row.original.isFooter;
      return (
        <span className="font-semibold whitespace-normal break-words print:text-xs print:break-words">
          {isFooter ? value : (value || '-')}
        </span>
      );
    }
  },
  {
    accessorKey: "code",
    header: "Code",
    size: 120,
    minSize: 100,
    maxSize: 150,
    meta: {
      printable: true,
      printableName: "Code",
    },
    cell: ({ row }: { row: { original: DiscountRow & { isFooter?: boolean } } }) => {
      const value = row.original.code;
      const isFooter = row.original.isFooter;
      return <span className="print:text-xs">{isFooter ? value : (value || '-')}</span>;
    },
  },
  {
    accessorKey: "netDollar",
    header: "Net($)",
    size: 120,
    minSize: 100,
    maxSize: 150,
    meta: {
      printable: true,
      printableName: "Net($)",
    },
    cell: ({ row }: { row: { original: DiscountRow & { isFooter?: boolean } } }) => {
      const value = row.original.netDollar;
      const isFooter = row.original.isFooter;
      return <span className="text-right block print:text-xs print:text-right">{isFooter ? value : (value || '-')}</span>;
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    size: 120,
    minSize: 100,
    maxSize: 150,
    meta: {
      printable: true,
      printableName: "Price",
    },
    cell: ({ row }: { row: { original: DiscountRow & { isFooter?: boolean } } }) => {
      const value = row.original.price;
      const isFooter = row.original.isFooter;
      return <span className="text-right block print:text-xs print:text-right">{isFooter ? value : (value || '-')}</span>;
    },
  },
];

export function DiscountClient({ location }: DiscountClientProps) {
  const [discounts, setDiscounts] = React.useState<DiscountRow[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [footer, setFooter] = React.useState<DiscountFooter | null>(null);
  const [meta, setMeta] = React.useState<{ startDate?: string; endDate?: string; location?: string } | null>(null);
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 0,
    total: 0,
    totalPages: 1
  });
  const [activeFilter, setActiveFilter] = React.useState<string | undefined>(undefined);

  const [range, setRange] = React.useState<{ from: Date; to: Date }>(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from, to };
  });

  // Use ref to store current range to avoid stale closure issues
  const rangeRef = React.useRef(range);
  const lastLocationRef = React.useRef<string | null>(null);
  
  React.useEffect(() => {
    rangeRef.current = range;
  }, [range]);

  const { handlePrint } = usePrintReport<DiscountRow>();

  const formatRangeParam = (d: Date) => format(d, "yyyy-MM-dd");

  const dateLabel = React.useMemo(() => {
    const from = range.from;
    const to = range.to;
    const sameDay = from.toDateString() === to.toDateString();
    if (sameDay) return format(from, "MMMM do, yyyy");
    const fromStr = format(from, "MMM do, yyyy");
    const toStr = format(to, "MMM do, yyyy");
    return `${fromStr} - ${toStr}`;
  }, [range.from, range.to]);

  // Dynamic column selection based on active filter
  const columns = React.useMemo(() => {
    return activeFilter === 'summary_only' ? summaryColumns : allDiscountsColumns;
  }, [activeFilter]);

  // Prepare footer row data
  const footerRow = React.useMemo(() => {
    if (footer) {
      if (activeFilter === 'summary_only') {
        // Summary footer - only show relevant columns
        return {
          customer: "TOTALS",
          code: "",
          description: "",
          pf: "",
          qty: "",
          pfPercent: "",
          enrolDollar: "",
          customerPercent: "",
          itemDollar: "",
          netDollar: footer.totalDiscount || "",
          price: "",
          isFooter: true,
        };
      } else {
        // All discounts footer - show all columns
        return {
          customer: "TOTALS",
          code: "",
          description: "",
          pf: "",
          qty: "",
          pfPercent: "",
          enrolDollar: "",
          customerPercent: "",
          itemDollar: "",
          netDollar: footer.totalDiscount || "",
          price: "",
          isFooter: true,
        };
      }
    }
    return null;
  }, [footer, activeFilter]);

  // Updated print handler with groupByCustomer enabled
  const handlePrintClick = React.useCallback(() => {
    const isSummary = activeFilter === 'summary_only';
    const customColumnWidths: Record<string, string> = isSummary ? {
      'Code': '15%',
      'Net($)': '15%',
      'Price': '15%'
    } : {
      'Code': '10%',
      'Description': '18%',
      'PF': '10%',
      'Qty': '6%',
      'PF(%)': '6%',
      'Enrol($)': '8%',
      'Customer(%)': '8%',
      'Item($)': '8%',
      'Net($)': '8%',
      'Price': '8%'
    };

    handlePrint({
      reportTitle: `Discount Report${isSummary ? ' - Summary' : ''}`,
      columns,
      data: discounts,
      footer: footerRow || undefined,
      location: formatLocationName(location || ""),
      dateRange: range,
      forceCompactMode: true,
      customColumnWidths,
      rightAlignedColumns: ["Qty", "PF(%)", "Enrol($)", "Customer(%)", "Item($)", "Net($)", "Price"],
      groupByCustomer: true, // THIS IS THE KEY CHANGE
    });
  }, [handlePrint, discounts, footerRow, location, range, activeFilter, columns]);

  const { exportToCsv, exportToPdf, exportToHtml, exportToJson, exportToText, exportToExcel } = useExportableData({
    reportTitle: `Discount Report${activeFilter === 'summary_only' ? ' - Summary' : ''} - ${dateLabel}`,
    columns,
    data: discounts,
  });

  // Fetch discount data - removed range dependencies to prevent double calls
  const fetchDiscounts = React.useCallback(async (dateRange?: { from: Date; to: Date }) => {
    const currentRange = dateRange || rangeRef.current;
    const startDate = formatRangeParam(currentRange.from);
    const endDate = formatRangeParam(currentRange.to);
    const summaryOnly = activeFilter === 'summary_only';
    
    try {
      setIsLoading(true);
      setError(null);
      const discountsRes = await getDiscounts(location, startDate, endDate, undefined, summaryOnly);
      
      if (discountsRes.success) {
        setDiscounts(discountsRes.data.body || []);
        setFooter(discountsRes.data.footer || null);
        setMeta(discountsRes.data.meta || null);
        setPagination({
          page: 1,
          limit: discountsRes.data.body?.length || 0,
          total: discountsRes.data.body?.length || 0,
          totalPages: 1
        });
      } else {
        setError(discountsRes.message || "Failed to fetch discounts");
        setDiscounts([]);
        setFooter(null);
        setMeta(null);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unexpected error";
      setError(msg);
      setDiscounts([]);
      setFooter(null);
      setMeta(null);
    } finally {
      setIsLoading(false);
    }
  }, [location, activeFilter]);

  // Initial data fetch - only on mount and when location changes
  React.useEffect(() => {
    // Prevent duplicate calls in React Strict Mode (same location, same render cycle)
    if (lastLocationRef.current === location) {
      return;
    }
    
    lastLocationRef.current = location;
    fetchDiscounts();
  }, [location]);

  // Refetch when filter changes
  React.useEffect(() => {
    fetchDiscounts();
  }, [activeFilter, fetchDiscounts]);

  // Refetch function
  const refetch = React.useCallback(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  // Pagination handlers (kept for CustomTable compatibility but not used)
  const handlePageChange = React.useCallback((page: number) => {
    // No pagination needed, just refetch
    fetchDiscounts();
  }, [fetchDiscounts]);

  const handleDateRangeChange = React.useCallback((newRange: { from: Date; to: Date }) => {
    setRange(newRange);
    // Call fetchDiscounts with the new range directly instead of relying on effect
    fetchDiscounts(newRange);
  }, [fetchDiscounts]);

  const handleFilterChange = React.useCallback((filterKey: string | undefined) => {
    setActiveFilter(filterKey);
    setPagination(p => ({ ...p, page: 1 }));
  }, []);

  // Clear errors function
  const clearErrors = React.useCallback(() => {
    setError(null);
  }, []);

  // Show loading animation
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation 
          size="xl" 
          text="Loading discount report..." 
          className="text-center"
        />
      </div>  
    );
  }

  return (
    <ReportPageLayout
      title="Discount Report"
      subtitle="Track discounts applied to customer transactions and analyze discount patterns"
      isLoading={isLoading}
      error={error}
      onRetry={() => {
        clearErrors();
        refetch();
      }}
    >
      <CustomTable
        data={discounts}
        columns={columns}
        footerRow={footerRow || undefined}
        
        // Visual configuration
        size="compact"
        variant="default"
        
        // Feature flags
        enableFilter={true}
        enablePrint={true}
        onPrint={handlePrintClick}
        enableSorting={false}
        enableRowsPerPage={false}
        enableDateRangePicker={true}
        dateRange={range}
        onDateRangeChange={handleDateRangeChange}
        
        // Server-side filter configuration
        serverSideFilterOptions={[
          { key: 'summary_only', label: 'Summary Only' },
        ]}
        activeServerSideFilter={activeFilter}
        onServerSideFilterChange={handleFilterChange}
        defaultFilterLabel="All Discounts"
        
        // Server-side pagination configuration
        serverSidePagination={pagination}
        onServerSidePageChange={handlePageChange}
      />
    </ReportPageLayout>
  );
}