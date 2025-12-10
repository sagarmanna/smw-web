"use client";

import { useState, useMemo, useCallback } from "react";
import { useAppSelector } from "@/redux/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomTable } from "@/components/CustomTable";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { unscheduledLessonColumns, UnscheduledLessonData } from "../../../../[id]/studentTabConfigs";
import { ColumnDef } from "@tanstack/react-table";

interface UnscheduledLessonsTabProps {
  location: string;
  studentId: string;
}

interface UnscheduledLessonDataWithSelection extends UnscheduledLessonData {
  selected?: boolean;
}

export function UnscheduledLessonsTab({ location, studentId }: UnscheduledLessonsTabProps) {
  // Props are kept for future use (e.g., API calls, filtering)
  void location;
  void studentId;
  const data = useAppSelector((state) => state.studentTabs.unscheduledLessonData);
  const isLoading = useAppSelector((state) => state.studentTabs.unscheduledLessonLoading);
  const error = useAppSelector((state) => state.studentTabs.unscheduledLessonError);
  const [showAll, setShowAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  // Helper function to check if a lesson is expired
  const isExpired = useCallback((expiryDate: string): boolean => {
    try {
      const expiry = new Date(expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
      expiry.setHours(0, 0, 0, 0);
      return expiry < today;
    } catch {
      return false;
    }
  }, []);

  // Filter data based on showAll
  // When unchecked: show only non-expired lessons
  // When checked: show all lessons including expired ones
  const displayedData = useMemo(() => {
    if (showAll) {
      // Show all lessons including expired ones
      return data;
    }
    // Show only non-expired lessons when "Show All" is unchecked
    return data.filter(item => !isExpired(item.expiryDate));
  }, [data, showAll, isExpired]);

  // Add selection property to data
  const dataWithSelection = useMemo(() => {
    return displayedData.map((item) => {
      // Find the original index in the full data array
      const originalIndex = data.findIndex(d => 
        d.program === item.program &&
        d.phone === item.phone &&
        d.originalDate === item.originalDate &&
        d.expiryDate === item.expiryDate &&
        d.duration === item.duration &&
        d.online === item.online
      );
      return {
        ...item,
        selected: originalIndex !== -1 && selectedRows.has(originalIndex),
        originalIndex,
      };
    }) as (UnscheduledLessonDataWithSelection & { originalIndex?: number })[];
  }, [displayedData, data, selectedRows]);

  const handleChangeProgramTeacher = () => {
    // TODO: Implement change program/teacher functionality
    console.log('Change Program/Teacher');
  };

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      // Select all displayed rows by their original indices
      const indicesToSelect = new Set<number>();
      displayedData.forEach((item) => {
        const originalIndex = data.findIndex(d => 
          d.program === item.program &&
          d.phone === item.phone &&
          d.originalDate === item.originalDate &&
          d.expiryDate === item.expiryDate &&
          d.duration === item.duration &&
          d.online === item.online
        );
        if (originalIndex !== -1) {
          indicesToSelect.add(originalIndex);
        }
      });
      setSelectedRows(indicesToSelect);
    } else {
      setSelectedRows(new Set());
    }
  }, [displayedData, data]);

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
          <Checkbox
            checked={allSelected}
            onCheckedChange={handleSelectAll}
            aria-label="Select all"
            className={someSelected && !allSelected ? "data-[state=indeterminate]:bg-primary" : ""}
          />
        );
      },
      cell: ({ row }) => {
        const originalIndex = (row.original as UnscheduledLessonDataWithSelection & { originalIndex?: number }).originalIndex;
        return (
          <Checkbox
            checked={row.original.selected || false}
            onCheckedChange={(checked) => {
              if (originalIndex !== undefined) {
                handleRowSelect(originalIndex, checked as boolean);
              }
            }}
            aria-label="Select row"
          />
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
                  onCheckedChange={(checked: boolean) => setShowAll(checked)}
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
              customEmptyState={
                !isLoading && displayedData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-8">
                    <div className="text-4xl">📋</div>
                    <span className="text-sm font-medium">No unscheduled lessons found</span>
                  </div>
                ) : undefined
              }
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

