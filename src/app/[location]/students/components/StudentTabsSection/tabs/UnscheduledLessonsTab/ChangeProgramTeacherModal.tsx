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
import { getTeachersList } from "@/app/[location]/schedule/schedule.api";

interface ChangeProgramTeacherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  location: string;
  initialProgramName?: string;
}

export function ChangeProgramTeacherModal({
  open,
  onOpenChange,
  selectedCount,
  location,
  initialProgramName,
}: ChangeProgramTeacherModalProps) {
  const [programs, setPrograms] = React.useState<Program[]>([]);
  const [teachers, setTeachers] = React.useState<Array<{ id: number; name: string }>>([]);
  const [loadingPrograms, setLoadingPrograms] = React.useState(false);
  const [loadingTeachers, setLoadingTeachers] = React.useState(false);

  const [selectedProgramId, setSelectedProgramId] = React.useState<string>("");
  const [selectedTeacherId, setSelectedTeacherId] = React.useState<string>("");

  // Reset when modal closes
  React.useEffect(() => {
    if (!open) {
      setSelectedProgramId("");
      setSelectedTeacherId("");
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

  // Fetch teachers when modal opens
  React.useEffect(() => {
    if (!open) return;

    const fetchTeachers = async () => {
      setLoadingTeachers(true);
      try {
        const response = await getTeachersList(location);
        if (response?.success && response.data) {
          setTeachers(response.data);
          if (response.data.length > 0) {
            setSelectedTeacherId(response.data[0].id.toString());
          }
        }
      } catch (error) {
        console.error("Error fetching teachers for ChangeProgramTeacherModal:", error);
      } finally {
        setLoadingTeachers(false);
      }
    };

    fetchTeachers();
  }, [open, location]);

  const programOptions = React.useMemo<SearchableSelectOption[]>(
    () => programs.map((p) => ({ value: p.id.toString(), label: p.name })),
    [programs]
  );

  const teacherOptions = React.useMemo<SearchableSelectOption[]>(
    () => teachers.map((t) => ({ value: t.id.toString(), label: t.name || "" })),
    [teachers]
  );

  const selectedProgramName = React.useMemo(
    () => programs.find((p) => p.id.toString() === selectedProgramId)?.name ?? "",
    [programs, selectedProgramId]
  );

  const selectedTeacherName = React.useMemo(
    () => teachers.find((t) => t.id.toString() === selectedTeacherId)?.name ?? "",
    [teachers, selectedTeacherId]
  );

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSave = () => {
    // TODO: Wire up to API when endpoint is available
    // For now, just log the intended change
    console.log("Change Program/Teacher for lessons:", {
      selectedCount,
      programId: selectedProgramId || null,
      programName: selectedProgramName,
      teacherId: selectedTeacherId || null,
      teacherName: selectedTeacherName,
    });
    onOpenChange(false);
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
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

