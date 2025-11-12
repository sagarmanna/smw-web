
"use client"

import * as React from "react";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { getCustomers, CustomerRow } from "./customers.api";

type SortingState = Array<{ id: string; desc: boolean }>;

// Type for export data with dynamic email columns
interface ExportCustomerRow extends Omit<CustomerRow, 'allEmails'> {
  [key: string]: unknown;
}
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { useExportableData } from "@/hooks/useExportableData";
import { useRouter } from "next/navigation";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { usePrintReport } from "@/hooks/usePrintReport";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddCustomerModal } from "./components/AddCustomerModal";
import { isDev } from "@/utils/env";

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
  const [activeFilter, setActiveFilter] = React.useState<string | undefined>("active");
  // Column filter state for individual column filters
  const [columnFilters, setColumnFilters] = React.useState<Record<string, unknown>>({});
  // Modal state
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = React.useState(false);
  // Using client-side search via CustomTable; no separate server search state for now

  // Helper function to get all unique email columns needed for export/print
  const getEmailColumns = React.useCallback((data: CustomerRow[]): ColumnDef<ExportCustomerRow>[] => {
    const maxEmailCount = Math.max(...data.map(row => 
      row.allEmails ? row.allEmails.split(',').length : 0
    ));
    
    // Create email columns for export/print (up to the maximum number of emails found)
    return Array.from({ length: maxEmailCount }, (_, index) => ({
      accessorKey: `email${index + 1}`,
      header: () => <span>Email {index + 1}</span>,
      cell: ({ row }: { row: { original: ExportCustomerRow } }) => {
        const emailValue = row.original[`email${index + 1}`] as string;
        return <span className="truncate block max-w-[260px]" title={emailValue || ''}>{emailValue || ''}</span>;
      },
      enableSorting: false,
      filter: {
        type: "string"
      },
      meta: { 
        printable: true, 
        printableName: `Email ${index + 1}`,
        exportFormatter: (v: unknown) => String(v ?? '')
      },
    }));
  }, []);

  // Helper function to transform data for export/print with separate email columns
  const transformDataForExport = React.useCallback((data: CustomerRow[]): ExportCustomerRow[] => {
    return data.map(row => {
      const emails = row.allEmails ? row.allEmails.split(',').map(email => email.trim()) : [];
      const transformedRow: ExportCustomerRow = {
        id: row.id,
        isActive: row.isActive,
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        students: row.students,
        balance: row.balance,
      };
      
      // Add separate email columns
      emails.forEach((email, index) => {
        transformedRow[`email${index + 1}`] = email;
      });
      
      return transformedRow;
    });
  }, []);

  const columns = React.useMemo<ColumnDef<CustomerRow>[]>(() => [
    {
      accessorKey: "firstName",
      header: () => <span>First Name</span>,
      cell: ({ row }) => <span className="" title={row.original.firstName}>{row.original.firstName}</span>,
      enableSorting: true,
      filter: {
        type: "string"
      },
      meta: { printable: true, printableName: "First Name" },
    },
    {
      accessorKey: "lastName",
      header: () => <span>Last Name</span>,
      cell: ({ row }) => <span className="" title={row.original.lastName}>{row.original.lastName}</span>,
      enableSorting: true,
      filter: {
        type: "string"
      },
      meta: { printable: true, printableName: "Last Name" },
    },
    {
      accessorKey: "allEmails",
      header: () => <span>Email</span>,
      cell: ({ row }) => <span className="truncate block max-w-[260px]" title={row.original.email}>{row.original.email}</span>,
      enableSorting: false,
      filter: {
        type: "string"
      },
      meta: { 
        printable: true, 
        printableName: "Email"
      },
    },
    {
      accessorKey: "students",
      header: () => <span>Students</span>,
      cell: ({ row }) => <span className="" title={row.original.students}>{row.original.students}</span>,
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
      const sortByRaw = sorting[0]?.id as 'firstName' | 'lastName' | 'allEmails' | undefined;
      const sortBy = sortByRaw === 'allEmails' ? 'email' : sortByRaw;
      const sortDir = sorting[0]?.desc ? "desc" : "asc";
      
      // Map active filter to API parameters
      const showActive = activeFilter === 'active' ? true : activeFilter === 'inactive' ? false : undefined;
      const showInActive = activeFilter === 'inactive' ? true : activeFilter === 'active' ? false : undefined;
      
      // Map column filters to API parameters
      const firstName = columnFilters.firstName as string | undefined;
      const lastName = columnFilters.lastName as string | undefined;
      const email = columnFilters.allEmails as string | undefined;
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
          allEmails: response.data.footer.email, // Use email for footer as it's just a summary
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
        const sortByRaw = sorting[0]?.id as 'firstName' | 'lastName' | 'allEmails' | undefined;
        const sortBy = sortByRaw === 'allEmails' ? 'email' : sortByRaw;
        const sortDir = sorting[0]?.desc ? "desc" : "asc";
        
        // Map active filter to API parameters
        const showActive = activeFilter === 'active' ? true : activeFilter === 'inactive' ? false : undefined;
        const showInActive = activeFilter === 'inactive' ? true : activeFilter === 'active' ? false : undefined;
        
        // Map column filters to API parameters (use the new filterValue for the changed column)
        const firstName = columnKey === 'firstName' ? (filterValue as string | undefined) : (columnFilters.firstName as string | undefined);
        const lastName = columnKey === 'lastName' ? (filterValue as string | undefined) : (columnFilters.lastName as string | undefined);
        const email = columnKey === 'allEmails' ? (filterValue as string | undefined) : (columnFilters.allEmails as string | undefined);
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
            allEmails: response.data.footer.email, // Use email for footer as it's just a summary
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
      const sortByRaw = sorting[0]?.id as 'firstName' | 'lastName' | 'allEmails' | undefined;
      const sortBy = sortByRaw === 'allEmails' ? 'email' : sortByRaw;
      const sortDir = sorting[0]?.desc ? "desc" : "asc";
      
      // Map active filter to API parameters
      const showActive = activeFilter === 'active' ? true : activeFilter === 'inactive' ? false : undefined;
      const showInActive = activeFilter === 'inactive' ? true : activeFilter === 'active' ? false : undefined;
      
      // Map column filters to API parameters
      const firstName = columnFilters.firstName as string | undefined;
      const lastName = columnFilters.lastName as string | undefined;
      const email = columnFilters.allEmails as string | undefined;
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
          allEmails: response.data.footer.email, // Use email for footer as it's just a summary
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
      allEmails: "",
      students: "Total:",
      balance: "$0.00",
    };
  }, [footerData]);

  // Create export-specific columns with separate email columns
  const exportColumns = React.useMemo((): ColumnDef<ExportCustomerRow>[] => {
    const baseColumns: ColumnDef<ExportCustomerRow>[] = [
      {
        accessorKey: "firstName",
        header: "First Name",
        meta: { printable: true, printableName: "First Name" },
      },
      {
        accessorKey: "lastName", 
        header: "Last Name",
        meta: { printable: true, printableName: "Last Name" },
      },
      {
        accessorKey: "students",
        header: "Students", 
        meta: { printable: true, printableName: "Students" },
      },
      {
        accessorKey: "balance",
        header: "Balance",
        meta: { printable: true, printableName: "Balance", exportFormatter: (v: unknown) => String(v ?? '') },
      },
    ];
    
    // Add dynamic email columns
    const emailColumns = getEmailColumns(rows);
    
    return [...baseColumns, ...emailColumns];
  }, [rows, getEmailColumns]);

  // Transform data for export with separate email columns
  const exportData = React.useMemo(() => {
    return transformDataForExport(rows);
  }, [rows, transformDataForExport]);

  // Transform footer data for export
  const exportFooter = React.useMemo((): ExportCustomerRow | undefined => {
    if (!footerData) return undefined;
    
    const emails = footerData.allEmails ? footerData.allEmails.split(',').map(email => email.trim()) : [];
    const transformedFooter: ExportCustomerRow = {
      id: 0,
      isActive: false,
      firstName: footerData.firstName,
      lastName: footerData.lastName,
      email: footerData.email,
      students: footerData.students,
      balance: footerData.balance,
    };
    
    // Add separate email columns for footer
    emails.forEach((email, index) => {
      transformedFooter[`email${index + 1}`] = email;
    });
    
    return transformedFooter;
  }, [footerData]);

  const { exportToCsv, exportToPdf, exportToHtml, exportToJson, exportToText, exportToExcel } = useExportableData<ExportCustomerRow>({
    reportTitle: "Customers List",
    columns: exportColumns,
    data: exportData,
    footer: exportFooter,
    rightAlignedColumns: ['Balance'], // Only Balance column should be right-aligned
    columnWidths: {
      'Balance': 30, // Increase Balance column width in PDF
    },
    location: location, // Pass location for PDF header
  });

  const { handlePrint } = usePrintReport<ExportCustomerRow>();

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
      actions={
        <Button 
          onClick={() => setIsAddCustomerModalOpen(true)} 
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      }
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
        enablePrint={true}
        onPrint={() => handlePrint({
          reportTitle: 'Customers Report',
          columns: exportColumns,
          data: exportData,
          footer: exportFooter || undefined,
          location,
          rightAlignedColumns: ['Balance'], // Only Balance column should be right-aligned
        })}
        enableColumnFilters={true}
        onColumnFilterChange={handleColumnFilterChange}
        onColumnFilterEnter={handleColumnFilterEnter}
        columnFilters={columnFilters}
        columnFilterPlaceholders={{
          firstName: "Enter first name",
          lastName: "Enter last name",
          allEmails: "Enter email address",
          students: "Enter student name",
        }}

        // Sorting and pagination (server-side)
        manualSorting={true}
        sorting={sorting}
        onSortingChange={(s) => { setSorting(s); setPage(1); }}
        serverSidePagination={{ page, limit: pageSize, total, totalPages }}
        onServerSidePageChange={(newPage) => setPage(newPage)}
        hideRecordCount={true}
        showRecordCountInToolbar={true}
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
          // TODO: Remove this once we have a proper customer page
          if(isDev() || location === "training-location" || location === "burlington"){
            router.push(`customers/${row.id}`);
          } else {
            window.location.href = `${process.env.NEXT_PUBLIC_LEGACY_URL}/${location}/user/view?UserSearch%5Brole_name%5D=customer&id=${row.id}`;
          }
        }}
        rowClassName={(row) => `cursor-pointer ${!row.isActive ? 'opacity-60 hover:opacity-80' : ''}`}
      />
      
      <AddCustomerModal
        isOpen={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
        onSuccess={() => {
          // Refresh the data after successful customer creation
          fetchData();
        }}
        location={location}
      />
    </ReportPageLayout>
  );
}


