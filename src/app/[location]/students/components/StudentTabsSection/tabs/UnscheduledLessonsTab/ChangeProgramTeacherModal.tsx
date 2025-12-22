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
import { getProgramsList, type Program } from "@/app/[location]/teachers/teachers.api";
import { getTeachersByProgram } from "@/app/[location]/schedule/schedule.api";
import { changeLessons } from "./unscheduled-lessons.api";
import { toast } from "sonner";

interface ChangeProgramTeacherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  location: string;
  initialProgramName?: string;
  selectedLessonIds: number[];
  onSuccess?: () => void;
}

export function ChangeProgramTeacherModal({
  open,
  onOpenChange,
  selectedCount,
  location,
  initialProgramName,
  selectedLessonIds,
  onSuccess,
}: ChangeProgramTeacherModalProps) {
  const [programs, setPrograms] = React.useState<Program[]>([]);
  const [teachers, setTeachers] = React.useState<Array<{ id: number; name: string }>>([]);
  const [loadingPrograms, setLoadingPrograms] = React.useState(false);
  const [loadingTeachers, setLoadingTeachers] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [selectedProgramId, setSelectedProgramId] = React.useState<string>("");
  const [selectedTeacherId, setSelectedTeacherId] = React.useState<string>("");

  // Reset when modal closes
  React.useEffect(() => {
    if (!open) {
      setSelectedProgramId("");
      setSelectedTeacherId("");
      setTeachers([]);
    }
  }, [open]);

  // Fetch programs when modal opens
  React.useEffect(() => {
    if (!open) return;

    const fetchPrograms = async () => {
      setLoadingPrograms(true);
      try {
        // Use private programs list as unscheduled lessons are tied to private lessons
        const programList = await getProgramsList("private");
        setPrograms(programList);

        if (programList.length > 0) {
          // If we have an initial program name from the selected lesson, try to match it
          if (initialProgramName && initialProgramName.trim().length > 0) {
            const matchedProgram = programList.find(
              (p) => p.name.toLowerCase() === initialProgramName.toLowerCase()
            );
            if (matchedProgram) {
              setSelectedProgramId(matchedProgram.id.toString());
              return;
            }
          }

          // Fallback to first program
          setSelectedProgramId(programList[0].id.toString());
        }
      } catch (error) {
        console.error("Error fetching programs for ChangeProgramTeacherModal:", error);
      } finally {
        setLoadingPrograms(false);
      }
    };

    fetchPrograms();
  }, [open, initialProgramName]);

  // Fetch teachers when program is selected
  React.useEffect(() => {
    if (!open) return;

    // Don't fetch teachers if no program is selected
    if (!selectedProgramId) {
      setTeachers([]);
      setSelectedTeacherId(""); // Clear selected teacher when program is cleared
      return;
    }

    let isMounted = true;

    const fetchTeachers = async () => {
      setLoadingTeachers(true);
      try {
        const programId = parseInt(selectedProgramId, 10);
        if (isNaN(programId)) {
          if (!isMounted) return;
          setLoadingTeachers(false);
          return;
        }

        const response = await getTeachersByProgram(location, programId);
        if (!isMounted) return;

        if (response?.success && response.data) {
          const teachersList = response.data.map((t) => ({ id: t.id, name: t.name || "" }));
          setTeachers(teachersList);
          // Clear selected teacher if it's not in the new list
          setSelectedTeacherId((prev) => {
            if (prev && !response.data.some((t) => t.id.toString() === prev)) {
              return "";
            }
            return prev;
          });
        } else {
          setTeachers([]);
          setSelectedTeacherId("");
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Error fetching teachers for ChangeProgramTeacherModal:", error);
        setTeachers([]);
        setSelectedTeacherId("");
      } finally {
        if (isMounted) {
          setLoadingTeachers(false);
        }
      }
    };

    fetchTeachers();

    return () => {
      isMounted = false;
    };
  }, [open, location, selectedProgramId]);

  const programOptions = React.useMemo<SearchableSelectOption[]>(
    () => programs.map((p) => ({ value: p.id.toString(), label: p.name })),
    [programs]
  );

  const teacherOptions = React.useMemo<SearchableSelectOption[]>(
    () => teachers.map((t) => ({ value: t.id.toString(), label: t.name || "" })),
    [teachers]
  );

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  const handleSave = async () => {
    // Validate inputs
    if (!selectedProgramId || !selectedTeacherId) {
      toast.error("Please select both program and teacher");
      return;
    }

    if (selectedLessonIds.length === 0) {
      toast.error("No lessons selected");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await changeLessons(
        location,
        selectedLessonIds,
        {
          programId: parseInt(selectedProgramId, 10),
          teacherId: parseInt(selectedTeacherId, 10),
        }
      );

      if (response.success) {
        toast.success(
          response.message || `Successfully changed ${response.data?.processedCount || selectedCount} lesson(s)`
        );
        onOpenChange(false);
        // Call onSuccess callback to refresh data
        if (onSuccess) {
          onSuccess();
        }
      } else {
        // Handle validation errors
        if (response.errors) {
          const errorMessages = Object.values(response.errors).flat();
          toast.error(errorMessages.join(", ") || "Failed to change lessons");
        } else {
          toast.error(response.message || "Failed to change lessons");
        }
      }
    } catch (error) {
      console.error("Error changing lessons:", error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred while changing lessons";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Change Program Teacher</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {selectedCount > 0 && (
            <p className="text-sm text-muted-foreground">
              Applying changes to <span className="font-semibold">{selectedCount}</span>{" "}
              selected {selectedCount === 1 ? "lesson" : "lessons"}.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Program</Label>
              <SearchableSelect
                id="change-program"
                options={programOptions}
                value={selectedProgramId}
                onValueChange={setSelectedProgramId}
                placeholder="Select program"
                searchPlaceholder="Search programs..."
                emptyText="No programs available"
                loadingText="Loading programs..."
                noResultsText="No programs found"
                className="w-full"
                disabled={loadingPrograms}
                isLoading={loadingPrograms}
              />
            </div>

            <div className="space-y-2">
              <Label>Teacher</Label>
              <SearchableSelect
                id="change-teacher"
                options={teacherOptions}
                value={selectedTeacherId}
                onValueChange={setSelectedTeacherId}
                placeholder="Select teacher"
                searchPlaceholder="Search teachers..."
                emptyText="No teachers available"
                loadingText="Loading teachers..."
                noResultsText="No teachers found"
                className="w-full"
                disabled={loadingTeachers}
                isLoading={loadingTeachers}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting || !selectedProgramId || !selectedTeacherId}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

