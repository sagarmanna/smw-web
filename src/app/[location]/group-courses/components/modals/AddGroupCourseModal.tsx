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

interface AddGroupCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (course: Partial<GroupCourseRow>) => void;
}

interface MockProgram {
  id: number;
  name: string;
}

interface MockTeacher {
  id: number;
  name: string;
  programId: number;
}

const MOCK_PROGRAMS: MockProgram[] = [
  { id: 1, name: "Band" },
  { id: 2, name: "Guitar" },
  { id: 3, name: "Piano" },
  { id: 4, name: "Drums" },
  { id: 5, name: "Voice" },
  { id: 6, name: "Violin" },
  { id: 7, name: "Saxophone" },
];

const MOCK_TEACHERS: MockTeacher[] = [
  { id: 1, name: "Daniel Clain", programId: 1 },
  { id: 2, name: "Sarah Johnson", programId: 2 },
  { id: 3, name: "Michael Chen", programId: 3 },
  { id: 4, name: "David Martinez", programId: 4 },
  { id: 5, name: "Emily Davis", programId: 5 },
  { id: 6, name: "Robert Wilson", programId: 6 },
  { id: 7, name: "Lisa Anderson", programId: 7 },
];

const toOptions = (items: { id: number; name: string }[]): SearchableSelectOption[] =>
  items.map((item) => ({ value: item.id.toString(), label: item.name }));

export function AddGroupCourseModal({
  isOpen,
  onClose,
  onSuccess,
}: AddGroupCourseModalProps) {
  const [selectedProgramId, setSelectedProgramId] = React.useState<string>("");
  const [selectedTeacherId, setSelectedTeacherId] = React.useState<string>("");
  const [teacherOptions, setTeacherOptions] = React.useState<SearchableSelectOption[]>([]);
  const [duration, setDuration] = React.useState<string>("01:00");
  const [numberOfWeeks, setNumberOfWeeks] = React.useState<string>("");
  const [isOnline, setIsOnline] = React.useState<boolean>(false);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedProgramId("");
      setSelectedTeacherId("");
      setTeacherOptions([]);
      setDuration("01:00");
      setNumberOfWeeks("");
      setIsOnline(false);
      setSubmitting(false);
    }
  }, [isOpen]);

  const programOptions = React.useMemo(
    () => toOptions(MOCK_PROGRAMS),
    []
  );

  const handleProgramChange = (value: string) => {
    setSelectedProgramId(value);
    setSelectedTeacherId("");

    const programId = parseInt(value, 10);
    const teachersForProgram = MOCK_TEACHERS.filter(
      (t) => t.programId === programId
    );
    setTeacherOptions(toOptions(teachersForProgram));
  };

  const handleTeacherChange = (value: string) => {
    setSelectedTeacherId(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgramId || !selectedTeacherId) {
      return;
    }
    setSubmitting(true);

    const program = MOCK_PROGRAMS.find(
      (p) => p.id.toString() === selectedProgramId
    );
    const teacher = MOCK_TEACHERS.find(
      (t) => t.id.toString() === selectedTeacherId
    );

    const course: Partial<GroupCourseRow> = {
      programId: program?.id,
      program: program?.name,
      teacherId: teacher?.id,
      teacher: teacher?.name ?? "",
      duration,
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
          <DialogTitle>Add Group Course</DialogTitle>
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
              disabled={!selectedProgramId}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="HH:MM"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="numberOfWeeks">Number Of Weeks</Label>
            <Input
              id="numberOfWeeks"
              type="number"
              min={1}
              value={numberOfWeeks}
              onChange={(e) => setNumberOfWeeks(e.target.value)}
              placeholder="Enter number of weeks"
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
              <Button type="submit" disabled={submitting || !selectedProgramId || !selectedTeacherId}>
                Next
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


