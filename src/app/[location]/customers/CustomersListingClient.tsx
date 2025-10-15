"use client";

import * as React from "react";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { formatCurrency } from "@/utils/formatCurrency";
import { getCustomers, CustomerRow } from "./customers.api";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { useExportableData } from "@/hooks/useExportableData";
import { useRouter } from "next/navigation";
import { LoadingAnimation } from "@/components/LoadingAnimation";

interface CustomersClientProps {
  location: string;
}

export function CustomersListingClient({ location }: CustomersClientProps) {
  const router = useRouter();
  const [rows, setRows] = React.useState<CustomerRow[]>([]);
  const [total, setTotal] = React.useState<number>(0);
  const [totalPages, setTotalPages] = React.useState<number>(0);
  const [footerData, setFooterData] = React.useState<CustomerRow | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [page, setPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(20);
  const [activeFilter, setActiveFilter] = React.useState<string | undefined>(undefined);
  // Column filter state for individual column filters
  const [columnFilters, setColumnFilters] = React.useState<Record<string, unknown>>({});
  // Using client-side search via CustomTable; no separate server search state for now

  const columns = React.useMemo<ColumnDef<CustomerRow>[]>(() => [
    {
      accessorKey: "firstName",
      header: () => <span>First Name</span>,
      cell: ({ row }) => <span className="truncate block max-w-[220px]" title={row.original.firstName}>{row.original.firstName}</span>,
      enableSorting: true,
      filter: {
        type: "string"
      },
      meta: { printable: true, printableName: "First Name" },
    },
    {
      accessorKey: "lastName",
      header: () => <span>Last Name</span>,
      cell: ({ row }) => <span className="truncate block max-w-[220px]" title={row.original.lastName}>{row.original.lastName}</span>,
      enableSorting: true,
      filter: {
        type: "string"
      },
      meta: { printable: true, printableName: "Last Name" },
    },
    {
      accessorKey: "email",
      header: () => <span>Email</span>,
      cell: ({ row }) => <span className="truncate block max-w-[260px]" title={row.original.email}>{row.original.email}</span>,
      enableSorting: true,
      filter: {
        type: "string"
      },
      meta: { printable: true, printableName: "Email" },
    },
    {
      accessorKey: "students",
      header: () => <span>Students</span>,
      cell: ({ row }) => <span className="truncate block max-w-[260px]" title={row.original.students}>{row.original.students}</span>,
      enableSorting: false,
      filter: {
        type: "string"
      },
      meta: { printable: true, printableName: "Students" },
    },
    {
      accessorKey: "balance",
      header: () => <span className="text-right">Balance</span>,
      cell: ({ row }) => <span className="tabular-nums text-right block">{row.original.balance}</span>,
      enableSorting: false,
      filter: {
        type: "dropdown",
        options: [
          { value: "all", label: "All" },
          { value: "owing", label: "Owing" },
          { value: "credit", label: "Credit" }
        ]
      },
      meta: { printable: true, printableName: "Balance", exportFormatter: (v: unknown) => String(v ?? '') },
    },
  ], []);

  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const sortBy = sorting[0]?.id as 'firstName' | 'lastName' | 'email' | undefined;
      const sortDir = sorting[0]?.desc ? "desc" : "asc";
      
      // Map active filter to API parameters
      const showActive = activeFilter === 'active' ? true : activeFilter === 'inactive' ? false : undefined;
      const showInActive = activeFilter === 'inactive' ? true : activeFilter === 'active' ? false : undefined;
      
      // Map column filters to API parameters
      const firstName = columnFilters.firstName as string | undefined;
      const lastName = columnFilters.lastName as string | undefined;
      const email = columnFilters.email as string | undefined;
      const student = columnFilters.students as string | undefined;
      const balance = columnFilters.balance as 'all' | 'owing' | 'credit' | undefined;
      
      const response = await getCustomers(location, {
        page,
        limit: pageSize,
        sort: sortBy,
        order: sortDir,
        showActive,
        showInActive,
        firstName,
        lastName,
        email,
        student,
        balance,
      });
      if (response?.success) {
        setRows(response.data.body);
        setTotal(response.data.pagination.total);
        setTotalPages(response.data.pagination.totalPages);
        // Convert footer data to CustomerRow format
        setFooterData({
          id: 0,
          isActive: false,
          firstName: response.data.footer.firstName,
          lastName: response.data.footer.lastName,
          email: response.data.footer.email,
          students: response.data.footer.students,
          balance: response.data.footer?.totalBalance || response.data.footer.balance,
        });
      } else {
        setError(response?.message || "Failed to load customers");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load customers");
    } finally {
      setIsLoading(false);
    }
  }, [location, page, pageSize, sorting, activeFilter]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle column filter changes
  const handleColumnFilterChange = React.useCallback(async (columnKey: string, filterValue: unknown) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnKey]: filterValue
    }));
    
    // Don't trigger API immediately for text inputs - wait for Enter key
    // Only trigger immediately for dropdown filters (balance) or when clearing filters
    if (columnKey === 'balance' || filterValue === null) {
      setPage(1);
      
      // Manually trigger API call for balance dropdown or when clearing filters
      try {
        setIsLoading(true);
        setError(null);
        const sortBy = sorting[0]?.id as 'firstName' | 'lastName' | 'email' | undefined;
        const sortDir = sorting[0]?.desc ? "desc" : "asc";
        
        // Map active filter to API parameters
        const showActive = activeFilter === 'active' ? true : activeFilter === 'inactive' ? false : undefined;
        const showInActive = activeFilter === 'inactive' ? true : activeFilter === 'active' ? false : undefined;
        
        // Map column filters to API parameters (use the new filterValue for the changed column)
        const firstName = columnKey === 'firstName' ? (filterValue as string | undefined) : (columnFilters.firstName as string | undefined);
        const lastName = columnKey === 'lastName' ? (filterValue as string | undefined) : (columnFilters.lastName as string | undefined);
        const email = columnKey === 'email' ? (filterValue as string | undefined) : (columnFilters.email as string | undefined);
        const student = columnKey === 'students' ? (filterValue as string | undefined) : (columnFilters.students as string | undefined);
        const balance = columnKey === 'balance' ? (filterValue as 'all' | 'owing' | 'credit' | undefined) : (columnFilters.balance as 'all' | 'owing' | 'credit' | undefined);
        
        const response = await getCustomers(location, {
          page: 1, // Reset to first page
          limit: pageSize,
          sort: sortBy,
          order: sortDir,
          showActive,
          showInActive,
          firstName,
          lastName,
          email,
          student,
          balance,
        });
        if (response?.success) {
          setRows(response.data.body);
          setTotal(response.data.pagination.total);
          setTotalPages(response.data.pagination.totalPages);
          // Convert footer data to CustomerRow format
          setFooterData({
            id: 0,
            isActive: false,
            firstName: response.data.footer.firstName,
            lastName: response.data.footer.lastName,
            email: response.data.footer.email,
            students: response.data.footer.students,
            balance: response.data.footer.balance,
          });
        } else {
          setError(response?.message || "Failed to load customers");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load customers");
      } finally {
        setIsLoading(false);
      }
    }
  }, [location, pageSize, sorting, activeFilter, columnFilters]);

  // Handle Enter key press in text filters to trigger API
  const handleColumnFilterEnter = React.useCallback(async (columnKey: string) => {
    // Trigger API call when Enter is pressed in text inputs
    setPage(1);
    
    // Manually trigger API call with current column filters
    try {
      setIsLoading(true);
      setError(null);
      const sortBy = sorting[0]?.id as 'firstName' | 'lastName' | 'email' | undefined;
      const sortDir = sorting[0]?.desc ? "desc" : "asc";
      
      // Map active filter to API parameters
      const showActive = activeFilter === 'active' ? true : activeFilter === 'inactive' ? false : undefined;
      const showInActive = activeFilter === 'inactive' ? true : activeFilter === 'active' ? false : undefined;
      
      // Map column filters to API parameters
      const firstName = columnFilters.firstName as string | undefined;
      const lastName = columnFilters.lastName as string | undefined;
      const email = columnFilters.email as string | undefined;
      const student = columnFilters.students as string | undefined;
      const balance = columnFilters.balance as 'all' | 'owing' | 'credit' | undefined;
      
      const response = await getCustomers(location, {
        page: 1, // Reset to first page
        limit: pageSize,
        sort: sortBy,
        order: sortDir,
        showActive,
        showInActive,
        firstName,
        lastName,
        email,
        student,
        balance,
      });
      if (response?.success) {
        setRows(response.data.body);
        setTotal(response.data.pagination.total);
        setTotalPages(response.data.pagination.totalPages);
        // Convert footer data to CustomerRow format
        setFooterData({
          id: 0,
          isActive: false,
          firstName: response.data.footer.firstName,
          lastName: response.data.footer.lastName,
          email: response.data.footer.email,
          students: response.data.footer.students,
          balance: response.data.footer.balance,
        });
      } else {
        setError(response?.message || "Failed to load customers");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load customers");
    } finally {
      setIsLoading(false);
    }
  }, [location, pageSize, sorting, activeFilter, columnFilters]);

  const footerRow = React.useMemo(() => {
    // Use the footer data from API response if available, otherwise use default
    return footerData || {
      id: 0,
      isActive: false,
      firstName: "",
      lastName: "",
      email: "",
      students: "Total:",
      balance: "$0.00",
    };
  }, [footerData]);

  const { exportToCsv, exportToPdf, exportToHtml, exportToJson, exportToText, exportToExcel } = useExportableData<CustomerRow>({
    reportTitle: "Customers",
    columns,
    data: rows,
    footer: footerRow,
  });

    // Show full-page loading animation while fetching data
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[600px]">
          <LoadingAnimation 
            size="xl" 
            text="Loading customers data..." 
            className="text-center"
          />
        </div>  
      );
    }

  if (error) {
    return (
      <ReportPageLayout
        title="Customers"
        subtitle="Browse all customers, search and sort"
        isLoading={isLoading}
        error={error}
        onRetry={fetchData}
      >
        <div />
      </ReportPageLayout>
    );
  }

  return (
    <ReportPageLayout
      title="Customers"
      subtitle="Browse all customers, search and sort"
      isLoading={isLoading}
      error={null}
      onRetry={fetchData}
    >
      <CustomTable
        data={rows}
        columns={columns}
        footerRow={footerRow}

        // Visual configuration
        size="compact"
        variant="default"
        stickyHeader={true}

        // Features
        enableSearch={false}
        searchPlaceholder="Search customers..."
        getSearchValue={(r) => `${r.firstName} ${r.lastName} ${r.email} ${r.students}`}
        enableFilter={true}
        serverSideFilterOptions={[
          { key: "active", label: "Active" },
          { key: "inactive", label: "Inactive" },
        ]}
        activeServerSideFilter={activeFilter}
        onServerSideFilterChange={(key) => { setActiveFilter(key); setPage(1); }}
        enableRowsPerPage={true}
        enablePrint={false}
        enableColumnFilters={true}
        onColumnFilterChange={handleColumnFilterChange}
        onColumnFilterEnter={handleColumnFilterEnter}
        columnFilters={columnFilters}

        // Sorting and pagination (server-side)
        manualSorting={true}
        sorting={sorting}
        onSortingChange={(s) => { setSorting(s); setPage(1); }}
        serverSidePagination={{ page, limit: pageSize, total, totalPages }}
        onServerSidePageChange={(newPage) => setPage(newPage)}
        rowsPerPage={pageSize}
        rowsPerPageOptions={[10, 20, 50, 100]}
        enableExport={true}
        onExport={{
          html: exportToHtml,
          csv: exportToCsv,
          text: exportToText,
          excel: exportToExcel,
          pdf: exportToPdf,
          json: exportToJson,
        }}
        onRowsPerPageChange={(newSize) => { setPageSize(newSize); setPage(1); }}
        onRowClick={(row) => {
          // Navigate once per click: push with explicit query param key to avoid parsing quirks
          router.push(`customers/${row.id}`);
        }}
        rowClassName="cursor-pointer"
      />
    </ReportPageLayout>
  );
}


