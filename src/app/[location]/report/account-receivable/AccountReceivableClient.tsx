"use client";

import * as React from "react";
import { CustomTable } from "@/components/CustomTable";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { AccountReceivableRow, testApiConnection, getAccountReceivableList } from "./account-receivable.api";
import { toast } from "sonner";
import { formatCurrency } from "@/utils";
import { usePrintReport } from "@/hooks/usePrintReport";
import { useExportableData } from "@/hooks/useExportableData";

interface AccountReceivableClientProps {
  location: string;
}

const columns = [
  { 
    accessorKey: "customerName", 
    header: "Customer Name",
    size: 150, // Reduced width to eliminate unnecessary space
    minSize: 120,
    maxSize: 200,
    meta: {
      printable: true,
      printableName: "Customer Name",
    },
    cell: ({ row }: { row: { original: AccountReceivableRow } }) => {
      const isFooter = row.original.id === -1;
      if (isFooter) {
        return <span className="font-bold">TOTALS</span>;
      }
      const customer = row.original.customerName || 'N/A';
      const status = row.original.status;
      if (status && status !== "Active") {
        return (
          <div className="break-words">
            <span>{customer}</span>
            <span className="italic text-gray-500 ml-2">({status})</span>
          </div>
        );
      }
      return <span className="break-words">{customer}</span>;
    }
  },
  { 
    accessorKey: "aging_0_30", 
    header: "0-30",
    size: 100,
    minSize: 80,
    maxSize: 120,
    meta: {
      exportFormatter: (value: unknown) => formatCurrency(value as number),
    },
    cell: ({ row }: { row: { original: AccountReceivableRow } }) => {
      return <span className="text-right block">{formatCurrency(row.original.aging_0_30)}</span>;
    }
  },
  { 
    accessorKey: "aging_31_60", 
    header: "31-60",
    size: 100,
    minSize: 80,
    maxSize: 120,
    meta: {
      exportFormatter: (value: unknown) => formatCurrency(value as number),
    },
    cell: ({ row }: { row: { original: AccountReceivableRow } }) => {
      return <span className="text-right block">{formatCurrency(row.original.aging_31_60)}</span>;
    }
  },
  { 
    accessorKey: "aging_61_90", 
    header: "61-90",
    size: 100,
    minSize: 80,
    maxSize: 120,
    meta: {
      exportFormatter: (value: unknown) => formatCurrency(value as number),
    },
    cell: ({ row }: { row: { original: AccountReceivableRow } }) => {
      return <span className="text-right block">{formatCurrency(row.original.aging_61_90)}</span>;
    }
  },
  { 
    accessorKey: "aging_90_plus", 
    header: "90+",
    size: 100,
    minSize: 80,
    maxSize: 120,
    meta: {
      exportFormatter: (value: unknown) => formatCurrency(value as number),
    },
    cell: ({ row }: { row: { original: AccountReceivableRow } }) => {
      return <span className="text-right block">{formatCurrency(row.original.aging_90_plus)}</span>;
    }
  },
  { 
    accessorKey: "total", 
    header: "Total",
    size: 120,
    minSize: 100,
    maxSize: 150,
    meta: {
      printable: true,
      printableName: "OutStanding Invoices",
      exportFormatter: (value: unknown) => formatCurrency(value as number),
    },
    cell: ({ row }: { row: { original: AccountReceivableRow } }) => {
      return <span className="text-right block">{formatCurrency(row.original.total)}</span>;
    }
  },
  { 
    accessorKey: "prePaidLessons", 
    header: "Pre-Paid Lessons",
    size: 140,
    minSize: 120,
    maxSize: 180,
    meta: {
      printable: true,
      printableName: "Pre-Paid Lessons",
      exportFormatter: (value: unknown) => formatCurrency(value as number),
    },
    cell: ({ row }: { row: { original: AccountReceivableRow } }) => {
      return <span className="text-right block">{formatCurrency(row.original.prePaidLessons)}</span>;
    }
  },
  { 
    accessorKey: "unusedCredits", 
    header: "Unused Credits",
    size: 140,
    minSize: 120,
    maxSize: 180,
    meta: {
      printable: true,
      printableName: "Unused Credits",
      exportFormatter: (value: unknown) => formatCurrency(value as number),
    },
    cell: ({ row }: { row: { original: AccountReceivableRow } }) => {
      return <span className="text-right block">{formatCurrency(row.original.unusedCredits)}</span>;
    }
  },
  { 
    accessorKey: "balance", 
    header: "Balance",
    size: 120,
    minSize: 100,
    maxSize: 150,
    meta: {
      printable: true,
      printableName: "Balance",
      exportFormatter: (value: unknown) => formatCurrency(value as number),
    },
    cell: ({ row }: { row: { original: AccountReceivableRow } }) => {
      return <span className="text-right block">{formatCurrency(row.original.balance)}</span>;
    }
  },
];

export function AccountReceivableClient({ location }: AccountReceivableClientProps) {
  // Direct state management instead of useAccountReceivable hook
  const [accountReceivable, setAccountReceivable] = React.useState<AccountReceivableRow[]>([]);
  const [footer, setFooter] = React.useState<{
    aging_0_30: number;
    aging_31_60: number;
    aging_61_90: number;
    aging_90_plus: number;
    total: number;
    prePaidLessons: number;
    unusedCredits: number;
    balance: number;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filters] = React.useState({
    showAllActive: true,
    showAllInActive: true
  });
  const [activeFilter, setActiveFilter] = React.useState<string | undefined>(undefined);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(20);
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const { handlePrint } = usePrintReport<AccountReceivableRow>();

  // Fetch account receivable data
  const fetchAccountReceivable = React.useCallback(async (page = 1, limit = 20, filterKey?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Map filter key to API parameters
      let apiFilters = { ...filters };
      if (filterKey === 'active') {
        apiFilters = { showAllActive: true, showAllInActive: false };
      } else if (filterKey === 'inactive') {
        apiFilters = { showAllActive: false, showAllInActive: true };
      }
      
      const response = await getAccountReceivableList(location, {
        ...apiFilters,
        page,
        limit
      });
      
      if (response.success) {
        setAccountReceivable(response.data.body);
        setFooter(response.data.footer);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || 'Failed to fetch account receivable data');
        setAccountReceivable([]);
        setFooter(null);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching account receivable data';
      setError(errorMessage);
      setAccountReceivable([]);
    } finally {
      setIsLoading(false);
    }
  }, [location, filters]);


  // Test API connection on mount
  React.useEffect(() => {
    const testConnection = async () => {
      const result = await testApiConnection();
      if (!result.success) {
        toast.error(`API Connection Failed: ${result.message}`);
      }
    };
    testConnection();
  }, []);

  // Handle errors with toast notifications
  React.useEffect(() => {
    if (error) {
      toast.error(`Failed to load account receivable data: ${error}`);
    }
  }, [error]);

  // Initial data fetch with error handling
  React.useEffect(() => {
    const loadData = async () => {
      try {
        await fetchAccountReceivable(1, 20);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };
    loadData();
  }, [fetchAccountReceivable]);

  // Refetch function
  const refetch = React.useCallback(() => {
    // If showing all records, use a large number that will be adjusted by the API
    const limit = pagination.limit >= pagination.total ? 999999 : pagination.limit;
    fetchAccountReceivable(pagination.page, limit, activeFilter);
  }, [fetchAccountReceivable, pagination.page, pagination.limit, pagination.total, activeFilter]);

  // Pagination handlers
  const handlePageChange = React.useCallback((page: number) => {
    fetchAccountReceivable(page, pagination.limit, activeFilter);
  }, [fetchAccountReceivable, pagination.limit, activeFilter]);


  // Clear errors function
  const clearErrors = React.useCallback(() => {
    setError(null);
  }, []);

  // Debug logging
  React.useEffect(() => {
    console.log('AccountReceivableClient - accountReceivable length:', accountReceivable.length, 'pagination:', pagination);
  }, [accountReceivable.length, pagination]);

  // Handle filter changes
  const handleFilterChange = React.useCallback((filterKey: string | undefined) => {
    setActiveFilter(filterKey);
    // Reset to page 1 when filter changes
    // If showing all records, use a large number that will be adjusted by the API
    const limit = pagination.limit >= pagination.total ? 999999 : pagination.limit;
    fetchAccountReceivable(1, limit, filterKey);
  }, [fetchAccountReceivable, pagination.limit, pagination.total]);

  // Handle row click to open customer details
  const handleRowClick = React.useCallback((customerId: number) => {
    const legacyUrl = process.env.NEXT_PUBLIC_LEGACY_URL;
    if (legacyUrl && customerId) {
      const url = `${legacyUrl}/${location}/account-receivable-report/view?id=${customerId}`;
      window.open(url, '_blank');
    }
  }, [location]);

  // Prepare footer row data
  const footerRow = React.useMemo(() => {
    if (footer) {
      return {
        id: -1, // Special ID to identify footer row
        customerName: "TOTALS",
        status: "",
        aging_0_30: footer.aging_0_30,
        aging_31_60: footer.aging_31_60,
        aging_61_90: footer.aging_61_90,
        aging_90_plus: footer.aging_90_plus,
        total: footer.total,
        prePaidLessons: footer.prePaidLessons,
        unusedCredits: footer.unusedCredits,
        balance: footer.balance,
      };
    }
    return null;
  }, [footer]);

  const {
    exportToCsv,
    exportToPdf,
    exportToHtml,
    exportToJson,
    exportToText,
    exportToExcel,
  } = useExportableData({
    reportTitle: 'Accounts Receivable Report',
    columns,
    data: accountReceivable,
    footer: footerRow || undefined,
  });


  // Show loading animation
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation 
          size="xl" 
          text="Loading account receivable data..." 
          className="text-center"
        />
      </div>  
    );
  }

  return (
    <ReportPageLayout
      title="Accounts Receivable"
      subtitle="Track outstanding balances and customer payments"
      isLoading={isLoading}
      error={error}
      isEmpty={accountReceivable.length === 0}
      onRetry={() => {
        clearErrors();
        refetch();
      }}
      emptyStateProps={{
        title: "No account receivable data found",
        description: "There are no account receivable records available for this location.",
      }}
    >
      {/* CustomTable with feature flags */}
      <CustomTable
        data={accountReceivable}
        columns={columns}
        footerRow={footerRow || undefined}
        
        // Visual configuration
        size="compact"
        variant="default"
        
        // Row interaction
        onRowClick={(row) => handleRowClick(row.id)}
        
        // Column grouping configuration
        columnGroups={[
          {
            label: "Outstanding Invoices",
            columnKeys: ["aging_0_30", "aging_31_60", "aging_61_90", "aging_90_plus", "total"]
          }
        ]}
        
        // Feature flags - easily configurable
        enableExport={true}
        enableFilter={true}
        enablePrint={true}
        onPrint={() => handlePrint({
          reportTitle: 'Accounts Receivable Report',
          columns,
          data: accountReceivable,
          footer: footerRow || undefined,
        })}
        enableSorting={false}
        enableRowsPerPage={true}
        
        // Server-side filter configuration
        serverSideFilterOptions={[
          { key: 'active', label: 'Active Customers' },
          { key: 'inactive', label: 'Inactive Customers' },
        ]}
        activeServerSideFilter={activeFilter}
        onServerSideFilterChange={handleFilterChange}
        
        // Rows per page configuration
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 20, 50, 100]}
        onRowsPerPageChange={(newRowsPerPage) => {
          // Update parent state
          setRowsPerPage(newRowsPerPage);
          // Reset to page 1 when rows per page changes
          // If "All" is selected (-1), use a large number to fetch all records
          const actualLimit = newRowsPerPage === -1 ? 999999 : newRowsPerPage;
          fetchAccountReceivable(1, actualLimit, activeFilter);
        }}
        
        // Server-side pagination configuration
        serverSidePagination={pagination}
        onServerSidePageChange={handlePageChange}
        
        // Export configuration
        onExport={{
          html: exportToHtml,
          csv: exportToCsv,
          text: exportToText,
          excel: exportToExcel,
          pdf: exportToPdf,
          json: exportToJson,
        }}
      />
    </ReportPageLayout>
  );
}
