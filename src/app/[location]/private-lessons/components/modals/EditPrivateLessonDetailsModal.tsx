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
import { Checkbox } from "@/components/ui/checkbox";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/components/ui/searchable-select";
import { ColorPicker } from "@/components/ColorPicker";
import { getClassroomViewResources, type ClassroomViewResource } from "@/app/[location]/schedule/schedule.api";
import { toast } from "sonner";

export interface ClassroomOption {
  id: string;
  name: string;
}

export interface PrivateLessonDetailsData {
  classroom?: string; // This will be the classroom name (not ID) to match API expectations
  colorCode?: string;
  online?: boolean;
}

interface EditPrivateLessonDetailsModalProps {
  open: boolean;
  onClose: () => void;
  details: PrivateLessonDetailsData | null;
  location: string;
  onSubmit: (data: PrivateLessonDetailsData) => Promise<boolean>;
  saving?: boolean;
}

// Mock data generator for classrooms (can be replaced with API call)
const generateMockClassrooms = (): ClassroomOption[] => {
  return [
    { id: "1", name: "Class 1" },
    { id: "2", name: "Class 2" },
    { id: "3", name: "class3" },
    { id: "4", name: "Classroom 1" },
    { id: "5", name: "Classroom 2" },
    { id: "6", name: "Classroom 3" },
    { id: "7", name: "Room 1" },
    { id: "8", name: "Room 2" },
    { id: "9", name: "Room C" },
    { id: "10", name: "Room3" },
    { id: "11", name: "Room4" },
    { id: "12", name: "test12" },
  ];
};

export function EditPrivateLessonDetailsModal({
  open,
  onClose,
  details,
  location,
  onSubmit,
  saving = false,
}: EditPrivateLessonDetailsModalProps) {
  const [classrooms, setClassrooms] = React.useState<ClassroomOption[]>([]);
  const [isLoadingClassrooms, setIsLoadingClassrooms] = React.useState(false);
  const [selectedClassroomId, setSelectedClassroomId] = React.useState<string>("");
  const [colorCode, setColorCode] = React.useState<string>("#3d85c6");
  const [isOnline, setIsOnline] = React.useState<boolean>(false);

  // Load classrooms when modal opens
  React.useEffect(() => {
    if (!open || !location) return;

    let isCancelled = false;

    const fetchClassrooms = async () => {
      setIsLoadingClassrooms(true);
      try {
        const response = await getClassroomViewResources(location);
        if (!isCancelled && response?.success && response.data?.resources) {
          const classroomOptions: ClassroomOption[] = response.data.resources.map(
            (resource: ClassroomViewResource) => ({
              id: resource.id.toString(),
              name: resource.title,
            })
          );
          setClassrooms(classroomOptions);
        } else if (!isCancelled) {
          // Fallback to mock data if API fails
          setClassrooms(generateMockClassrooms());
        }
      } catch (error) {
        console.error("Failed to load classrooms:", error);
        if (!isCancelled) {
          // Fallback to mock data on error
          setClassrooms(generateMockClassrooms());
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

  // Use provided options or fallback to mock data
  const availableClassrooms = React.useMemo(() => {
    return classrooms.length > 0 ? classrooms : generateMockClassrooms();
  }, [classrooms]);

  // Initialize form when modal opens or details change
  React.useEffect(() => {
    if (details) {
      // Find classroom ID from name if details has a classroom name
      if (details.classroom) {
        const matchingClassroom = availableClassrooms.find(
          (c) => c.name === details.classroom
        );
        setSelectedClassroomId(matchingClassroom?.id || "");
      } else {
        setSelectedClassroomId("");
      }
      setColorCode(details.colorCode || "#3d85c6");
      setIsOnline(details.online || false);
    } else {
      // Reset form when details are cleared
      setSelectedClassroomId("");
      setColorCode("#3d85c6");
      setIsOnline(false);
    }
  }, [details, availableClassrooms, open]);

  const classroomSelectOptions: SearchableSelectOption[] = React.useMemo(
    () =>
      availableClassrooms.map((classroom) => ({
        value: classroom.id,
        label: classroom.name,
      })),
    [availableClassrooms]
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Find classroom name from selected ID
    const selectedClassroom = availableClassrooms.find(
      (c) => c.id === selectedClassroomId
    );
    const payload: PrivateLessonDetailsData = {
      classroom: selectedClassroom?.name || "",
      colorCode: colorCode,
      online: isOnline,
    };

    const success = await onSubmit(payload);
    if (success) {
      toast.success("Private lesson details updated successfully");
      onClose();
    } else {
      toast.error("Failed to update private lesson details");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Classroom Field */}
          <div className="space-y-2">
            <Label htmlFor="classroom" className="text-sm font-medium">
              Classroom
            </Label>
            <SearchableSelect
              id="classroom"
              options={classroomSelectOptions}
              value={selectedClassroomId}
              onValueChange={setSelectedClassroomId}
              placeholder="Select Classroom"
              searchPlaceholder="Search classrooms..."
              emptyText="No classrooms available"
              loadingText="Loading classrooms..."
              noResultsText="No classrooms found"
              isLoading={isLoadingClassrooms}
            />
          </div>

          {/* Color Code Field */}
          <div className="space-y-2">
            <Label htmlFor="color-code" className="text-sm font-medium">
              Color Code
            </Label>
            <div className="flex items-center gap-2">
              <ColorPicker
                value={colorCode}
                onChange={setColorCode}
                className="flex-1"
              />
              <div className="flex-shrink-0 w-24">
                <input
                  id="color-code"
                  type="text"
                  value={colorCode}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(value) || value === "") {
                      setColorCode(value);
                    }
                  }}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="#000000"
                  maxLength={7}
                />
              </div>
            </div>
          </div>

          {/* Is Online Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-online"
              checked={isOnline}
              onCheckedChange={(checked) => setIsOnline(checked === true)}
            />
            <Label
              htmlFor="is-online"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Is Online
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

