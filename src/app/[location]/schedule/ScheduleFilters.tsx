"use client";

import { FC } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Combobox } from "@/components/ui/combobox";
import { CalendarIcon, Clock, Filter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Program, Teacher } from "./schedule.api";

type PopoverContentProps = React.ComponentProps<typeof PopoverContent>;

interface ScheduleFiltersProps {
  currentView: "teacher" | "classroom";
  isMobile?: boolean;
  
  // Date props
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  datePickerOpen: boolean;
  setDatePickerOpen: (open: boolean) => void;
  recentDates: Date[];
  goToToday: () => void;

  // Program props
  programs: Program[];
  selectedProgram: string;
  onProgramChange: (value: string) => void;
  programsLoading: boolean;

  // Teacher props
  filteredTeachers: Teacher[];
  selectedTeacher: string;
  onTeacherChange: (value: string) => void;
  teachersLoading: boolean;
  popoverContentProps?: Omit<PopoverContentProps, 'children'>;
}

export const ScheduleFilters: FC<ScheduleFiltersProps> = ({
  currentView,
  isMobile = false,
  selectedDate,
  onDateSelect,
  datePickerOpen,
  setDatePickerOpen,
  recentDates,
  goToToday,
  programs,
  selectedProgram,
  onProgramChange,
  programsLoading,
  filteredTeachers,
  selectedTeacher,
  onTeacherChange,
  teachersLoading,
  popoverContentProps,
}) => {

  const handleDateSelect = (date: Date) => {
    onDateSelect(date);
    setDatePickerOpen(false);
  };

  if (isMobile) {
    return (
      <div className="flex flex-col md:hidden gap-2">
        {/* First row: Filter by (50%) and Date (50%) - Only show in teacher view */}
        {currentView === "teacher" && (
          <div className="flex gap-2 mt-1">
            {/* Filter by label - 50% */}
            <div className="w-1/2 flex items-center gap-1 text-xs">
              <Filter className="h-3 w-3" />
              <span className="font-medium">Filter by:</span>
            </div>
            
            {/* Date Picker - 50% */}
            <div className="w-1/2">
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-full h-6 px-1 text-xs justify-center font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start" {...popoverContentProps}>
                    <div className="p-2 border-b">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToToday}
                        className="w-full h-8 text-xs"
                      >
                        <Clock className="mr-1 h-3 w-3" />
                        Today
                      </Button>
                    </div>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      defaultMonth={selectedDate}
                      onSelect={(date) => {
                        if (date) {
                          handleDateSelect(date);
                        }
                      }}
                      captionLayout="dropdown"
                      fromYear={2005}
                      toYear={2125}
                    />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        {/* Date Picker - mobile full width for classroom view */}
        {currentView === "classroom" && (
          <div className="w-full">
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-full h-6 px-1 text-xs justify-center font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start" {...popoverContentProps}>
                  <div className="p-2 border-b">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToToday}
                      className="w-full h-8 text-xs"
                    >
                      <Clock className="mr-1 h-3 w-3" />
                      Today
                    </Button>
                  </div>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    defaultMonth={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        handleDateSelect(date);
                      }
                    }}
                    captionLayout="dropdown"
                    fromYear={2005}
                    toYear={2125}
                  />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Program Filter - mobile full width - Only show in teacher view */}
        {currentView === "teacher" && (
          <div className="w-full">
            <Combobox
              options={[
                { value: "all", label: "All Programs" },
                ...programs.map((program) => ({
                  value: program.id.toString(),
                  label: program.name,
                }))
              ]}
              value={selectedProgram || "all"}
              onValueChange={(value) => onProgramChange(value === "all" ? "" : value)}
              placeholder={programsLoading ? "Loading..." : "Program"}
              searchPlaceholder="Search programs..."
              emptyText="No programs found."
              disabled={programsLoading}
              popoverContentProps={popoverContentProps}
            />
          </div>
        )}

        {/* Teacher Filter - mobile full width - Only show in teacher view */}
        {currentView === "teacher" && (
          <div className="w-full mb-2">
            <Combobox
              options={[
                { value: "all", label: "All Teachers" },
                ...filteredTeachers.map((teacher) => ({
                  value: teacher.id.toString(),
                  label: teacher.name,
                }))
              ]}
              value={selectedTeacher || "all"}
              onValueChange={(value) => onTeacherChange(value === "all" ? "" : value)}
              placeholder={teachersLoading ? "Loading..." : "Teacher"}
              searchPlaceholder="Search teachers..."
              emptyText="No teachers found."
              disabled={teachersLoading}
              popoverContentProps={popoverContentProps}
            />
          </div>
        )}
      </div>
    );
  }

  // Desktop Filters
  return (
    <div className="hidden md:flex items-center gap-2">
      {currentView === "teacher" && (
        <div className="flex items-center gap-1">
          <Filter className="h-3 w-3" />
          <span className="font-medium text-xs">Filters:</span>
        </div>
      )}

      {/* Date Picker - desktop */}
      <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-7 px-2 text-xs justify-start font-normal min-w-[180px] min-h-[34px]",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-1 h-3 w-3" />
            {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Pick date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" {...popoverContentProps}>
          <div className="flex">
            {/* Recent Dates Sidebar - Desktop Only */}
            <div className="w-32 p-2 border-r bg-gray-50 dark:bg-gray-800">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">Recent Dates</div>
              <div className="space-y-1">
                {recentDates.length === 0 ? (
                  <div className="text-xs text-gray-400 dark:text-gray-500">No recent dates</div>
                ) : (
                  recentDates.map((date) => (
                    <Button
                      key={date.toDateString()}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDateSelect(date)}
                      className="w-full h-6 text-xs justify-start p-1 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      {format(date, "MMM dd, yyyy")}
                    </Button>
                  ))
                )}
              </div>
            </div>
            
            {/* Main Calendar */}
            <div className="flex-1">
              <div className="p-2 border-b">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                  className="w-full h-8 text-xs"
                >
                  <Clock className="mr-1 h-3 w-3" />
                  Today
                </Button>
              </div>
              <Calendar
                mode="single"
                selected={selectedDate}
                defaultMonth={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    handleDateSelect(date);
                  }
                }}
                captionLayout="dropdown"
                fromYear={2005}
                toYear={2125}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Program Filter - desktop - Only show in teacher view */}
      {currentView === "teacher" && (
        <div className="min-w-[100px]">
            <Combobox
              options={[
                { value: "all", label: "All Programs" },
                ...programs.map((program) => ({
                  value: program.id.toString(),
                  label: program.name,
                }))
              ]}
              value={selectedProgram || "all"}
              onValueChange={(value) => onProgramChange(value === "all" ? "" : value)}
              placeholder={programsLoading ? "Loading..." : "Program"}
              searchPlaceholder="Search programs..."
              emptyText="No programs found."
              disabled={programsLoading}
              popoverContentProps={popoverContentProps}
            />
        </div>
      )}

      {/* Teacher Filter - desktop - Only show in teacher view */}
      {currentView === "teacher" && (
        <div className="min-w-[100px]">
            <Combobox
              options={[
                { value: "all", label: "All Teachers" },
                ...filteredTeachers.map((teacher) => ({
                  value: teacher.id.toString(),
                  label: teacher.name,
                }))
              ]}
              value={selectedTeacher || "all"}
              onValueChange={(value) => onTeacherChange(value === "all" ? "" : value)}
              placeholder={teachersLoading ? "Loading..." : "Teacher"}
              searchPlaceholder="Search teachers..."
              emptyText="No teachers found."
              disabled={teachersLoading}
              popoverContentProps={popoverContentProps}
            />
        </div>
      )}
    </div>
  );
};
