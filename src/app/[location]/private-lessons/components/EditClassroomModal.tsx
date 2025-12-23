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
import type { PrivateLessonRow } from "../privateLessonsListing.api";
import { getClassroomViewResources, type ClassroomViewResource } from "@/app/[location]/schedule/schedule.api";

interface EditClassroomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: string;
  selectedLessons: PrivateLessonRow[];
  onSave: (classroomId: string, classroomName: string, lessonIds: number[]) => void;
}

export function EditClassroomModal({
  open,
  onOpenChange,
  location,
  selectedLessons,
  onSave,
}: EditClassroomModalProps) {
  const [selectedClassroom, setSelectedClassroom] = React.useState<string>("");
  const [classrooms, setClassrooms] = React.useState<ClassroomViewResource[]>([]);
  const [isLoadingClassrooms, setIsLoadingClassrooms] = React.useState(false);

  // Load classrooms when modal opens
  React.useEffect(() => {
    if (!open) return;

    let isCancelled = false;

    const fetchClassrooms = async () => {
      setIsLoadingClassrooms(true);
      try {
        const response = await getClassroomViewResources(location);
        if (!isCancelled && response?.success && response.data?.resources) {
          setClassrooms(response.data.resources);
        }
      } catch (error) {
        console.error("Failed to load classrooms:", error);
        if (!isCancelled) {
          setClassrooms([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingClassrooms(false);
        }
      }
    };

    fetchClassrooms();

    return () => {
      isCancelled = true;
    };
  }, [open, location]);

  // Reset selected classroom when modal closes
  React.useEffect(() => {
    if (!open) {
      setSelectedClassroom("");
    }
  }, [open]);

  const classroomOptions: SearchableSelectOption[] = React.useMemo(
    () =>
      classrooms.map((classroom) => ({
        value: classroom.id.toString(),
        label: classroom.title,
      })),
    [classrooms]
  );

  // Determine initial classroom value when modal opens
  React.useEffect(() => {
    if (open && selectedLessons.length > 0 && classrooms.length > 0) {
      // Check if all selected lessons have the same classroom
      const firstClassroom = selectedLessons[0]?.classroom;
      const allSameClassroom = selectedLessons.every(
        (lesson) => lesson.classroom === firstClassroom
      );

      if (allSameClassroom && firstClassroom) {
        // Find the classroom ID that matches the name
        const matchingClassroom = classrooms.find(
          (c) => c.title === firstClassroom
        );
        if (matchingClassroom) {
          setSelectedClassroom(matchingClassroom.id.toString());
        } else {
          setSelectedClassroom("");
        }
      } else {
        // Multiple different classrooms or no classroom - start with empty selection
        setSelectedClassroom("");
      }
    } else if (open && selectedLessons.length > 0) {
      // Classrooms not loaded yet, start with empty selection
      setSelectedClassroom("");
    }
  }, [open, selectedLessons, classrooms]);

  const handleSave = () => {
    if (!selectedClassroom) {
      return;
    }

    const selectedClassroomObj = classrooms.find(
      (c) => c.id.toString() === selectedClassroom
    );
    const classroomName = selectedClassroomObj?.title || "";

    const lessonIds = selectedLessons.map((lesson) => lesson.id);
    onSave(selectedClassroom, classroomName, lessonIds);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedClassroom("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Classroom</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="classroom-id" className="text-sm font-medium">
              Classroom Id
            </Label>
            <SearchableSelect
              id="classroom-id"
              options={classroomOptions}
              value={selectedClassroom}
              onValueChange={setSelectedClassroom}
              placeholder="classroom"
              searchPlaceholder="Search classrooms..."
              emptyText="No classrooms available"
              loadingText="Loading classrooms..."
              noResultsText="No classrooms found"
              isLoading={isLoadingClassrooms}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!selectedClassroom}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

