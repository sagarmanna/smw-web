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
import { LessonData } from "../../[id]/groupCourseTabConfigs";

interface SubstituteTeacherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLessons: LessonData[];
  onSave: (teacherId: string, lessonIds: string[]) => void;
}

interface MockTeacher {
  id: number;
  name: string;
}

const MOCK_TEACHERS: MockTeacher[] = [
  { id: 1, name: "Daniel Clain" },
  { id: 2, name: "Sarah Johnson" },
  { id: 3, name: "Michael Brown" },
  { id: 4, name: "Emily Davis" },
  { id: 5, name: "James Wilson" },
  { id: 6, name: "Lisa Anderson" },
];

export function SubstituteTeacherModal({
  open,
  onOpenChange,
  selectedLessons,
  onSave,
}: SubstituteTeacherModalProps) {
  const [selectedTeacher, setSelectedTeacher] = React.useState<string>("");

  const teacherOptions: SearchableSelectOption[] = React.useMemo(
    () =>
      MOCK_TEACHERS.map((teacher) => ({
        value: teacher.id.toString(),
        label: teacher.name,
      })),
    []
  );

  const handleSave = React.useCallback(() => {
    if (!selectedTeacher) return;
    
    const lessonIds = selectedLessons.map((lesson) => lesson.id);
    onSave(selectedTeacher, lessonIds);
    setSelectedTeacher("");
    onOpenChange(false);
  }, [selectedTeacher, selectedLessons, onSave, onOpenChange]);

  const handleCancel = React.useCallback(() => {
    setSelectedTeacher("");
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
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
              value={selectedTeacher}
              onValueChange={setSelectedTeacher}
              placeholder="Select Substitute Teacher"
              searchPlaceholder="Search teachers..."
              emptyText="No teachers available"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedTeacher}
            className="bg-primary hover:bg-primary/90"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

