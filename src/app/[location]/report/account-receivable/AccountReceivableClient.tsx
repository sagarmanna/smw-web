"use client";

import * as React from "react";
import { CustomTable } from "@/components/CustomTable";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { AccountReceivableRow, testApiConnection, getAccountReceivableList } from "./account-receivable.api";
import { toast } from "sonner";

interface AccountReceivableClientProps {
  location: string;
}

const columns = [
  { 
    accessorKey: "customerName", 
    header: "Customer Name",
    cell: ({ row }: { row: { original: AccountReceivableRow } }) => {
      const isFooter = row.original.id === -1;
      if (isFooter) {
        return <span className="font-bold">TOTALS</span>;
      }
      const customer = row.original.customerName || 'N/A';
      const status = row.original.status;
      if (status && status !== "Active") {
        return (
          <div>
            <span>{customer}</span>
            <span className="italic text-gray-500 ml-2">({status})</span>
          </div>
        );
      }
      return customer;
    }
  },
  { 
    accessorKey: "aging_0_30", 
    header: "0-30",
    cell: ({ row }: { row: { original: AccountReceivableRow } }) => {
      const isFooter = row.original.id === -1;
      return <span className={isFooter ? "font-bold" : ""}>{formatCurrency(row.original.aging_0_30)}</span>;
    }
  },
  { 
    accessorKey: "aging_31_60", 
    header: "31-60",
    cell: ({ row }: { row: { original: AccountReceivableRow } }) => {
      const isFooter = row.original.id === -1;
      return <span className={isFooter ? "font-bold" : ""}>{formatCurrency(row.original.aging_31_60)}</span>;
    }
  },
  { 
    accessorKey: "aging_61_90", 
    header: "61-90",
    cell: ({ row }: { row: { original: AccountReceivableRow } }) => {
      const isFooter = row.original.id === -1;
      return <span className={isFooter ? "font-bold" : ""}>{formatCurrency(row.original.aging_61_90)}</span>;
    }
  },
  { 
    accessorKey: "aging_90_plus", 
    header: "90+",
    cell: ({ row }: { row: { original: AccountReceivableRow } }) => {
      const isFooter = row.original.id === -1;
      return <span className={isFooter ? "font-bold" : ""}>{formatCurrency(row.original.aging_90_plus)}</span>;
    }
  },
  { 
    accessorKey: "total", 
    header: "Total",
    cell: ({ row }: { row: { original: AccountReceivableRow } }) => {
      const isFooter = row.original.id === -1;
      return <span className={isFooter ? "font-bold" : ""}>{formatCurrency(row.original.total)}</span>;
    }
  },
  { 
    accessorKey: "prePaidLessons", 
    header: "Pre-Paid Lessons",
    cell: ({ row }: { row: { original: AccountReceivableRow } }) => {
      const isFooter = row.original.id === -1;
      return <span className={isFooter ? "font-bold" : ""}>{formatCurrency(row.original.prePaidLessons)}</span>;
    }
  },
  { 
    accessorKey: "unusedCredits", 
    header: "Unused Credits",
    cell: ({ row }: { row: { original: AccountReceivableRow } }) => {
      const isFooter = row.original.id === -1;
      return <span className={isFooter ? "font-bold" : ""}>{formatCurrency(row.original.unusedCredits)}</span>;
    }
  },
  { 
    accessorKey: "balance", 
    header: "Balance",
    cell: ({ row }: { row: { original: AccountReceivableRow } }) => {
      const isFooter = row.original.id === -1;
      return <span className={isFooter ? "font-bold" : ""}>{formatCurrency(row.original.balance)}</span>;
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
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

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
    fetchAccountReceivable(pagination.page, pagination.limit, activeFilter);
  }, [fetchAccountReceivable, pagination.page, pagination.limit, activeFilter]);

  // Pagination handlers
  const handlePageChange = React.useCallback((page: number) => {
    fetchAccountReceivable(page, pagination.limit, activeFilter);
  }, [fetchAccountReceivable, pagination.limit, activeFilter]);

  const handlePageSizeChange = React.useCallback((limit: number) => {
    fetchAccountReceivable(1, limit, activeFilter);
  }, [fetchAccountReceivable, activeFilter]);

  // Clear errors function
  const clearErrors = React.useCallback(() => {
    setError(null);
  }, []);

  // Handle filter changes
  const handleFilterChange = React.useCallback((filterKey: string | undefined) => {
    setActiveFilter(filterKey);
    // Reset to page 1 when filter changes
    fetchAccountReceivable(1, pagination.limit, filterKey);
  }, [fetchAccountReceivable, pagination.limit]);

  // Use API data only - append footer row if available
  const rows = React.useMemo(() => {
    if (footer) {
      return [
        ...accountReceivable,
        {
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
        }
      ];
    }
    return accountReceivable;
  }, [accountReceivable, footer]);


  // Export functions with footer access
  const exportToHtml = React.useCallback((data: AccountReceivableRow[]) => {
    const head = `<!doctype html><html><head><meta charset="utf-8"><title>Accounts Receivable</title></head><body>`;
    const tail = `</body></html>`;
    // Filter out footer row (id: -1) from data
    const dataRows = data.filter(r => r.id !== -1);
    const tableRows = dataRows.map(r => 
      `<tr><td>${r.customerName}</td><td>${formatCurrency(r.aging_0_30)}</td><td>${formatCurrency(r.aging_31_60)}</td><td>${formatCurrency(r.aging_61_90)}</td><td>${formatCurrency(r.aging_90_plus)}</td><td>${formatCurrency(r.total)}</td><td>${formatCurrency(r.prePaidLessons)}</td><td>${formatCurrency(r.unusedCredits)}</td><td>${formatCurrency(r.balance)}</td></tr>`
    ).join("");
    const footerRow = footer 
      ? `<tr style="font-weight:bold;background:#f0f0f0;"><td>TOTALS</td><td>${formatCurrency(footer.aging_0_30)}</td><td>${formatCurrency(footer.aging_31_60)}</td><td>${formatCurrency(footer.aging_61_90)}</td><td>${formatCurrency(footer.aging_90_plus)}</td><td>${formatCurrency(footer.total)}</td><td>${formatCurrency(footer.prePaidLessons)}</td><td>${formatCurrency(footer.unusedCredits)}</td><td>${formatCurrency(footer.balance)}</td></tr>`
      : "";
    const html = `${head}<h3>Accounts Receivable</h3><table border="1" cellspacing="0" cellpadding="4"><thead><tr><th>Customer Name</th><th>0-30</th><th>31-60</th><th>61-90</th><th>90+</th><th>Total</th><th>Pre-Paid Lessons</th><th>Unused Credits</th><th>Balance</th></tr></thead><tbody>${tableRows}${footerRow}</tbody></table>${tail}`;
    download(new Blob([html], { type: "text/html;charset=utf-8;" }), "accounts-receivable.html");
  }, [footer]);

  const exportToCsv = React.useCallback((data: AccountReceivableRow[]) => {
    const headers = ["Customer Name", "0-30", "31-60", "61-90", "90+", "Total", "Pre-Paid Lessons", "Unused Credits", "Balance"];
    // Filter out footer row (id: -1) from data
    const dataRows = data.filter(r => r.id !== -1);
    const lines = dataRows.map(r => 
      [r.customerName, r.aging_0_30, r.aging_31_60, r.aging_61_90, r.aging_90_plus, r.total, r.prePaidLessons, r.unusedCredits, r.balance]
        .map(field => `"${String(field).replace(/"/g, '""')}"`)
        .join(",")
    );
    const footerLine = footer 
      ? ["TOTALS", footer.aging_0_30, footer.aging_31_60, footer.aging_61_90, footer.aging_90_plus, footer.total, footer.prePaidLessons, footer.unusedCredits, footer.balance]
          .map(field => `"${String(field).replace(/"/g, '""')}"`)
          .join(",")
      : "";
    const csvContent = footerLine 
      ? [headers.join(","), ...lines, footerLine].join("\r\n")
      : [headers.join(","), ...lines].join("\r\n");
    download(new Blob([csvContent], { type: "text/csv;charset=utf-8;" }), "accounts-receivable.csv");
  }, [footer]);

  const exportToText = React.useCallback((data: AccountReceivableRow[]) => {
    // Filter out footer row (id: -1) from data
    const dataRows = data.filter(r => r.id !== -1);
    const lines = dataRows.map(r => 
      `${r.customerName}\t${formatCurrency(r.aging_0_30)}\t${formatCurrency(r.aging_31_60)}\t${formatCurrency(r.aging_61_90)}\t${formatCurrency(r.aging_90_plus)}\t${formatCurrency(r.total)}\t${formatCurrency(r.prePaidLessons)}\t${formatCurrency(r.unusedCredits)}\t${formatCurrency(r.balance)}`
    );
    const footerLine = footer 
      ? `TOTALS\t${formatCurrency(footer.aging_0_30)}\t${formatCurrency(footer.aging_31_60)}\t${formatCurrency(footer.aging_61_90)}\t${formatCurrency(footer.aging_90_plus)}\t${formatCurrency(footer.total)}\t${formatCurrency(footer.prePaidLessons)}\t${formatCurrency(footer.unusedCredits)}\t${formatCurrency(footer.balance)}`
      : "";
    const content = footerLine ? [...lines, footerLine].join("\r\n") : lines.join("\r\n");
    download(new Blob([content], { type: "text/plain;charset=utf-8;" }), "accounts-receivable.txt");
  }, [footer]);

  const exportToExcel = React.useCallback((data: AccountReceivableRow[]) => {
    const headers = ["Customer Name", "0-30", "31-60", "61-90", "90+", "Total", "Pre-Paid Lessons", "Unused Credits", "Balance"];
    // Filter out footer row (id: -1) from data
    const dataRows = data.filter(r => r.id !== -1);
    const lines = dataRows.map(r => 
      [r.customerName, r.aging_0_30, r.aging_31_60, r.aging_61_90, r.aging_90_plus, r.total, r.prePaidLessons, r.unusedCredits, r.balance]
        .map(field => `"${String(field).replace(/"/g, '""')}"`)
        .join(",")
    );
    const footerLine = footer 
      ? ["TOTALS", footer.aging_0_30, footer.aging_31_60, footer.aging_61_90, footer.aging_90_plus, footer.total, footer.prePaidLessons, footer.unusedCredits, footer.balance]
          .map(field => `"${String(field).replace(/"/g, '""')}"`)
          .join(",")
      : "";
    const excelContent = footerLine 
      ? [headers.join(","), ...lines, footerLine].join("\r\n")
      : [headers.join(","), ...lines].join("\r\n");
    download(new Blob([excelContent], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;" }), "accounts-receivable.xlsx");
  }, [footer]);

  const exportToPdf = React.useCallback((data: AccountReceivableRow[]) => {
    // Filter out footer row (id: -1) from data
    const dataRows = data.filter(r => r.id !== -1);
    const tableRows = dataRows.map(r => 
      `<tr><td>${r.customerName}</td><td>${formatCurrency(r.aging_0_30)}</td><td>${formatCurrency(r.aging_31_60)}</td><td>${formatCurrency(r.aging_61_90)}</td><td>${formatCurrency(r.aging_90_plus)}</td><td>${formatCurrency(r.total)}</td><td>${formatCurrency(r.prePaidLessons)}</td><td>${formatCurrency(r.unusedCredits)}</td><td>${formatCurrency(r.balance)}</td></tr>`
    ).join("");
    const footerRow = footer 
      ? `<tr style="font-weight:bold;background:#f0f0f0;"><td>TOTALS</td><td>${formatCurrency(footer.aging_0_30)}</td><td>${formatCurrency(footer.aging_31_60)}</td><td>${formatCurrency(footer.aging_61_90)}</td><td>${formatCurrency(footer.aging_90_plus)}</td><td>${formatCurrency(footer.total)}</td><td>${formatCurrency(footer.prePaidLessons)}</td><td>${formatCurrency(footer.unusedCredits)}</td><td>${formatCurrency(footer.balance)}</td></tr>`
      : "";
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Accounts Receivable PDF</title><style>table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px;text-align:left}</style></head><body><h3>Accounts Receivable</h3><table><thead><tr><th>Customer Name</th><th>0-30</th><th>31-60</th><th>61-90</th><th>90+</th><th>Total</th><th>Pre-Paid Lessons</th><th>Unused Credits</th><th>Balance</th></tr></thead><tbody>${tableRows}${footerRow}</tbody></table><script>window.onload=()=>window.print()</script></body></html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const w = window.open(url);
    if (!w) download(blob, "accounts-receivable.html");
  }, [footer]);

  const exportToJson = React.useCallback((data: AccountReceivableRow[]) => {
    // Filter out footer row (id: -1) from data
    const dataRows = data.filter(r => r.id !== -1);
    const exportData = footer 
      ? { data: dataRows, totals: footer }
      : { data: dataRows };
    download(new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json;charset=utf-8;" }), "accounts-receivable.json");
  }, [footer]);

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

  // Show empty state if no data
  if (!isLoading && rows.length === 0 && !error) {
    return (
      <div className="w-full">
        <div className="mx-auto">
          {/* Account Receivable Heading */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Accounts Receivable</h1>
                <p className="text-muted-foreground">
                  Track outstanding balances and customer payments
                </p>
              </div>
            </div>
          </div>
          
          {/* Empty State */}
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">No account receivable data found</h3>
              <p className="mt-2 text-sm text-gray-500">
                There are no account receivable records available for this location.
              </p>
              <button
                onClick={() => refetch()}
                className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full ">
      <div className="mx-auto">
        {/* Account Receivable Heading */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Accounts Receivable</h1>
              <p className="text-muted-foreground">
                Track outstanding balances and customer payments
              </p>
            </div>
            </div>
            {error && (
            <div className="mt-4 flex items-center justify-between rounded-md bg-red-50 p-3 text-sm text-red-700">
                <span>Failed to load account receivable data: {error}</span>
                <button
                  onClick={() => {
                    clearErrors();
                    refetch();
                  }}
                  className="ml-2 rounded bg-red-100 px-2 py-1 text-xs hover:bg-red-200"
                >
                  Retry
                </button>
              </div>
            )}
        </div>

        {/* CustomTable with feature flags */}
        <CustomTable
          data={rows}
          columns={columns}
          
          // Feature flags - easily configurable
          enableSearch={false}
          enableExport={true}
          enableFilter={true} // Enable filter button
          enablePagination={false} // Disable client-side pagination
          enablePrint={true}
          enableShowAll={false} // Disable show all for server-side pagination
          
          // Search configuration
          searchPlaceholder="Search customers..."
          getSearchValue={(r) => `${r.customerName} ${r.status}`}
          
          // Server-side filter configuration
          serverSideFilterOptions={[
            { key: 'active', label: 'Active Customers' },
            { key: 'inactive', label: 'Inactive Customers' },
          ]}
          activeServerSideFilter={activeFilter}
          onServerSideFilterChange={handleFilterChange}
          
          // Export configuration
          onExport={{
            html: (data) => exportToHtml(data as AccountReceivableRow[]),
            csv: (data) => exportToCsv(data as AccountReceivableRow[]),
            text: (data) => exportToText(data as AccountReceivableRow[]),
            excel: (data) => exportToExcel(data as AccountReceivableRow[]),
            pdf: (data) => exportToPdf(data as AccountReceivableRow[]),
            json: (data) => exportToJson(data as AccountReceivableRow[]),
          }}
        />
        
        {/* Custom Server-Side Pagination */}
        <div className="flex items-center justify-between px-2 py-2 mt-4">
          <div className="flex items-center gap-4">
            <div className="text-muted-foreground text-sm">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} records
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Rows per page:</label>
              <select 
                value={pagination.limit} 
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="px-2 py-1 text-sm border rounded"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
          {pagination.totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handlePageChange(1)} 
                disabled={pagination.page === 1}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                First
              </button>
              <button 
                onClick={() => handlePageChange(pagination.page - 1)} 
                disabled={pagination.page === 1}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground px-2">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button 
                onClick={() => handlePageChange(pagination.page + 1)} 
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
              <button 
                onClick={() => handlePageChange(pagination.totalPages)} 
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Last
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Utility functions
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

const download = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
