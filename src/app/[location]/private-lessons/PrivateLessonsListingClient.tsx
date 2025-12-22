"use client";

import * as React from "react";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { PrivateLessonRow } from "./privateLessonsListing.api";
import { privateLessonColumns } from "./tableConfigs";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { useExportableData } from "@/hooks/useExportableData";
import { usePrivateLessonsListing } from "./hooks/usePrivateLessonsListing";
import { formatLocationName } from "@/utils/textUtils";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";

interface PrivateLessonsListingClientProps {
  location: string;
}

export function PrivateLessonsListingClient({ location }: PrivateLessonsListingClientProps) {
  const [selectedRows, setSelectedRows] = React.useState<Set<number>>(new Set());

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
    activeFilter,
    fetchData,
    handleColumnFilterChange,
    handleColumnFilterEnter,
    handleServerSideFilterChange,
  } = usePrivateLessonsListing(location);
  
  // Add checkbox column to columns
  const columns = React.useMemo<ColumnDef<PrivateLessonRow>[]>(() => {
    const checkboxColumn: ColumnDef<PrivateLessonRow> = {
      id: "select",
      header: () => {
        const allSelected = rows.length > 0 && rows.every(row => selectedRows.has(row.id));
        const someSelected = rows.some(row => selectedRows.has(row.id));
        
        return (
          <Checkbox
            checked={allSelected}
            onCheckedChange={(checked: boolean) => {
              if (checked) {
                setSelectedRows(new Set(rows.map(row => row.id)));
              } else {
                setSelectedRows(new Set());
              }
            }}
            aria-label="Select all"
            className={someSelected && !allSelected ? "data-[state=indeterminate]:bg-primary" : ""}
          />
        );
      },
      cell: ({ row }) => (
        <Checkbox
          checked={selectedRows.has(row.original.id)}
          onCheckedChange={(checked: boolean) => {
            setSelectedRows(prev => {
              const newSet = new Set(prev);
              if (checked) {
                newSet.add(row.original.id);
              } else {
                newSet.delete(row.original.id);
              }
              return newSet;
            });
          }}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    };

    return [checkboxColumn, ...privateLessonColumns] as ColumnDef<PrivateLessonRow>[];
  }, [rows, selectedRows]);

  // Create export-specific columns
  const exportColumns = React.useMemo((): ColumnDef<PrivateLessonRow>[] => {
    return [
      {
        accessorKey: "date",
        header: "Date",
        meta: { printable: true, printableName: "Date" },
      },
      {
        accessorKey: "student",
        header: "Student",
        meta: { printable: true, printableName: "Student" },
      },
      {
        accessorKey: "program",
        header: "Program",
        meta: { printable: true, printableName: "Program" },
      },
      {
        accessorKey: "teacher",
        header: "Teacher",
        meta: { printable: true, printableName: "Teacher" },
      },
      {
        accessorKey: "duration",
        header: "Duration",
        meta: { printable: true, printableName: "Duration" },
      },
      {
        accessorKey: "online",
        header: "Online",
        meta: { printable: true, printableName: "Online" },
      },
      {
        accessorKey: "status",
        header: "Status",
        meta: { printable: true, printableName: "Status" },
      },
      {
        accessorKey: "payment",
        header: "Payment",
        meta: { printable: true, printableName: "Payment" },
      },
      {
        accessorKey: "price",
        header: "Price",
        meta: { printable: true, printableName: "Price" },
      },
    ];
  }, []);

  const { exportToCsv, exportToPdf, exportToHtml, exportToJson, exportToText, exportToExcel } = useExportableData<PrivateLessonRow>({
    reportTitle: `Private Lessons list for ${formatLocationName(location)}`,
    columns: exportColumns,
    data: rows,
    location: location,
  });

  // Custom toolbar button (Edit only)
  const customToolbarButtons = React.useMemo(() => (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            disabled={selectedRows.size === 0}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Edit</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ), [selectedRows.size]);

  return (
    <ReportPageLayout
      title="Private Lessons"
      subtitle="Browse all private lessons, search and sort"
      isLoading={isLoading}
      error={error}
      onRetry={fetchData}
    >
      <CustomTable
        data={rows}
        columns={columns}
        isLoading={isLoading}
        size="compact"
        variant="default"
        stickyHeader={true}
        enableSearch={false}
        searchPlaceholder="Search private lessons..."
        getSearchValue={(r) => `${r.student} ${r.program} ${r.teacher}`}
        enableFilter={true}
        enablePrint={false}
        enableExport={true}
        enableRowsPerPage={true}
        customHeaderComponent={customToolbarButtons}
        onExport={{
          csv: exportToCsv,
          excel: exportToExcel,
          pdf: exportToPdf,
          html: exportToHtml,
          text: exportToText,
          json: exportToJson,
        }}
        serverSideFilterOptions={[
          { key: "scheduled", label: "Scheduled" },
          { key: "completed", label: "Completed" },
        ]}
        activeServerSideFilter={activeFilter}
        onServerSideFilterChange={handleServerSideFilterChange}
        defaultFilterLabel="All Lessons"
        enableColumnFilters={true}
        onColumnFilterChange={handleColumnFilterChange}
        onColumnFilterEnter={handleColumnFilterEnter}
        columnFilters={columnFilters}
        columnFilterPlaceholders={{
          date: "Select date range",
          student: "Enter student name",
          program: "Enter program name",
          teacher: "Enter teacher name",
          online: "Select online status",
          status: "Select status",
          payment: "Select payment status",
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
        onRowsPerPageChange={(newSize) => { setPageSize(newSize); setPage(1); }}
      />
    </ReportPageLayout>
  );
}

