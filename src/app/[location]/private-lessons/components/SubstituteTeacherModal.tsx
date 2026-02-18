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
import { toast } from "sonner";
import {
  getTeacherSubstituteTeachers,
  substituteLesson,
  type TeacherSubstituteTeacher,
  type SubstituteLessonResponse,
  type SubstituteLessonItem,
} from "../actionApi/teacherSubstitute.api";
import { extractErrorMessage } from "@/utils/api/createCrudApi";

interface SubstituteTeacherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: string;
  selectedLessons: PrivateLessonRow[];
  onSave: (
    teacherId: string,
    teacherName: string,
    lessonIds: number[],
    substituteResponse?: SubstituteLessonResponse
  ) => Promise<boolean>;
}

interface LessonWithConflict extends PrivateLessonRow {
  assignedTeacher: string;
  conflict?: string;
}

function mapApiLessonToRow(lesson: SubstituteLessonItem, conflict?: string): LessonWithConflict {
  return {
    id: lesson.id,
    date: lesson.date,
    student: lesson.studentName ?? "",
    program: lesson.programName ?? "",
    teacher: lesson.teacherName ?? "",
    duration: lesson.duration ?? "",
    online: "",
    status: String(lesson.status),
    payment: "",
    price: "",
    assignedTeacher: lesson.teacherName ?? "",
    conflict,
  };
}

export function SubstituteTeacherModal({
  open,
  onOpenChange,
  location,
  selectedLessons,
  onSave,
}: SubstituteTeacherModalProps) {
  const [selectedTeacher, setSelectedTeacher] = React.useState<string>("");
  const [teachers, setTeachers] = React.useState<TeacherSubstituteTeacher[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = React.useState(false);
  const [teachersLoadError, setTeachersLoadError] = React.useState<string | null>(null);
  const [reviewResponse, setReviewResponse] = React.useState<SubstituteLessonResponse | null>(null);
  const [isLoadingReview, setIsLoadingReview] = React.useState(false);
  const [reviewLoadError, setReviewLoadError] = React.useState<string | null>(null);

  // Load substitute teachers for selected lesson ids when modal opens (same pattern as other action APIs)
  React.useEffect(() => {
    if (!open || selectedLessons.length === 0) return;

    const lessonIds = selectedLessons.map((l) => l.id);
    let isCancelled = false;
    setTeachersLoadError(null);

    const fetchTeachers = async () => {
      setIsLoadingTeachers(true);
      try {
        const response = await getTeacherSubstituteTeachers(location, lessonIds);
        if (!isCancelled && response?.success && Array.isArray(response.data?.teachers)) {
          setTeachers(response.data.teachers);
        }
      } catch (error) {
        const message = extractErrorMessage(error, "Failed to load substitute teachers");
        if (!isCancelled) {
          setTeachers([]);
          setTeachersLoadError(message);
          toast.error(message);
        }
      } finally {
        if (!isCancelled) setIsLoadingTeachers(false);
      }
    };

    fetchTeachers();
    return () => { isCancelled = true; };
  }, [open, location, selectedLessons]);

  // Call review API when teacher is selected (GET with ids + teacherId)
  React.useEffect(() => {
    if (!open || !selectedTeacher || selectedLessons.length === 0) {
      setReviewResponse(null);
      setReviewLoadError(null);
      return;
    }

    const lessonIds = selectedLessons.map((l) => l.id);
    const teacherId = Number(selectedTeacher);
    let isCancelled = false;
    setReviewLoadError(null);

    const fetchReview = async () => {
      setIsLoadingReview(true);
      setReviewResponse(null);
      try {
        const response = await substituteLesson(location, { ids: lessonIds, teacherId });
        if (!isCancelled) setReviewResponse(response);
      } catch (error) {
        const message = extractErrorMessage(error, "Failed to load substitute review");
        if (!isCancelled) {
          setReviewResponse(null);
          setReviewLoadError(message);
          toast.error(message);
        }
      } finally {
        if (!isCancelled) setIsLoadingReview(false);
      }
    };

    fetchReview();
    return () => { isCancelled = true; };
  }, [open, location, selectedTeacher, selectedLessons]);

  const teacherOptions: SearchableSelectOption[] = React.useMemo(
    () => teachers.map((t) => ({ value: String(t.id), label: t.name })),
    [teachers]
  );

  const selectedTeacherName = React.useMemo(() => {
    if (!selectedTeacher) return "";
    const t = teachers.find((x) => String(x.id) === selectedTeacher);
    return t?.name ?? "";
  }, [selectedTeacher, teachers]);

  const isExpanded = !!selectedTeacher;

  const lessonsWithConflicts = React.useMemo<LessonWithConflict[]>(() => {
    if (!isExpanded || !reviewResponse?.data?.lessons) return [];
    const lessons = reviewResponse.data.lessons;
    const conflicts = reviewResponse.data.conflicts ?? {};
    return lessons.map((lesson) => {
      const msgs = conflicts[String(lesson.id)];
      const conflict = Array.isArray(msgs) ? msgs.join("; ") : undefined;
      return mapApiLessonToRow(lesson, conflict);
    });
  }, [isExpanded, reviewResponse]);

  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = React.useCallback(async () => {
    if (!selectedTeacher || !selectedTeacherName) return;

    const lessonIds = selectedLessons.map((lesson) => lesson.id);
    setIsSaving(true);
    try {
      const ok = await onSave(selectedTeacher, selectedTeacherName, lessonIds, reviewResponse ?? undefined);
      if (ok) {
        setSelectedTeacher("");
        setReviewResponse(null);
        onOpenChange(false);
      }
    } finally {
      setIsSaving(false);
    }
  }, [selectedTeacher, selectedTeacherName, selectedLessons, reviewResponse, onSave, onOpenChange]);

  const handleCancel = React.useCallback(() => {
    setSelectedTeacher("");
    onOpenChange(false);
  }, [onOpenChange]);

  React.useEffect(() => {
    if (!open) {
      setSelectedTeacher("");
      setReviewResponse(null);
      setTeachersLoadError(null);
      setReviewLoadError(null);
    }
  }, [open]);

  const columns = React.useMemo<ColumnDef<LessonWithConflict>[]>(() => {
    return [
      { accessorKey: "assignedTeacher", header: "Teacher", cell: ({ row }) => row.original.assignedTeacher },
      { accessorKey: "student", header: "Student", cell: ({ row }) => row.original.student },
      { accessorKey: "program", header: "Program", cell: ({ row }) => row.original.program },
      { accessorKey: "date", header: "Date/Time", cell: ({ row }) => row.original.date },
      { accessorKey: "duration", header: "Duration", cell: ({ row }) => row.original.duration },
      {
        id: "conflict",
        header: "Conflict",
        cell: ({ row }) => {
          const conflict = row.original.conflict;
          if (!conflict) return <span className="text-muted-foreground text-xs">-</span>;
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
        cell: () => (
          <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:text-primary" onClick={() => {}}>
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
          <DialogTitle className="text-xl font-semibold">Substitute Teacher</DialogTitle>
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
            {teachersLoadError && (
              <p className="text-destructive text-sm" role="alert">
                {teachersLoadError}
              </p>
            )}
          </div>

          {isExpanded && (
            <div className="mt-4">
              {reviewLoadError && (
                <p className="text-destructive text-sm mb-2" role="alert">
                  {reviewLoadError}
                </p>
              )}
              {isLoadingReview ? (
                <p className="text-muted-foreground text-sm py-4">Loading review…</p>
              ) : lessonsWithConflicts.length > 0 ? (
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
              ) : (
                <p className="text-muted-foreground text-sm py-4">No lessons in review response.</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedTeacher || selectedLessons.length === 0 || isSaving || isLoadingReview}
            className="bg-primary hover:bg-primary/90"
          >
            {isSaving ? "Confirming…" : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
