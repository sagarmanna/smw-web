"use client";

import * as React from "react";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { formatCurrency } from "@/utils/formatCurrency";
import { getCustomers, CustomerRow } from "./customers.api";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { useExportableData } from "@/hooks/useExportableData";
import { useRouter } from "next/navigation";

interface CustomersClientProps {
  location: string;
}

export function CustomersListingClient({ location }: CustomersClientProps) {
  const router = useRouter();
  const [rows, setRows] = React.useState<CustomerRow[]>([]);
  const [total, setTotal] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [page, setPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(20);
  const [activeFilter, setActiveFilter] = React.useState<string | undefined>(undefined);
  // Using client-side search via CustomTable; no separate server search state for now

  const columns = React.useMemo<ColumnDef<CustomerRow>[]>(() => [
    {
      accessorKey: "firstName",
      header: () => <span>First Name</span>,
      cell: ({ row }) => <span className="truncate block max-w-[220px]" title={row.original.firstName}>{row.original.firstName}</span>,
      enableSorting: true,
      meta: { printable: true, printableName: "First Name" },
    },
    {
      accessorKey: "lastName",
      header: () => <span>Last Name</span>,
      cell: ({ row }) => <span className="truncate block max-w-[220px]" title={row.original.lastName}>{row.original.lastName}</span>,
      enableSorting: true,
      meta: { printable: true, printableName: "Last Name" },
    },
    {
      accessorKey: "email",
      header: () => <span>Email</span>,
      cell: ({ row }) => <span className="truncate block max-w-[260px]" title={row.original.email}>{row.original.email}</span>,
      enableSorting: true,
      meta: { printable: true, printableName: "Email" },
    },
    {
      accessorKey: "student",
      header: () => <span>Student</span>,
      cell: ({ row }) => <span className="truncate block max-w-[260px]" title={row.original.student}>{row.original.student}</span>,
      enableSorting: false,
      meta: { printable: true, printableName: "Student" },
    },
    {
      accessorKey: "balance",
      header: () => <span className="text-right">Balance</span>,
      cell: ({ row }) => <span className="tabular-nums text-right block">{formatCurrency(row.original.balance)}</span>,
      enableSorting: true,
      meta: { printable: true, printableName: "Balance", exportFormatter: (v: unknown) => typeof v === 'number' ? formatCurrency(v) : String(v ?? '') },
    },
  ], []);

  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const sortBy = sorting[0]?.id;
      const sortDir = sorting[0]?.desc ? "desc" : "asc";
      const response = await getCustomers(location, {
        page,
        pageSize,
        sortBy,
        sortDir,
        filter: activeFilter,
      });
      if (response?.success) {
        setRows(response.data.items);
        setTotal(response.data.total);
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

  const footerRow = React.useMemo(() => {
    const totalBalance = rows.reduce((sum, row) => sum + row.balance, 0);
    return {
      id: 0,
      firstName: "",
      lastName: "",
      email: "",
      student: "Total:",
      balance: totalBalance,
    };
  }, [rows]);

  const { exportToCsv, exportToPdf, exportToHtml, exportToJson, exportToText, exportToExcel } = useExportableData<CustomerRow>({
    reportTitle: "Customers",
    columns,
    data: rows,
    footer: footerRow,
  });

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
        getSearchValue={(r) => `${r.firstName} ${r.lastName} ${r.email} ${r.student}`}
        enableFilter={true}
        serverSideFilterOptions={[
          { key: "active", label: "Active" },
          { key: "inactive", label: "Inactive" },
        ]}
        activeServerSideFilter={activeFilter}
        onServerSideFilterChange={(key) => { setActiveFilter(key); setPage(1); }}
        enableRowsPerPage={true}

        // Sorting and pagination (server-side)
        manualSorting={true}
        sorting={sorting}
        onSortingChange={(s) => { setSorting(s); setPage(1); }}
        serverSidePagination={{ page, limit: pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) }}
        onServerSidePageChange={(newPage) => setPage(newPage)}
        rowsPerPage={pageSize}
        enableExport={true}
        onExport={{
          html: exportToHtml,
          csv: exportToCsv,
          text: exportToText,
          excel: exportToExcel,
          pdf: exportToPdf,
          json: exportToJson,
        }}
        rowsPerPageOptions={[10, 20, 50, 100]}
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


