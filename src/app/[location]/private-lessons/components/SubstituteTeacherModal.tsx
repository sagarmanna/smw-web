"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/components/ui/searchable-select";
import { PrivateLessonRow } from "../privateLessonsListing.api";
import { Pencil } from "lucide-react";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { getTeachersList, type Teacher } from "@/app/[location]/schedule/schedule.api";

interface SubstituteTeacherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: string;
  selectedLessons: PrivateLessonRow[];
  onSave: (teacherId: string, teacherName: string, lessonIds: number[]) => void;
}

interface LessonWithConflict extends PrivateLessonRow {
  assignedTeacher: string;
  conflict?: string;
}

// Mock conflict detection - in real app, this would call an API
const detectConflict = (
  lesson: PrivateLessonRow,
  teacherName: string
): string | undefined => {
  // Simple mock logic:
  // - If substitute is same as original teacher, show "occupied with another lesson"
  // - Otherwise, warn that teacher is unscheduled (no real schedule check yet)
  if (!teacherName) return undefined;
  if (teacherName === lesson.teacher) {
    return "Teacher occupied with another lesson";
  }
  return "Warning: Teacher Unscheduled";
};

export function SubstituteTeacherModal({
  open,
  onOpenChange,
  location,
  selectedLessons,
  onSave,
}: SubstituteTeacherModalProps) {
  const [selectedTeacher, setSelectedTeacher] = React.useState<string>("");
  const [teachers, setTeachers] = React.useState<Teacher[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = React.useState(false);

  // Load teachers when modal opens
  React.useEffect(() => {
    if (!open) return;

    let isCancelled = false;

    const fetchTeachers = async () => {
      setIsLoadingTeachers(true);
      try {
        const response = await getTeachersList(location);
        if (!isCancelled && response?.success && Array.isArray(response.data)) {
          setTeachers(response.data);
        }
      } catch (error) {
        console.error("Failed to load teachers for substitute modal:", error);
        if (!isCancelled) {
          setTeachers([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingTeachers(false);
        }
      }
    };

    fetchTeachers();

    return () => {
      isCancelled = true;
    };
  }, [open, location]);

  const teacherOptions: SearchableSelectOption[] = React.useMemo(
    () =>
      teachers.map((teacher) => ({
        value: teacher.id.toString(),
        label: teacher.name,
      })),
    [teachers]
  );

  // Get selected teacher name
  const selectedTeacherName = React.useMemo(() => {
    if (!selectedTeacher) return "";
    const teacher = teachers.find((t) => t.id.toString() === selectedTeacher);
    return teacher?.name || "";
  }, [selectedTeacher, teachers]);

  // Determine if modal should be expanded (when teacher is selected)
  const isExpanded = !!selectedTeacher;

  // Prepare lessons with assigned teacher and conflicts
  const lessonsWithConflicts = React.useMemo<LessonWithConflict[]>(() => {
    if (!isExpanded) return [];
    return selectedLessons.map((lesson) => ({
      ...lesson,
      assignedTeacher: selectedTeacherName,
      conflict: detectConflict(lesson, selectedTeacherName),
    }));
  }, [selectedLessons, selectedTeacherName, isExpanded]);

  const handleSave = React.useCallback(() => {
    if (!selectedTeacher || !selectedTeacherName) return;

    const lessonIds = selectedLessons.map((lesson) => lesson.id);
    onSave(selectedTeacher, selectedTeacherName, lessonIds);
    setSelectedTeacher("");
    onOpenChange(false);
  }, [selectedTeacher, selectedLessons, onSave, onOpenChange]);

  const handleCancel = React.useCallback(() => {
    setSelectedTeacher("");
    onOpenChange(false);
  }, [onOpenChange]);

  // Reset selected teacher when modal closes
  React.useEffect(() => {
    if (!open) {
      setSelectedTeacher("");
    }
  }, [open]);

  const columns = React.useMemo<ColumnDef<LessonWithConflict>[]>(() => {
    return [
      {
        accessorKey: "assignedTeacher",
        header: "Teacher",
        cell: ({ row }) => row.original.assignedTeacher,
      },
      {
        accessorKey: "student",
        header: "Student",
        cell: ({ row }) => row.original.student,
      },
      {
        accessorKey: "program",
        header: "Program",
        cell: ({ row }) => row.original.program,
      },
      {
        accessorKey: "date",
        header: "Date/Time",
        cell: ({ row }) => row.original.date,
      },
      {
        accessorKey: "duration",
        header: "Duration",
        cell: ({ row }) => row.original.duration,
      },
      {
        id: "conflict",
        header: "Conflict",
        cell: ({ row }) => {
          const conflict = row.original.conflict;
          if (!conflict) {
            return <span className="text-muted-foreground text-xs">-</span>;
          }

          const isWarning = conflict.includes("Warning");

          return (
            <span
              className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                isWarning
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              {conflict}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-primary hover:text-primary"
            onClick={() => {
              // Placeholder – hook into conflict editing when available
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        ),
      },
    ];
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Substitute Teacher
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="substitute-teacher">Substitute Teacher</Label>
            <SearchableSelect
              id="substitute-teacher"
              options={teacherOptions}
              isLoading={isLoadingTeachers}
              value={selectedTeacher}
              onValueChange={setSelectedTeacher}
              placeholder="Select Substitute Teacher"
              searchPlaceholder="Search teachers..."
              emptyText="No teachers available"
            />
          </div>

          {isExpanded && lessonsWithConflicts.length > 0 && (
            <div className="mt-4">
              <CustomTable<LessonWithConflict, unknown>
                data={lessonsWithConflicts}
                columns={columns}
                size="compact"
                variant="default"
                stickyHeader={true}
                enableSearch={false}
                enableFilter={false}
                enableExport={false}
                enablePrint={false}
                enableRowsPerPage={false}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedTeacher || selectedLessons.length === 0}
            className="bg-primary hover:bg-primary/90"
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


