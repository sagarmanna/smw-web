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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SubstituteTeacherModal } from "./components/SubstituteTeacherModal";
import { EditDiscountModal } from "./components/EditDiscountModal";
import { EditDurationModal } from "./components/EditDurationModal";
import { EditClassroomModal } from "./components/EditClassroomModal";
import { EditOnlineTypeModal } from "./components/EditOnlineTypeModal";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { substituteTeacherForLessons, updateLessonsPrices, updateLessonsDuration, updateLessonsClassroom, updateLessonsOnlineStatus, deleteLessons, selectLessonDiscounts } from "./privateLessonsListing.slice";
import { calculateDiscountedPricesForLessons } from "./utils/discountCalculations";
import { parseDateString } from "@/utils/dateUtils";
import { startOfDay, isBefore } from "date-fns";

interface PrivateLessonsListingClientProps {
  location: string;
}

export function PrivateLessonsListingClient({ location }: PrivateLessonsListingClientProps) {
  const [selectedRows, setSelectedRows] = React.useState<Set<number>>(new Set());
  const [isSubstituteModalOpen, setIsSubstituteModalOpen] = React.useState(false);
  const [isEditDiscountModalOpen, setIsEditDiscountModalOpen] = React.useState(false);
  const [isEditDurationModalOpen, setIsEditDurationModalOpen] = React.useState(false);
  const [isEditClassroomModalOpen, setIsEditClassroomModalOpen] = React.useState(false);
  const [isEditOnlineTypeModalOpen, setIsEditOnlineTypeModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const dispatch = useAppDispatch();

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

  const selectedLessons = React.useMemo(
    () => rows.filter((row) => selectedRows.has(row.id)),
    [rows, selectedRows]
  );

  // Get previous discount data for selected lessons
  const previousDiscountData = useAppSelector((state) => {
    const lessonIds = selectedLessons.map((lesson) => lesson.id);
    return selectLessonDiscounts(state, lessonIds);
  });

  // Helper to check if any lessons are selected
  const hasSelectedLessons = React.useMemo(
    () => selectedLessons.length > 0,
    [selectedLessons.length]
  );

  // Helper to clear selection
  const clearSelection = React.useCallback(() => {
    setSelectedRows(new Set());
  }, []);

  const handleSubstituteTeacherClick = React.useCallback(() => {
    if (!hasSelectedLessons) {
      return;
    }

    // Ensure all selected lessons have the same teacher
    const uniqueTeachers = new Set(selectedLessons.map((lesson) => lesson.teacher));

    if (uniqueTeachers.size > 1) {
      toast.error("Choose lessons with same teacher");
      return;
    }

    setIsSubstituteModalOpen(true);
  }, [hasSelectedLessons, selectedLessons]);

  const handleEditDiscountClick = React.useCallback(() => {
    if (!hasSelectedLessons) {
      return;
    }
    setIsEditDiscountModalOpen(true);
  }, [hasSelectedLessons]);

  const handleEditDurationClick = React.useCallback(() => {
    if (!hasSelectedLessons) {
      return;
    }
    setIsEditDurationModalOpen(true);
  }, [hasSelectedLessons]);

  const handleEditClassroomClick = React.useCallback(() => {
    if (!hasSelectedLessons) {
      return;
    }

    // Check if any lesson is from yesterday or earlier
    // Only allow editing for today and tomorrow dates
    const today = startOfDay(new Date());

    const hasInvalidDate = selectedLessons.some((lesson) => {
      // Extract date part (before "@" if present)
      const datePart = lesson.date.split(" @ ")[0].trim();
      const lessonDate = parseDateString(datePart);
      
      if (!lessonDate) {
        // If we can't parse the date, allow editing (fail-safe)
        return false;
      }
      
      const lessonDateStart = startOfDay(lessonDate);
      
      // Check if lesson date is before today (yesterday or earlier)
      // Only allow today and tomorrow
      return isBefore(lessonDateStart, today);
    });

    if (hasInvalidDate) {
      toast.error("One of the selected lessons is invoiced. Invoiced lessons can't be edited.");
      return;
    }

    setIsEditClassroomModalOpen(true);
  }, [hasSelectedLessons, selectedLessons]);

  const handleEditOnlineTypeClick = React.useCallback(() => {
    if (!hasSelectedLessons) {
      return;
    }
    setIsEditOnlineTypeModalOpen(true);
  }, [hasSelectedLessons]);

  const handleDeleteClick = React.useCallback(() => {
    if (!hasSelectedLessons) {
      return;
    }
    setIsDeleteModalOpen(true);
  }, [hasSelectedLessons]);

  const handleDeleteConfirm = React.useCallback(() => {
    const lessonIds = selectedLessons.map((lesson) => lesson.id);
    
    // Update Redux state - remove deleted lessons
    dispatch(deleteLessons({ lessonIds }));

    // TODO: Replace with real API call
    console.log("Lessons deleted", { lessonIds });

    // Clear selection and close modal
    clearSelection();
    setIsDeleteModalOpen(false);

    // Show success toast
    toast.success(
      `${lessonIds.length} lesson${lessonIds.length !== 1 ? "s" : ""} deleted successfully`
    );
  }, [selectedLessons, dispatch, clearSelection]);

  const handleSubstituteSave = React.useCallback(
    (teacherId: string, teacherName: string, lessonIds: number[]) => {
      // Optimistically update Redux rows
      dispatch(substituteTeacherForLessons({ lessonIds, teacher: teacherName }));

      // TODO: Replace with real API call using teacherId + lessonIds
      console.log("Substitute teacher assigned", { teacherId, teacherName, lessonIds });

      // Clear selection and close modal
      clearSelection();
      setIsSubstituteModalOpen(false);

      // Show success toast
      toast.success("Lessons are substituted to the selected teachers");
    },
    [dispatch]
  );
  
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
                clearSelection();
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

  // Custom toolbar button (Edit dropdown menu)
  // Behaviour:
  // - Edit icon is always enabled (like Enrolments)
  // - Menu options are disabled until at least one row is selected
  const customToolbarButtons = React.useMemo(() => {
    const hasSelection = selectedRows.size > 0;

    return (
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem 
              onClick={handleSubstituteTeacherClick}
              disabled={!hasSelection}
            >
              Substitute Teacher
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleEditDiscountClick}
              disabled={!hasSelection}
            >
              Edit Discount
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleEditDurationClick}
              disabled={!hasSelection}
            >
              Edit Duration
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDeleteClick}
              disabled={!hasSelection}
              className="text-destructive focus:text-destructive"
            >
              Delete
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleEditClassroomClick}
              disabled={!hasSelection}
            >
              Edit Classroom
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleEditOnlineTypeClick}
              disabled={!hasSelection}
            >
              Edit Online Type
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => console.log("Email Selected")}
              disabled={!hasSelection}
            >
              Email Selected
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => console.log("Unschedule")}
              disabled={!hasSelection}
            >
              Unschedule
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => console.log("Bulk Reschedule")}
              disabled={!hasSelection}
            >
              Bulk Reschedule
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => console.log("Generate Invoice")}
              disabled={!hasSelection}
            >
              Generate Invoice
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }, [selectedRows.size, handleSubstituteTeacherClick, handleEditDiscountClick, handleEditDurationClick, handleEditClassroomClick, handleEditOnlineTypeClick, handleDeleteClick]);

  return (
    <>
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
          { key: "show past lessons", label: "Show Past Lessons" },
        ]}
        activeServerSideFilter={activeFilter}
        onServerSideFilterChange={handleServerSideFilterChange}
        defaultFilterLabel="All Private Lessons"
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

      <SubstituteTeacherModal
        open={isSubstituteModalOpen}
        onOpenChange={setIsSubstituteModalOpen}
        location={location}
        selectedLessons={selectedLessons}
        onSave={handleSubstituteSave}
      />

      <EditDiscountModal
        open={isEditDiscountModalOpen}
        onOpenChange={setIsEditDiscountModalOpen}
        selectedLessons={selectedLessons}
        initialDiscountData={previousDiscountData || undefined}
        onSave={(data, lessonIds) => {
          // Calculate discounted prices for all selected lessons using utility function
          const newPrices = calculateDiscountedPricesForLessons(selectedLessons, data);

          // Update Redux state with new prices and store discount data
          dispatch(updateLessonsPrices({ 
            lessonIds, 
            newPrices,
            discountData: data 
          }));

          // TODO: Replace with real API call
          console.log("Discounts applied to lessons", { data, lessonIds, newPrices });

          // Clear selection and close modal
          clearSelection();
          setIsEditDiscountModalOpen(false);

          // Show success toast
          toast.success(
            `Discounts applied to ${lessonIds.length} lesson${lessonIds.length !== 1 ? "s" : ""}`
          );
        }}
      />

      <EditDurationModal
        open={isEditDurationModalOpen}
        onOpenChange={setIsEditDurationModalOpen}
        selectedLessons={selectedLessons}
        onSave={(duration, lessonIds) => {
          // Update Redux state with new duration
          dispatch(updateLessonsDuration({ lessonIds, duration }));

          // TODO: Replace with real API call
          console.log("Duration updated for lessons", { duration, lessonIds });

          // Clear selection and close modal
          clearSelection();
          setIsEditDurationModalOpen(false);

          // Show success toast
          toast.success("Lesson Duration Edited Successfully");
        }}
      />

      <EditClassroomModal
        open={isEditClassroomModalOpen}
        onOpenChange={setIsEditClassroomModalOpen}
        location={location}
        selectedLessons={selectedLessons}
        onSave={(classroomId, classroomName, lessonIds) => {
          // Update Redux state with new classroom
          dispatch(updateLessonsClassroom({ lessonIds, classroomId, classroomName }));

          // TODO: Replace with real API call
          console.log("Classroom updated for lessons", { classroomId, classroomName, lessonIds });

          // Clear selection and close modal
          clearSelection();
          setIsEditClassroomModalOpen(false);

          // Show success toast
          toast.success("Lesson Classroom Edited Successfully");
        }}
      />

      <EditOnlineTypeModal
        open={isEditOnlineTypeModalOpen}
        onOpenChange={setIsEditOnlineTypeModalOpen}
        selectedLessons={selectedLessons}
        onSave={(onlineStatus, lessonIds) => {
          // Update Redux state with new online status
          dispatch(updateLessonsOnlineStatus({ lessonIds, onlineStatus }));

          // TODO: Replace with real API call
          console.log("Online status updated for lessons", { onlineStatus, lessonIds });

          // Clear selection and close modal
          clearSelection();
          setIsEditOnlineTypeModalOpen(false);

          // Show success toast based on selection
          const toastMessage = onlineStatus === "Yes" 
            ? "Private Lesson Edited To Make Online Class Successfully"
            : "Private Lesson Edited To Make In Class Successfully";
          toast.success(toastMessage);
        }}
      />

      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title={
          selectedLessons.length === 1
            ? "Are you sure you want to delete this lesson?"
            : `Are you sure you want to delete ${selectedLessons.length} lessons?`
        }
        onConfirm={handleDeleteConfirm}
        confirmLabel="OK"
        cancelLabel="Cancel"
      />
    </>
  );
}

