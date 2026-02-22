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
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { LessonData } from "../../[id]/groupCourseTabConfigs";
import {
  getTeacherSubstituteTeachers,
  substituteLesson,
  confirmTeacherSubstitute,
  type TeacherSubstituteTeacher,
  type SubstituteLessonResponse,
  type SubstituteLessonItem,
} from "../../../private-lessons/actionApi/teacherSubstitute.api";
import { extractErrorMessage } from "@/utils/api/createCrudApi";
import { toast } from "sonner";

interface SubstituteTeacherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: string;
  selectedLessons: LessonData[];
  onSuccess?: () => void;
}

interface LessonRow {
  id: number;
  teacherName: string;
  programName: string;
  studentName: string;
  date: string;
  duration: string;
  conflict?: string;
}

function mapApiLessonToRow(
  lesson: SubstituteLessonItem,
  conflict?: string
): LessonRow {
  return {
    id: lesson.id,
    teacherName: lesson.teacherName ?? "",
    programName: lesson.programName ?? "",
    studentName: lesson.studentName ?? "",
    date: lesson.date ?? "",
    duration: lesson.duration ?? "",
    conflict,
  };
}

export function SubstituteTeacherModal({
  open,
  onOpenChange,
  location,
  selectedLessons,
  onSuccess,
}: SubstituteTeacherModalProps) {
  const [selectedTeacher, setSelectedTeacher] = React.useState<string>("");
  const [teachers, setTeachers] = React.useState<TeacherSubstituteTeacher[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = React.useState(false);
  const [teachersLoadError, setTeachersLoadError] = React.useState<string | null>(
    null
  );
  const [reviewResponse, setReviewResponse] =
    React.useState<SubstituteLessonResponse | null>(null);
  const [isLoadingReview, setIsLoadingReview] = React.useState(false);
  const [reviewLoadError, setReviewLoadError] = React.useState<string | null>(
    null
  );
  const [isConfirming, setIsConfirming] = React.useState(false);

  const lessonIds = React.useMemo(() => {
    return selectedLessons
      .map((l) => Number(l.id))
      .filter((id) => !Number.isNaN(id));
  }, [selectedLessons]);

  // Load substitute teachers when modal opens
  React.useEffect(() => {
    if (!open || lessonIds.length === 0) return;

    let isCancelled = false;
    setTeachersLoadError(null);
    setReviewResponse(null);
    setSelectedTeacher("");

    const fetchTeachers = async () => {
      setIsLoadingTeachers(true);
      try {
        const response = await getTeacherSubstituteTeachers(location, lessonIds);
        if (
          !isCancelled &&
          response?.success &&
          Array.isArray(response.data?.teachers)
        ) {
          setTeachers(response.data.teachers);
        }
      } catch (error) {
        const message = extractErrorMessage(
          error,
          "Failed to load substitute teachers"
        );
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
    return () => {
      isCancelled = true;
    };
  }, [open, location, lessonIds]);

  // Create drafts and load review when teacher is selected
  React.useEffect(() => {
    if (!open || !selectedTeacher || lessonIds.length === 0) {
      setReviewResponse(null);
      setReviewLoadError(null);
      return;
    }

    const teacherId = Number(selectedTeacher);
    if (Number.isNaN(teacherId)) return;

    let isCancelled = false;
    setReviewLoadError(null);

    const fetchReview = async () => {
      setIsLoadingReview(true);
      setReviewResponse(null);
      try {
        const response = await substituteLesson(location, {
          ids: lessonIds,
          teacherId,
        });
        if (!isCancelled) setReviewResponse(response);
      } catch (error) {
        const message = extractErrorMessage(
          error,
          "Failed to load substitute review"
        );
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
    return () => {
      isCancelled = true;
    };
  }, [open, location, selectedTeacher, lessonIds]);

  const teacherOptions: SearchableSelectOption[] = React.useMemo(
    () => teachers.map((t) => ({ value: String(t.id), label: t.name })),
    [teachers]
  );

  const hasBlockingConflicts = Boolean(
    reviewResponse?.data?.conflictedLessonIds?.length
  );

  const lessonsTableData = React.useMemo<LessonRow[]>(() => {
    if (!reviewResponse?.data?.lessons) return [];
    const lessons = reviewResponse.data.lessons;
    const conflicts = reviewResponse.data.conflicts ?? {};
    return lessons.map((lesson) => {
      const msgs = conflicts[String(lesson.id)];
      const conflict = Array.isArray(msgs) ? msgs.join("; ") : undefined;
      return mapApiLessonToRow(lesson, conflict);
    });
  }, [reviewResponse]);

  const columns = React.useMemo<ColumnDef<LessonRow>[]>(
    () => [
      { accessorKey: "teacherName", header: "Teacher" },
      { accessorKey: "programName", header: "Program" },
      { accessorKey: "studentName", header: "Student" },
      { accessorKey: "date", header: "Date/Time" },
      { accessorKey: "duration", header: "Duration" },
      {
        id: "conflict",
        header: "Conflict",
        cell: ({ row }) => {
          const conflict = row.original.conflict;
          if (!conflict)
            return (
              <span className="text-muted-foreground text-xs">-</span>
            );
          const isWarning = conflict.includes("Warning");
          return (
            <span
              className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
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
    ],
    []
  );

  const handleConfirm = React.useCallback(async () => {
    if (
      !selectedTeacher ||
      !reviewResponse?.data?.newLessonIds?.length ||
      hasBlockingConflicts
    )
      return;

    setIsConfirming(true);
    try {
      await confirmTeacherSubstitute(location, {
        ids: lessonIds,
        newLessonIds: reviewResponse.data.newLessonIds,
      });
      toast.success("Lessons are substituted to the selected teacher");
      onSuccess?.();
      setSelectedTeacher("");
      setReviewResponse(null);
      onOpenChange(false);
    } catch (error) {
      const message = extractErrorMessage(
        error,
        "Failed to confirm teacher substitution"
      );
      toast.error(message);
    } finally {
      setIsConfirming(false);
    }
  }, [
    selectedTeacher,
    reviewResponse,
    hasBlockingConflicts,
    location,
    lessonIds,
    onSuccess,
    onOpenChange,
  ]);

  const handleCancel = React.useCallback(() => {
    setSelectedTeacher("");
    setReviewResponse(null);
    setTeachersLoadError(null);
    setReviewLoadError(null);
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

  const canConfirm =
    selectedTeacher &&
    reviewResponse?.data?.newLessonIds?.length &&
    !hasBlockingConflicts &&
    !isLoadingReview &&
    !isConfirming;

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
            {teachersLoadError && (
              <p className="text-destructive text-sm" role="alert">
                {teachersLoadError}
              </p>
            )}
          </div>

          {selectedTeacher && (
            <div className="mt-4">
              {reviewLoadError && (
                <p className="text-destructive text-sm mb-2" role="alert">
                  {reviewLoadError}
                </p>
              )}
              {isLoadingReview ? (
                <p className="text-muted-foreground text-sm py-4">
                  Loading review…
                </p>
              ) : lessonsTableData.length > 0 ? (
                <>
                  <CustomTable<LessonRow, unknown>
                    data={lessonsTableData}
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
                  {hasBlockingConflicts && (
                    <p className="text-destructive text-sm mt-2">
                      Resolve all blocking conflicts before confirming.
                    </p>
                  )}
                </>
              ) : null}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="bg-primary hover:bg-primary/90"
          >
            {isConfirming ? "Confirming…" : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
