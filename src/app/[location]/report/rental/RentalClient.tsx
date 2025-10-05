"use client";

import * as React from "react";
import { CustomTable } from "@/components/CustomTable";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { RentalRow, testApiConnection, getRentalsList, getRentalStats } from "./rental.api";
import { toast } from "sonner";

interface RentalClientProps {
  location: string;
}

const columns = [
  { 
    accessorKey: "customer", 
    header: "Customer",
    cell: ({ row }: { row: { original: RentalRow } }) => {
      return row.original.customer || 'N/A';
    }
  },
  { 
    accessorKey: "student", 
    header: "Student",
    cell: ({ row }: { row: { original: RentalRow } }) => {
      return row.original.student || 'N/A';
    }
  },
  { accessorKey: "startDate", header: "Start Date" },
  { accessorKey: "returnDate", header: "Return Date" },
  { accessorKey: "rentalTerm", header: "Rental Term" },
  { 
    accessorKey: "equipmentReturned", 
    header: "Equipment Returned",
    cell: ({ row }: { row: { original: RentalRow } }) => {
      return row.original.equipmentReturned || 'N/A';
    }
  },
  {
    accessorKey: "equipmentReturnedDate",
    header: "Equipment Returned Date",
    cell: ({ row }: { row: { original: RentalRow } }) => {
      return row.original.equipmentReturned === "Yes" 
        ? (row.original.equipmentReturnedDate ?? "") 
        : "";
    }
  },
];

export function RentalClient({ location }: RentalClientProps) {
  // Direct state management instead of useRentals hook
  const [rentals, setRentals] = React.useState<RentalRow[]>([]);
  const [stats, setStats] = React.useState<{
    total: number;
    active: number;
    overdue: number;
    returned: number;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch rentals data
  const fetchRentals = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getRentalsList(location);
      
      if (response.success) {
        setRentals(response.data);
      } else {
        setError(response.message || 'Failed to fetch rentals');
        setRentals([]);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching rentals';
      setError(errorMessage);
      setRentals([]);
    } finally {
      setIsLoading(false);
    }
  }, [location]);

  // Fetch stats data
  const fetchStats = React.useCallback(async () => {
    try {
      const response = await getRentalStats(location);
      
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setStats({
          total: 0,
          active: 0,
          overdue: 0,
          returned: 0
        });
      }
    } catch {
      setStats({
        total: 0,
        active: 0,
        overdue: 0,
        returned: 0
      });
    }
  }, [location]);

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
      toast.error(`Failed to load rentals: ${error}`);
    }
  }, [error]);

  // Initial data fetch with error handling
  React.useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchRentals(), fetchStats()]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };
    loadData();
  }, [fetchRentals, fetchStats]);

  // Refetch function
  const refetch = React.useCallback(() => {
    fetchRentals();
    fetchStats();
  }, [fetchRentals, fetchStats]);

  // Clear errors function
  const clearErrors = React.useCallback(() => {
    setError(null);
  }, []);

  // Use API data only
  const rows = rentals;

  // Show loading animation
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation 
          size="xl" 
          text="Loading rental data..." 
          className="text-center"
        />
      </div>  
    );
  }

  // Show empty state if no data
  if (!isLoading && rows.length === 0 && !error) {
    return (
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl">
          {/* Rental Heading Card */}
          <div className="mb-4">
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold text-card-foreground">Rental</h1>
                {stats && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Total: {stats.total}</span>
                    <span>Active: {stats.active}</span>
                    <span>Overdue: {stats.overdue}</span>
                    <span>Returned: {stats.returned}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Empty State */}
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">No rental data found</h3>
              <p className="mt-2 text-sm text-gray-500">
                There are no rental records available for this location.
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
    <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
      <div className="mx-auto max-w-screen-2xl">
        {/* Rental Heading Card */}
        <div className="mb-4">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-card-foreground">Rental</h1>
              {stats && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Total: {stats.total}</span>
                  <span>Active: {stats.active}</span>
                  <span>Overdue: {stats.overdue}</span>
                  <span>Returned: {stats.returned}</span>
                </div>
              )}
            </div>
            {error && (
              <div className="mt-2 flex items-center justify-between rounded-md bg-red-50 p-3 text-sm text-red-700">
                <span>Failed to load rental data: {error}</span>
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
        </div>
        
        {/* CustomTable with feature flags */}
        <CustomTable
          data={rows}
          columns={columns}
          
          // Feature flags - easily configurable
          enableSearch={true}
          enableExport={true}
          enableFilter={true}
          enablePrint={true}
          enableShowAll={true}
          
          // Search configuration
          searchPlaceholder="Search rentals..."
          getSearchValue={(r) => `${r.customer} ${r.student} ${r.rentalTerm}`}
          
          // Filter configuration
          filterOptions={[
            { 
              key: 'current', 
              label: 'Active and Current', 
              predicate: (r) => {
                const due = parseDate(r.returnDate);
                if (!due || r.equipmentReturned === 'Yes') return false;
                const delta = due.getTime() - new Date().getTime();
                return delta > 7 * 24 * 60 * 60 * 1000;
              }
            },
            { 
              key: 'overdue', 
              label: 'Active and Overdue', 
              predicate: (r) => {
                const due = parseDate(r.returnDate);
                if (!due || r.equipmentReturned === 'Yes') return false;
                const delta = due.getTime() - new Date().getTime();
                return delta < 0;
              }
            },
            { 
              key: 'expiring', 
              label: 'Active and Expiring', 
              predicate: (r) => {
                const due = parseDate(r.returnDate);
                if (!due || r.equipmentReturned === 'Yes') return false;
                const delta = due.getTime() - new Date().getTime();
                return delta >= 0 && delta <= 7 * 24 * 60 * 60 * 1000;
              }
            },
            { 
              key: 'returned', 
              label: 'Returned Equipment', 
              predicate: (r) => r.equipmentReturned === 'Yes'
            },
            { 
              key: 'active', 
              label: 'Active Rentals', 
              predicate: (r) => r.equipmentReturned === 'No'
            },
          ]}
          
          // Export configuration
          onExport={{
            html: (data) => exportToHtml(data as RentalRow[]),
            csv: (data) => exportToCsv(data as RentalRow[]),
            text: (data) => exportToText(data as RentalRow[]),
            excel: (data) => exportToExcel(data as RentalRow[]),
            pdf: (data) => exportToPdf(data as RentalRow[]),
            json: (data) => exportToJson(data as RentalRow[]),
          }}
          
          // Pagination configuration
          // pageSize={10}
        />
      </div>
    </div>
  );
}

// Utility functions
const parseDate = (value?: string): Date | null => {
  if (!value || value === "-") return null;
  const normalized = value.replace(/,(?=\d)/, ", ");
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? null : d;
};

const download = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const exportToHtml = (data: RentalRow[]) => {
  const head = `<!doctype html><html><head><meta charset="utf-8"><title>Rentals</title></head><body>`;
  const tail = `</body></html>`;
  const tableRows = data.map(r => 
    `<tr><td>${r.customer}</td><td>${r.student}</td><td>${r.startDate}</td><td>${r.returnDate}</td><td>${r.rentalTerm}</td><td>${r.equipmentReturned}</td><td>${r.equipmentReturnedDate ?? ""}</td></tr>`
  ).join("");
  const html = `${head}<h3>Rentals</h3><table border="1" cellspacing="0" cellpadding="4"><thead><tr><th>Customer</th><th>Student</th><th>Start Date</th><th>Return Date</th><th>Rental Term</th><th>Equipment Returned</th><th>Equipment Returned Date</th></tr></thead><tbody>${tableRows}</tbody></table>${tail}`;
  download(new Blob([html], { type: "text/html;charset=utf-8;" }), "rentals.html");
};

const exportToCsv = (data: RentalRow[]) => {
  const headers = ["Customer", "Student", "Start Date", "Return Date", "Rental Term", "Equipment Returned", "Equipment Returned Date"];
  const lines = data.map(r => 
    [r.customer, r.student, r.startDate, r.returnDate, r.rentalTerm, r.equipmentReturned, r.equipmentReturnedDate ?? ""]
      .map(field => `"${String(field).replace(/"/g, '""')}"`)
      .join(",")
  );
  const csvContent = [headers.join(","), ...lines].join("\r\n");
  download(new Blob([csvContent], { type: "text/csv;charset=utf-8;" }), "rentals.csv");
};

const exportToText = (data: RentalRow[]) => {
  const lines = data.map(r => 
    `${r.customer}\t${r.student}\t${r.startDate}\t${r.returnDate}\t${r.rentalTerm}\t${r.equipmentReturned}\t${r.equipmentReturnedDate ?? ""}`
  );
  download(new Blob([lines.join("\r\n")], { type: "text/plain;charset=utf-8;" }), "rentals.txt");
};

const exportToExcel = (data: RentalRow[]) => {
  const headers = ["Customer", "Student", "Start Date", "Return Date", "Rental Term", "Equipment Returned", "Equipment Returned Date"];
  const lines = data.map(r => 
    [r.customer, r.student, r.startDate, r.returnDate, r.rentalTerm, r.equipmentReturned, r.equipmentReturnedDate ?? ""]
      .map(field => `"${String(field).replace(/"/g, '""')}"`)
      .join(",")
  );
  const excelContent = [headers.join(","), ...lines].join("\r\n");
  download(new Blob([excelContent], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;" }), "rentals.xlsx");
};

const exportToPdf = (data: RentalRow[]) => {
  const tableRows = data.map(r => 
    `<tr><td>${r.customer}</td><td>${r.student}</td><td>${r.startDate}</td><td>${r.returnDate}</td><td>${r.rentalTerm}</td><td>${r.equipmentReturned}</td><td>${r.equipmentReturnedDate ?? ""}</td></tr>`
  ).join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Rentals PDF</title><style>table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px;text-align:left}</style></head><body><h3>Rentals</h3><table><thead><tr><th>Customer</th><th>Student</th><th>Start Date</th><th>Return Date</th><th>Rental Term</th><th>Equipment Returned</th><th>Equipment Returned Date</th></tr></thead><tbody>${tableRows}</tbody></table><script>window.onload=()=>window.print()</script></body></html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const w = window.open(url);
  if (!w) download(blob, "rentals.html");
};

const exportToJson = (data: RentalRow[]) => {
  download(new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8;" }), "rentals.json");
};