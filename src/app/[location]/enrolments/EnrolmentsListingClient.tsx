"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { EnrolmentRow } from "./enrolmentsListing.api";
import { enrolmentColumns } from "./tableConfigs";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { useExportableData } from "@/hooks/useExportableData";
import { useEnrolmentListing } from "./hooks/useEnrolmentListing";
import { formatLocationName } from "@/utils/textUtils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { ScheduleView, ScheduleHeader, ScheduleViewControls, ScheduleViewProvider } from "./components/ScheduleView";
import { ChangeTeacherModal } from "./components/ChangeTeacherModal";
import { NewEnrolmentModal, type EnrolmentFormData } from "./components/NewEnrolmentModal";
import { toast } from "sonner";
import { isDev } from "@/utils/env";

interface EnrolmentsListingClientProps {
  location: string;
}

export function EnrolmentsListingClient({ location }: EnrolmentsListingClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<"enrolments" | "schedule">("enrolments");
  const [selectedRows, setSelectedRows] = React.useState<Set<number>>(new Set());
  const [changeTeacherModalOpen, setChangeTeacherModalOpen] = React.useState(false);
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
          <div onClick={(e) => e.stopPropagation()} className="cursor-default">
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
              className={`cursor-default ${someSelected && !allSelected ? "data-[state=indeterminate]:bg-primary" : ""}`}
            />
          </div>
        );
      },
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()} className="cursor-default">
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
            className="cursor-default"
          />
        </div>
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
  }, [fetchData]);

  // Custom toolbar buttons (Edit only - Filter is handled by enableFilter prop)
  const customToolbarButtons = React.useMemo(() => (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 group relative"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Edit</p>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => {
            if (!isDev()) {
              toast.info("Change Teacher is in development");
              return;
            }
            if (selectedRows.size > 0) {
              setChangeTeacherModalOpen(true);
            }
          }}
          disabled={selectedRows.size === 0}
        >
          Change Teacher
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ), [selectedRows.size]);

  // Reusable tab navigation
  const tabNavigation = React.useMemo(() => (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "enrolments" | "schedule")} className="w-auto">
      <TabsList className="grid grid-cols-2 h-10 w-auto">
        <TabsTrigger value="enrolments" className="text-xs px-2 md:px-4">Enrolments</TabsTrigger>
        <TabsTrigger value="schedule" className="text-xs px-2 md:px-4">Schedule</TabsTrigger>
      </TabsList>
    </Tabs>
  ), [activeTab]);

  // Reusable schedule tab content
  const scheduleTabContent = React.useMemo(() => (
    <TabsContent value="schedule" className="mt-0">
      <ScheduleView />
    </TabsContent>
  ), []);

  // Reusable Change Teacher Modal
  const changeTeacherModal = React.useMemo(() => (
    <ChangeTeacherModal
      open={changeTeacherModalOpen}
      onOpenChange={setChangeTeacherModalOpen}
      selectedCount={selectedRows.size}
      location={location}
      selectedEnrolmentIds={Array.from(selectedRows)}
    />
  ), [changeTeacherModalOpen, selectedRows, location]);

  // Reusable Add Enrolment Button
  const addEnrolmentButton = React.useMemo(() => (
    <Button 
      onClick={() => isDev() ? setIsNewEnrolmentModalOpen(true) : toast.info("Add Enrolments is in development")} 
      className="bg-primary hover:bg-primary/90"
    >
      <Plus className="h-4 w-4 mr-2" />
      Add Enrolment
    </Button>
  ), []);

  // Reusable New Enrolment Modal
  const newEnrolmentModal = React.useMemo(() => (
    <NewEnrolmentModal
      open={isNewEnrolmentModalOpen}
      onOpenChange={setIsNewEnrolmentModalOpen}
      onNext={handleNewEnrolmentComplete}
      location={location}
      nextButtonText="Next"
    />
  ), [isNewEnrolmentModalOpen, handleNewEnrolmentComplete, location]);

  // Reusable Tabs Content Area
  const renderTabsContent = React.useCallback((showTable: boolean) => (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "enrolments" | "schedule")}>
      <TabsContent value="enrolments" className="mt-0">
        <ReportPageLayout
          title="Enrolments"
          subtitle="Browse all enrolments, search and sort"
          isLoading={isLoading}
          error={showTable ? null : error}
          onRetry={fetchData}
          actions={addEnrolmentButton}
        >
          {showTable ? (
            <CustomTable
              data={rows}
              columns={columns}
              isLoading={isLoading}
              size="compact"
              variant="default"
              stickyHeader={true}
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
                autoRenewal: "Filter",
                lessonsRemaining: "Enter lessons remaining",
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
              onRowClick={(row: EnrolmentRow) => {
                if (!isDev()) {
                  // /admin/training-location/enrolment/view?id=31202
                  const url = `${process.env.NEXT_PUBLIC_LEGACY_URL}/${location}/enrolment/view?id=${row.id}`;
                  window.location.href = url;
                  return;
                }
                router.push(`/${location}/enrolments/${row.id}`);
              }}
              rowClassName="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            />
          ) : (
            <div />
          )}
        </ReportPageLayout>
      </TabsContent>

      {scheduleTabContent}
    </Tabs>
  ), [activeTab, isLoading, error, fetchData, addEnrolmentButton, rows, columns, customToolbarButtons, 
      activeFilter, handleServerSideFilterChange, handleColumnFilterChange, handleColumnFilterEnter, 
      columnFilters, sorting, setSorting, setPage, page, pageSize, total, totalPages, exportToHtml, 
      exportToCsv, exportToText, exportToExcel, exportToPdf, exportToJson, setPageSize, scheduleTabContent, 
      router, location]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Compact Header - Responsive height */}
        <div className="flex-shrink-0 max-h-[200px] md:max-h-[100px] space-y-2">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="sm:text-lg md:text-xl font-bold tracking-tight truncate">
                Enrolments
              </h1>
            </div>
          </div>

          {/* Tabs Row */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 md:gap-4">
            {/* Navigation Tabs on the left */}
            <div className="flex items-center gap-4">
              {tabNavigation}
            </div>
          </div>
        </div>

        <div className="flex-1 mt-2 md:mt-8 lg:mt-2">
          {renderTabsContent(false)}
        </div>

        {/* Modals */}
        {changeTeacherModal}
        {newEnrolmentModal}
      </div>
    );
  }

  return (
    <ScheduleViewProvider location={location}>
      <div className="min-h-screen flex flex-col">
        {/* Compact Header - Responsive height */}
        <div className="flex-shrink-0 max-h-[200px] md:max-h-[100px] space-y-2">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex-1 min-w-0">
            <ScheduleHeader />
          </div>
        </div>

        {/* Tabs Row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 md:gap-4">
          {/* Navigation Tabs on the left */}
          <div className="flex items-center gap-4">
            {tabNavigation}
          </div>

          {/* Schedule-specific controls (only visible when schedule tab is active) */}
          {activeTab === "schedule" && (
            <ScheduleViewControls />
          )}
        </div>

      </div>

      {/* Content Area */}
      <div className="flex-1 mt-2 md:mt-8 lg:mt-2">
        {renderTabsContent(true)}
      </div>

      {/* Modals */}
      {changeTeacherModal}
      {newEnrolmentModal}
    </div>
    </ScheduleViewProvider>
  );
}

