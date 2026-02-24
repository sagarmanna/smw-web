"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { InvoiceRow } from "./invoicesListing.api";
import { invoiceColumns } from "./tableConfigs";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { useExportableData } from "@/hooks/useExportableData";
import { useInvoiceListing } from "./hooks/useInvoiceListing";
import { formatLocationName } from "@/utils/textUtils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { createBlankInvoice } from "./invoicesListing.api";

interface InvoicesListingClientProps {
  location: string;
}

export function InvoicesListingClient({ location }: InvoicesListingClientProps) {
  const router = useRouter();

  const {
    rows,
    total,
    totalPages,
    isLoading,
    error,
    sorting,
    setSorting,
    page,
    setPage,
    pageSize,
    setPageSize,
    columnFilters,
    fetchData,
    handleColumnFilterChange,
    handleColumnFilterEnter,
  } = useInvoiceListing(location);

  // Legacy base URL - reused for both add button and row clicks
  const legacyBaseUrl = React.useMemo(() => 
    process.env.NEXT_PUBLIC_LEGACY_URL || 'https://dev2.studiomanagerweb.com/admin',
    []
  );

  // Create export-specific columns
  const exportColumns = React.useMemo((): ColumnDef<InvoiceRow>[] => {
    return [
      {
        accessorKey: "number",
        header: "Number",
        meta: { printable: true, printableName: "Number" },
      },
      {
        accessorKey: "date",
        header: "Date",
        meta: { printable: true, printableName: "Date" },
      },
      {
        accessorKey: "customer",
        header: "Customer",
        meta: { printable: true, printableName: "Customer" },
      },
      {
        accessorKey: "student",
        header: "Student",
        meta: { printable: true, printableName: "Student" },
      },
      {
        accessorKey: "phone",
        header: "Phone",
        meta: { printable: true, printableName: "Phone" },
      },
      {
        accessorKey: "status",
        header: "Status",
        meta: { printable: true, printableName: "Status" },
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }: { row: { original: InvoiceRow } }) => {
          const totalValue = row.original.total;
          // Handle different data types from API (same logic as tableConfigs)
          // TypeScript may receive string from API even though interface says number
          let numericTotal = 0;
          if (totalValue === null || totalValue === undefined) {
            numericTotal = 0;
          } else if (typeof totalValue === 'string') {
            const cleanedValue = (totalValue as string).replace(/[$,]/g, '').trim();
            numericTotal = parseFloat(cleanedValue) || 0;
          } else if (typeof totalValue === 'number') {
            numericTotal = isNaN(totalValue) ? 0 : totalValue;
          }
          return formatCurrency(numericTotal);
        },
        meta: { printable: true, printableName: "Total" },
      },
    ];
  }, []);

  const { exportToCsv, exportToPdf, exportToHtml, exportToJson, exportToText, exportToExcel } = useExportableData<InvoiceRow>({
    reportTitle: `Invoices list for ${formatLocationName(location)}`,
    columns: exportColumns,
    data: rows,
    location: location,
  });

  // Reusable Add Invoice Button
  const addInvoiceButton = React.useMemo(() => (
    <Button 
      onClick={async () => {
        try {
          const res = await createBlankInvoice(location);
          if (res && res.success && res.data?.id) {
            router.push(`/${location}/invoices/${res.data.id}`);
            return;
          }
        } catch (err) {
          console.error("failed to create blank invoice", err);
        }
        // fallback to legacy path if API call fails or doesn't return id
        const legacyUrl = `${legacyBaseUrl}/${location}/invoice/view?id=1069881`;
        window.location.href = legacyUrl;
      }} 
      className="bg-primary hover:bg-primary/90"
    >
      <Plus className="h-4 w-4 mr-2" />
      Add Invoice
    </Button>
  ), [location, legacyBaseUrl, router]);

  return (
    <ReportPageLayout
      title="Invoices"
      subtitle="Browse all invoices, search and sort"
      isLoading={isLoading}
      error={error}
      onRetry={fetchData}
      actions={addInvoiceButton}
    >
      <CustomTable
        data={rows}
        columns={invoiceColumns}
        isLoading={isLoading}
        size="compact"
        variant="default"
        stickyHeader={true}
        enableSearch={false}
        searchPlaceholder="Search invoices..."
        getSearchValue={(r) => `${r.number} ${r.customer} ${r.student}`}
        enableFilter={false}
        enablePrint={false}
        enableRowsPerPage={true}
        enableColumnFilters={true}
        onColumnFilterChange={handleColumnFilterChange}
        onColumnFilterEnter={handleColumnFilterEnter}
        columnFilters={columnFilters}
        columnFilterPlaceholders={{
          number: "Enter invoice number",
          customer: "Enter customer name",
          student: "Enter student name",
          phone: "Enter phone number",
        }}
        manualSorting={true}
        sorting={sorting}
        onSortingChange={(s) => {
          setSorting(s);
          setPage(1);
        }}
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
        onRowClick={(row: InvoiceRow) => {
          // Navigate to invoice detail page
          router.push(`/${location}/invoices/${row.id}`);
        }}
        rowClassName="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      />
    </ReportPageLayout>
  );
}

