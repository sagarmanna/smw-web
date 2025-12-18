"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { EnrolmentRow } from "./enrolmentsListing.api";
import { enrolmentColumns } from "./tableConfigs";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { useExportableData } from "@/hooks/useExportableData";
import { useEnrolmentListing } from "./hooks/useEnrolmentListing";
import { formatLocationName } from "@/utils/textUtils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { NewEnrolmentModal, type EnrolmentFormData } from "./components/NewEnrolmentModal";
import { toast } from "sonner";

interface EnrolmentsListingClientProps {
  location: string;
}

export function EnrolmentsListingClient({ location }: EnrolmentsListingClientProps) {
  const [selectedDate] = React.useState<Date>(() => new Date());
  const [selectedRows, setSelectedRows] = React.useState<Set<number>>(new Set());
  const [isNewEnrolmentModalOpen, setIsNewEnrolmentModalOpen] = React.useState(false);

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
  } = useEnrolmentListing(location);
  
  // Add checkbox column to columns
  const columns = React.useMemo<ColumnDef<EnrolmentRow>[]>(() => {
    const checkboxColumn: ColumnDef<EnrolmentRow> = {
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

    return [checkboxColumn, ...enrolmentColumns] as ColumnDef<EnrolmentRow>[];
  }, [rows, selectedRows]);

  // Create export-specific columns
  const exportColumns = React.useMemo((): ColumnDef<EnrolmentRow>[] => {
    return [
      {
        accessorKey: "program",
        header: "Program",
        meta: { printable: true, printableName: "Program" },
      },
      {
        accessorKey: "student",
        header: "Student",
        meta: { printable: true, printableName: "Student" },
      },
      {
        accessorKey: "teacher",
        header: "Teacher",
        meta: { printable: true, printableName: "Teacher" },
      },
      {
        accessorKey: "autoRenewal",
        header: "Auto Renewal",
        meta: { printable: true, printableName: "Auto Renewal" },
      },
      {
        accessorKey: "startDate",
        header: "Start Date",
        meta: { printable: true, printableName: "Start Date" },
      },
      {
        accessorKey: "endDate",
        header: "End Date",
        meta: { printable: true, printableName: "End Date" },
      },
      {
        accessorKey: "lessonsRemaining",
        header: "Lessons Remaining",
        meta: { printable: true, printableName: "Lessons Remaining" },
      },
    ];
  }, []);

  const { exportToCsv, exportToPdf, exportToHtml, exportToJson, exportToText, exportToExcel } = useExportableData<EnrolmentRow>({
    reportTitle: `Enrolments list for ${formatLocationName(location)}`,
    columns: exportColumns,
    data: rows,
    location: location, // Pass location for PDF header
  });

  // Handle new enrolment completion
  const handleNewEnrolmentComplete = React.useCallback(async (data: EnrolmentFormData) => {
    try {
      // TODO: Implement API call to create enrolment
      // Example structure:
      // const response = await createEnrolment(location, data);
      // if (response.success) {
      //   toast.success("Enrolment created successfully");
      //   setIsNewEnrolmentModalOpen(false);
      //   fetchData(); // Refresh the listing
      // } else {
      //   toast.error(response.message || "Failed to create enrolment");
      // }
      
      // For now, just close modal and show success message
      console.log("Enrolment data:", data);
      setIsNewEnrolmentModalOpen(false);
      toast.success("Enrolment created successfully");
      fetchData(); // Refresh the listing
    } catch (error) {
      console.error("Error creating enrolment:", error);
      toast.error("Failed to create enrolment");
    }
  }, [fetchData, location]);

  // Custom toolbar buttons (Edit only - Filter is handled by enableFilter prop)
  const customToolbarButtons = React.useMemo(() => (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8 group relative">
              <Pencil className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Edit</p>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => {
          // TODO: Implement change teacher functionality
          console.log("Change Teacher clicked");
        }}>
          Change Teacher
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ), []);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Compact Header - Responsive height */}
        <div className="flex-shrink-0 max-h-[200px] md:max-h-[100px] space-y-2">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="sm:text-lg md:text-xl font-bold tracking-tight truncate">
                Schedule for {format(selectedDate, "EEEE, MMMM do, yyyy")}
              </h1>
            </div>
          </div>

          {/* Tabs Row */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 md:gap-4">
            {/* Navigation Tabs on the left */}
            <div className="flex items-center gap-4">
              <Tabs value="enrolments" className="w-auto">
                <TabsList className="grid grid-cols-2 h-10 w-auto">
                  <TabsTrigger value="enrolments" className="text-xs px-2 md:px-4">Enrolments</TabsTrigger>
                  <TabsTrigger value="schedule" asChild className="text-xs px-2 md:px-4">
                    <Link href={`/${location}/schedule`}>Schedule</Link>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>

        <div className="flex-1 mt-2 md:mt-8 lg:mt-2">
          <ReportPageLayout
            title="Enrolments"
            subtitle="Browse all enrolments, search and sort"
            isLoading={isLoading}
            error={error}
            onRetry={fetchData}
            actions={
              <Button 
                onClick={() => setIsNewEnrolmentModalOpen(true)} 
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Enrolment
              </Button>
            }
          >
            <div />
          </ReportPageLayout>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Compact Header - Responsive height */}
      <div className="flex-shrink-0 max-h-[200px] md:max-h-[100px] space-y-2">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h1 className="sm:text-lg md:text-xl font-bold tracking-tight truncate">
              Schedule for {format(selectedDate, "EEEE, MMMM do, yyyy")}
            </h1>
          </div>
        </div>

        {/* Tabs Row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 md:gap-4">
          {/* Navigation Tabs on the left */}
          <div className="flex items-center gap-4">
            <Tabs value="enrolments" className="w-auto">
              <TabsList className="grid grid-cols-2 h-10 w-auto">
                <TabsTrigger value="enrolments" className="text-xs px-2 md:px-4">Enrolments</TabsTrigger>
                <TabsTrigger value="schedule" asChild className="text-xs px-2 md:px-4">
                  <Link href={`/${location}/schedule`}>Schedule</Link>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 mt-2 md:mt-8 lg:mt-2">
        <ReportPageLayout
          title="Enrolments"
          subtitle="Browse all enrolments, search and sort"
          isLoading={isLoading}
          error={null}
          onRetry={fetchData}
          actions={
            <Button 
              onClick={() => setIsNewEnrolmentModalOpen(true)} 
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Enrolment
            </Button>
          }
        >
          <CustomTable
            data={rows}
            columns={columns}
            isLoading={isLoading}

            // Visual configuration
            size="compact"
            variant="default"
            stickyHeader={true}

            // Features
            enableSearch={false}
            searchPlaceholder="Search enrolments..."
            getSearchValue={(r) => `${r.program} ${r.student} ${r.teacher}`}
            enableFilter={true}
            enablePrint={false}
            enableRowsPerPage={true}
            customHeaderComponent={customToolbarButtons}
            serverSideFilterOptions={[
              { key: "active", label: "Active" },
              { key: "inactive", label: "Inactive" },
            ]}
            activeServerSideFilter={activeFilter}
            onServerSideFilterChange={handleServerSideFilterChange}
            defaultFilterLabel="All Enrolments"
            enableColumnFilters={true}
            onColumnFilterChange={handleColumnFilterChange}
            onColumnFilterEnter={handleColumnFilterEnter}
            columnFilters={columnFilters}
            columnFilterPlaceholders={{
              program: "Enter program name",
              student: "Enter student name",
              teacher: "Enter teacher name",
              autoRenewal: "Enter auto renewal status",
            }}

            // Sorting and pagination (server-side)
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
          />
        </ReportPageLayout>
      </div>

      <NewEnrolmentModal
        open={isNewEnrolmentModalOpen}
        onOpenChange={setIsNewEnrolmentModalOpen}
        onNext={handleNewEnrolmentComplete}
        location={location}
        nextButtonText="Next"
      />
    </div>
  );
}

