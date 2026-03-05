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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/components/ui/searchable-select";
import { GroupCourseRow } from "../../types";
import { getPrograms, type ProgramRow } from "@/app/[location]/programs/programs.api";
import { getTeachersByProgram, type Teacher } from "@/app/[location]/schedule/schedule.api";
import { toast } from "sonner";
import { DurationPicker } from "@/components/DurationPicker";

interface AddGroupCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (course: Partial<GroupCourseRow>) => void;
  location: string;
}

const toOptions = (items: { id: number; name: string }[]): SearchableSelectOption[] =>
  items.map((item) => ({ value: item.id.toString(), label: item.name }));

export function AddGroupCourseModal({
  isOpen,
  onClose,
  onSuccess,
  location,
}: AddGroupCourseModalProps) {
  const [selectedProgramId, setSelectedProgramId] = React.useState<string>("");
  const [selectedTeacherId, setSelectedTeacherId] = React.useState<string>("");
  const [programOptions, setProgramOptions] = React.useState<SearchableSelectOption[]>([]);
  const [teacherOptions, setTeacherOptions] = React.useState<SearchableSelectOption[]>([]);
  const [duration, setDuration] = React.useState<string>("00:30");
  const [numberOfWeeks, setNumberOfWeeks] = React.useState<string>("");
  const [isOnline, setIsOnline] = React.useState<boolean>(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [isLoadingPrograms, setIsLoadingPrograms] = React.useState(false);
  const [isLoadingTeachers, setIsLoadingTeachers] = React.useState(false);

  const loadPrograms = React.useCallback(async () => {
    setIsLoadingPrograms(true);
    try {
      const response = await getPrograms(location, {
        type: "GROUP",
        showAll: false,
        page: 1,
        limit: 99999,
      });

      if (response?.success && response.data?.body) {
        const options = toOptions(
          response.data.body.map((p: ProgramRow) => ({
            id: p.id,
            name: p.name,
          }))
        );
        setProgramOptions(options);
      } else {
        toast.error(response?.message || "Failed to load programs");
        setProgramOptions([]);
      }
    } catch (error) {
      console.error("Error loading programs:", error);
      toast.error("Failed to load programs");
      setProgramOptions([]);
    } finally {
      setIsLoadingPrograms(false);
    }
  }, [location]);

  const loadTeachers = React.useCallback(async (programId: number) => {
    setIsLoadingTeachers(true);
    setSelectedTeacherId(""); // Clear teacher selection when program changes
    try {
      const response = await getTeachersByProgram(location, programId);

      if (response?.success && response.data) {
        const options = toOptions(
          response.data.map((t: Teacher) => ({
            id: t.id,
            name: t.name,
          }))
        );
        setTeacherOptions(options);
      } else {
        // Don't show error toast if teachers list is empty (might be valid)
        setTeacherOptions([]);
      }
    } catch (error) {
      console.error("Error loading teachers:", error);
      setTeacherOptions([]);
    } finally {
      setIsLoadingTeachers(false);
    }
  }, [location]);

  // Fetch programs when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedProgramId("");
      setSelectedTeacherId("");
      setTeacherOptions([]);
      setDuration("00:30");
      setNumberOfWeeks("");
      setIsOnline(false);
      setSubmitting(false);
      loadPrograms();
    } else {
      // Reset state when modal closes
      setProgramOptions([]);
      setTeacherOptions([]);
    }
  }, [isOpen, loadPrograms]);

  // Fetch teachers when program is selected
  React.useEffect(() => {
    if (isOpen && selectedProgramId) {
      const programId = parseInt(selectedProgramId, 10);
      if (!isNaN(programId)) {
        loadTeachers(programId);
      }
    } else {
      setTeacherOptions([]);
      setSelectedTeacherId("");
    }
  }, [isOpen, selectedProgramId, loadTeachers]);

  const handleProgramChange = (value: string) => {
    setSelectedProgramId(value);
    // Teacher will be cleared and loaded via useEffect
  };

  const handleTeacherChange = (value: string) => {
    setSelectedTeacherId(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgramId || !selectedTeacherId || !numberOfWeeks || parseInt(numberOfWeeks, 10) < 1) {
      if (!numberOfWeeks || parseInt(numberOfWeeks, 10) < 1) {
        toast.error("Please enter a valid number of weeks");
      }
      return;
    }
    setSubmitting(true);

    // Find selected program and teacher from current options
    const selectedProgram = programOptions.find(
      (p) => p.value === selectedProgramId
    );
    const selectedTeacher = teacherOptions.find(
      (t) => t.value === selectedTeacherId
    );

    const course: Partial<GroupCourseRow> = {
      programId: selectedProgram ? parseInt(selectedProgramId, 10) : undefined,
      program: selectedProgram?.label,
      teacherId: selectedTeacher ? parseInt(selectedTeacherId, 10) : undefined,
      teacher: selectedTeacher?.label ?? "",
      duration,
      numberOfWeeks: parseInt(numberOfWeeks, 10),
      isOnline,
      // These will be filled by the real API later
    };

    onSuccess?.(course);
    setSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !submitting && onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Create Group Course</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="program">Program</Label>
            <SearchableSelect
              id="program"
              options={programOptions}
              value={selectedProgramId}
              onValueChange={handleProgramChange}
              placeholder="Select Program"
              searchPlaceholder="Search programs..."
              emptyText="No programs available"
              className="w-full"
              disabled={isLoadingPrograms}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacher">Teacher</Label>
            <SearchableSelect
              id="teacher"
              options={teacherOptions}
              value={selectedTeacherId}
              onValueChange={handleTeacherChange}
              placeholder={
                selectedProgramId ? "Select Teacher" : "Select a program first"
              }
              searchPlaceholder="Search teachers..."
              emptyText={
                selectedProgramId
                  ? "No teachers found for this program"
                  : "Select a program first"
              }
              className="w-full"
              disabled={!selectedProgramId || isLoadingTeachers}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="duration">Duration</Label>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <DurationPicker
                  value={duration}
                  onChange={(value) => setDuration(value)}
                />
                <span className="text-sm text-muted-foreground">mins.</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numberOfWeeks">
              Number Of Weeks <span className="text-red-500">*</span>
            </Label>
            <Input
              id="numberOfWeeks"
              type="number"
              min={1}
              value={numberOfWeeks}
              onChange={(e) => setNumberOfWeeks(e.target.value)}
              placeholder="Enter number of weeks"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isOnline"
              checked={isOnline}
              onCheckedChange={(checked) =>
                setIsOnline(checked === true || checked === "indeterminate")
              }
            />
            <Label htmlFor="isOnline" className="cursor-pointer">
              Is Online
            </Label>
          </div>

          <DialogFooter className="mt-4">
            <div className="flex w-full justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || !selectedProgramId || !selectedTeacherId || !numberOfWeeks || parseInt(numberOfWeeks, 10) < 1}>
                Next
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


