"use client";

import * as React from "react";
import { ReusableModal } from "@/components/TablesModals";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { StudentBasicDetails } from "../../types";
import {
  getCustomerStudentsForMerge,
  mergeStudent,
  MergeStudentListItem,
} from "../../[id]/students-details.api";

interface MergeStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: string;
  currentStudentId: string;
  currentStudentDetails: StudentBasicDetails | null;
  customerId: number;
  onMergeSuccess?: () => void;
}

export function MergeStudentModal({
  open,
  onOpenChange,
  location: _location,
  currentStudentId: _currentStudentId,
  currentStudentDetails,
  customerId,
  onMergeSuccess,
}: MergeStudentModalProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [students, setStudents] = React.useState<MergeStudentListItem[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = React.useState(false);
  const [selectedStudentId, setSelectedStudentId] = React.useState<number | null>(null);
  const [isMerging, setIsMerging] = React.useState(false);

  const loadStudents = React.useCallback(async () => {
    try {
      setIsLoadingStudents(true);
      const response = await getCustomerStudentsForMerge(
        _location,
        customerId,
        _currentStudentId
      );

      if (!response || !response.success) {
        toast.error(
          response?.message || "Failed to load students for merge"
        );
        setStudents([]);
        return;
      }

      setStudents(response.data.body || []);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load students for merge";
      toast.error(errorMessage);
      setStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  }, [_location, _currentStudentId, customerId]);

  React.useEffect(() => {
    if (open) {
      void loadStudents();
      setSelectedStudentId(null);
      setSearchQuery("");
    }
  }, [open, loadStudents]);

  const handleMerge = async () => {
    if (!selectedStudentId) {
      toast.error("Please select a student to merge with");
      return;
    }

    setIsMerging(true);
    try {
      const response = await mergeStudent(
        _location,
        _currentStudentId,
        selectedStudentId
      );

      if (response && response.success) {
        toast.success("Students merged successfully");
        onOpenChange(false);
        setSearchQuery("");
        setSelectedStudentId(null);
        onMergeSuccess?.();
      } else {
        toast.error(
          response?.message || "Failed to merge students"
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to merge students";
      toast.error(errorMessage);
    } finally {
      setIsMerging(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSearchQuery("");
    setSelectedStudentId(null);
  };

  const filteredStudents = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return students;
    }

    return students.filter((student) => {
      const nameMatch = student.fullName
        ?.toLowerCase()
        .includes(query);
      const idMatch = String(student.id).includes(query);
      return nameMatch || idMatch;
    });
  }, [students, searchQuery]);

  const modalActions = [
    {
      label: "Cancel",
      onClick: handleCancel,
      variant: "outline" as const,
      disabled: isMerging,
    },
    {
      label: isMerging ? "Merging..." : "Merge",
      onClick: handleMerge,
      variant: "default" as const,
      disabled: isMerging || !selectedStudentId,
    },
  ];

  return (
    <ReusableModal
      open={open}
      onOpenChange={onOpenChange}
      title="Merge Student"
      description={
        currentStudentDetails
          ? `Select a student to merge with ${currentStudentDetails.firstName} ${currentStudentDetails.lastName}`
          : "Select the student to merge with"
      }
      size="lg"
      actions={modalActions}
      showFooter={true}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mergeStudentSelect">Select Student</Label>
          <Select
            value={selectedStudentId ? String(selectedStudentId) : ""}
            onValueChange={(value) => setSelectedStudentId(Number(value))}
            disabled={isMerging || isLoadingStudents || filteredStudents.length === 0}
          >
            <SelectTrigger
              id="mergeStudentSelect"
              className="w-full h-9 rounded-md border border-gray-300 bg-background px-3 text-sm
                         hover:border-gray-400 focus:border-[#f3573f] focus:ring-0 focus:outline-none
                         disabled:cursor-not-allowed disabled:opacity-70 transition-colors"
            >
              <SelectValue placeholder={
                isLoadingStudents
                  ? "Loading students..."
                  : filteredStudents.length === 0
                  ? "No students found for this customer"
                  : "Select a student to merge"
              } />
            </SelectTrigger>
            <SelectContent>
              {filteredStudents.map((student) => (
                <SelectItem key={student.id} value={String(student.id)}>
                  <span className="text-sm font-medium">{student.fullName}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Search above to filter, then choose a student from the dropdown.
          </p>
        </div>
      </div>
    </ReusableModal>
  );
}

