"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomTable } from "@/components/CustomTable";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { unscheduledLessonColumns, UnscheduledLessonData } from "../../../../[id]/studentTabConfigs";
import { ColumnDef } from "@tanstack/react-table";
import { fetchUnscheduledLessonsData } from "../../../../[id]/studentTabs.slice";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ChangeProgramTeacherModal } from "./ChangeProgramTeacherModal";

interface UnscheduledLessonsTabProps {
  location: string;
  studentId: string;
}

interface UnscheduledLessonDataWithSelection extends UnscheduledLessonData {
  selected?: boolean;
}

export function UnscheduledLessonsTab({ location, studentId }: UnscheduledLessonsTabProps) {
  const dispatch = useAppDispatch();
  
  // Read data from Redux state (no API call here - handled by parent)
  const data = useAppSelector((state) => state.studentTabs.unscheduledLessonData);
  const pagination = useAppSelector((state) => state.studentTabs.unscheduledLessonPagination);
  const isLoading = useAppSelector((state) => state.studentTabs.unscheduledLessonLoading);
  const error = useAppSelector((state) => state.studentTabs.unscheduledLessonError);
  
  const [showAll, setShowAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [isChangeProgramTeacherOpen, setIsChangeProgramTeacherOpen] = useState(false);
  
  // Track last showAll value to prevent duplicate API calls
  // Initialize to false to match parent's initial API call
  const lastShowAllRef = useRef<boolean>(false);
  
  // Use page from API response for display (synced with actual data)
  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const totalRows = pagination?.total || 0;
  const rowsPerPage = pagination?.limit || 10; // Use limit from API response

  const handlePreviousPage = () => {
    if (currentPage > 1 && !isLoading) {
      const newPage = currentPage - 1;
      // Fetch data for the new page (only page parameter, no limit)
      dispatch(fetchUnscheduledLessonsData({ location, studentId, page: newPage, showAll }));
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages && !isLoading) {
      const newPage = currentPage + 1;
      // Fetch data for the new page (only page parameter, no limit)
      dispatch(fetchUnscheduledLessonsData({ location, studentId, page: newPage, showAll }));
    }
  };

  const handleShowAllChange = (checked: boolean) => {
    // Only call API if value actually changed
    if (lastShowAllRef.current !== checked) {
      lastShowAllRef.current = checked;
      setShowAll(checked);
      // Reset to page 1 and fetch with new showAll value
      setSelectedRows(new Set());
      dispatch(fetchUnscheduledLessonsData({ 
        location, 
        studentId, 
        page: 1, 
        showAll: checked 
      }));
    }
  };

  const handleRowClick = useCallback(
    (row: UnscheduledLessonData) => {
      const legacyBase = process.env.NEXT_PUBLIC_LEGACY_URL || "";
      // Use the lesson ID to redirect to the lesson view page
      if (row.id) {
        const url = `${legacyBase}/${location}/lesson/view?id=${row.id}`;
        window.location.href = url;
      }
    },
    [location]
  );

  // Add selection property to data
  const dataWithSelection = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      selected: selectedRows.has(index),
    })) as UnscheduledLessonDataWithSelection[];
  }, [data, selectedRows]);

  // Get the program name of the first selected lesson (used to prefill modal)
  const firstSelectedProgramName = useMemo(() => {
    const firstSelected = dataWithSelection.find((item, index) => selectedRows.has(index));
    return firstSelected?.program ?? "";
  }, [dataWithSelection, selectedRows]);

  // Get selected lesson IDs
  const selectedLessonIds = useMemo(() => {
    return dataWithSelection
      .filter((_, index) => selectedRows.has(index))
      .map((item) => item.id)
      .filter((id): id is number => id !== undefined && id !== null);
  }, [dataWithSelection, selectedRows]);

  // Handle successful lesson change - refresh data
  const handleChangeSuccess = useCallback(() => {
    // Clear selections
    setSelectedRows(new Set());
    // Refresh data
    dispatch(fetchUnscheduledLessonsData({ location, studentId, page: currentPage, showAll }));
  }, [dispatch, location, studentId, currentPage, showAll]);

  const handleChangeProgramTeacher = () => {
    // If there are no lessons visible or none are selected, show error message
    if (dataWithSelection.length === 0 || selectedRows.size === 0) {
      toast.error("Choose any lessons");
      return;
    }
    setIsChangeProgramTeacherOpen(true);
  };

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      // Select all displayed rows
      const indicesToSelect = new Set<number>();
      dataWithSelection.forEach((_, index) => {
        indicesToSelect.add(index);
      });
      setSelectedRows(indicesToSelect);
    } else {
      setSelectedRows(new Set());
    }
  }, [dataWithSelection]);

  const handleRowSelect = useCallback((index: number, checked: boolean) => {
    setSelectedRows(prev => {
      const newSelected = new Set(prev);
      if (checked) {
        newSelected.add(index);
      } else {
        newSelected.delete(index);
      }
      return newSelected;
    });
  }, []);

  // Create columns with checkbox
  const columnsWithCheckbox = useMemo(() => {
    const checkboxColumn: ColumnDef<UnscheduledLessonDataWithSelection> = {
      id: "select",
      header: () => {
        const allSelected = dataWithSelection.length > 0 && dataWithSelection.every(item => item.selected);
        const someSelected = dataWithSelection.some(item => item.selected);
        
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={allSelected}
              onCheckedChange={handleSelectAll}
              aria-label="Select all"
              className={someSelected && !allSelected ? "data-[state=indeterminate]:bg-primary" : ""}
            />
          </div>
        );
      },
      cell: ({ row }) => {
        const index = dataWithSelection.findIndex(item => item.id === row.original.id);
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={row.original.selected || false}
              onCheckedChange={(checked) => {
                if (index !== -1) {
                  handleRowSelect(index, checked as boolean);
                }
              }}
              aria-label="Select row"
            />
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
      size: 40,
    };

    return [checkboxColumn, ...unscheduledLessonColumns] as ColumnDef<UnscheduledLessonDataWithSelection>[];
  }, [dataWithSelection, handleSelectAll, handleRowSelect]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Unscheduled Lessons</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleChangeProgramTeacher}>
              Change Program/Teacher..
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="pt-0">
        {error ? (
          <div className="text-center py-8 text-red-500">
            <p className="font-medium">Error loading data</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="unscheduled-show-all"
                  checked={showAll}
                  onCheckedChange={handleShowAllChange}
                />
                <label
                  htmlFor="unscheduled-show-all"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Show All
                </label>
              </div>
            </div>
            <CustomTable
              data={dataWithSelection}
              columns={columnsWithCheckbox}
              size="compact"
              variant="striped"
              enableSorting={true}
              enableExport={false}
              enablePrint={false}
              enableSearch={false}
              enableFilter={false}
              className="border-0 w-full"
              isLoading={isLoading}
              onRowClick={handleRowClick}
              rowClassName="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              customLoadingState={
                <LoadingAnimation 
                  size="md" 
                  text="Loading unscheduled lessons..." 
                  className="py-8"
                />
              }
              customEmptyState={
                !isLoading && dataWithSelection.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-8">
                    <div className="text-4xl">📋</div>
                    <span className="text-sm font-medium">No unscheduled lessons found</span>
                  </div>
                ) : undefined
              }
            />
            
            {/* Server-side Pagination Controls */}
            {totalRows > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, totalRows)} of {totalRows} lessons
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1 || isLoading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages || isLoading}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      <ChangeProgramTeacherModal
        open={isChangeProgramTeacherOpen}
        onOpenChange={setIsChangeProgramTeacherOpen}
        selectedCount={selectedRows.size}
        location={location}
        initialProgramName={firstSelectedProgramName}
        selectedLessonIds={selectedLessonIds}
        onSuccess={handleChangeSuccess}
      />
    </Card>
  );
}
