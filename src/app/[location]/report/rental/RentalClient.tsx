"use client";

import * as React from "react";
import { CustomTable } from "@/components/CustomTable";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { RentalRow, testApiConnection, getRentalsList, RentalFilters } from "./rental.api";
import { toast } from "sonner";
import { usePrintReport } from "@/hooks/usePrintReport";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { useExportableData } from "@/hooks/useExportableData";

interface RentalClientProps {
  location: string;
}

const columns: ColumnDef<RentalRow>[] = [
  { 
    accessorKey: "customer", 
    header: "Customer",
    size: 200,
    meta: { printable: true, printableName: "Customer" },
  },
  { 
    accessorKey: "student", 
    header: "Student",
    size: 200,
    meta: { printable: true, printableName: "Student" },
  },
  { accessorKey: "startDate", header: "Start Date", size: 150, meta: { printable: true, printableName: "Start Date" } },
  { accessorKey: "returnDate", header: "Return Date", size: 150, meta: { printable: true, printableName: "Return Date" } },
  { accessorKey: "rentalTerm", header: "Rental Term", size: 150, meta: { printable: true, printableName: "Rental Term" } },
  { 
    accessorKey: "equipmentReturned", 
    header: "Equipment Returned",
    size: 180,
    meta: { printable: true, printableName: "Equipment Returned" },
  },
  {
    accessorKey: "equipmentReturnedDate",
    header: "Equipment Returned Date",
    size: 200,
    meta: { printable: true, printableName: "Equipment Returned Date" },
    cell: ({ row }: { row: { original: RentalRow } }) => {
      return row.original.equipmentReturned === "Yes" 
        ? (row.original.equipmentReturnedDate ?? "") 
        : "";
    }
  },
];

export function RentalClient({ location }: RentalClientProps) {
  const [rentals, setRentals] = React.useState<RentalRow[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [pagination, setPagination] = React.useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [activeFilter, setActiveFilter] = React.useState<string | undefined>();
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(20);

  const { handlePrint } = usePrintReport<RentalRow>();

  const fetchRentals = React.useCallback(async (page = 1, limit = 20) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const sort = sorting[0];
      const response = await getRentalsList(location, {
        page,
        limit,
        sort: sort?.id,
        order: sort ? (sort.desc ? 'desc' : 'asc') : undefined,
        filterType: activeFilter as RentalFilters['filterType'],
      });
      
      if (response.success) {
        setRentals(response.data.body);
        setPagination(response.data.pagination);
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
  }, [location, sorting, activeFilter]);

  const handleRowsPerPageChange = React.useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    // Convert -1 (All) to 99999 for pagination limit, keep -1 only in rowsPerPage for UI
    const limitForPagination = newRowsPerPage < 0 ? 99999 : newRowsPerPage;
    setPagination(p => ({ ...p, page: 1, limit: limitForPagination }));
  }, []);

  React.useEffect(() => {
    testApiConnection().then(result => {
      if (!result.success) toast.error(`API Connection Failed: ${result.message}`);
    });
  }, []);

  React.useEffect(() => {
    if (error) {
      toast.error(`Failed to load rentals: ${error}`);
    }
  }, [error]);

  React.useEffect(() => {
    fetchRentals(pagination.page, pagination.limit);
  }, [fetchRentals, pagination.page, pagination.limit]);
  
  const refetch = React.useCallback(() => {
    fetchRentals(1, pagination.limit);
  }, [fetchRentals, pagination.limit]);

  const clearErrors = React.useCallback(() => setError(null), []);

  const handlePageChange = React.useCallback((page: number) => {
    setPagination(p => ({ ...p, page }));
  }, []);

  const handleFilterChange = React.useCallback((filterKey: string | undefined) => {
    setActiveFilter(filterKey);
    setPagination(p => ({ ...p, page: 1 }));
  }, []);

  const {
    exportToCsv,
    exportToPdf,
    exportToHtml,
    exportToJson,
    exportToText,
    exportToExcel,
  } = useExportableData({
    reportTitle: 'Rental Report',
    columns,
    data: rentals,
    rightAlignedColumns: ['Amount'],
    columnWidths: {
      'Amount': 30,
    },
    location: location,
  });

  if (isLoading && rentals.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation size="xl" text="Loading rental data..." className="text-center" />
      </div>  
    );
  }

  return (
    <ReportPageLayout
      title="Rental Report"
      subtitle="View and manage equipment rentals"
      isLoading={isLoading}
      error={error}
      onRetry={() => {
        clearErrors();
        refetch();
      }}
    >
      <CustomTable
        data={rentals}
        columns={columns}
        // searchPlaceholder="Search rentals..."
        // getSearchValue={(r) => `${r.customer} ${r.student} ${r.rentalTerm}`}
        
        // Server-side Features
        manualSorting={true}
        sorting={sorting}
        onSortingChange={setSorting}
        
        serverSidePagination={pagination}
        onServerSidePageChange={handlePageChange}
        
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 20, 50, 100]}
        onRowsPerPageChange={handleRowsPerPageChange}

        enableFilter={true}
        serverSideFilterOptions={[
          { key: 'active_current', label: 'Active and Current' },
          { key: 'active_overdue', label: 'Active and Overdue' },
          { key: 'active_expiring', label: 'Active and Expiring' },
        ]}
        activeServerSideFilter={activeFilter}
        onServerSideFilterChange={handleFilterChange}

        // Other Features
        enablePrint={true}
        onPrint={() => handlePrint({
          reportTitle: 'Rental Report',
          columns,
          data: rentals,
          location,
        })}
        enableRowsPerPage={true}
        enableExport={true}
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