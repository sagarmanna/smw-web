"use client";

import * as React from "react";
import { ReusableModal } from "@/components/TablesModals";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { StudentBasicDetails } from "../../types";

interface MergeStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: string;
  currentStudentId: string;
  currentStudentDetails: StudentBasicDetails | null;
  onMergeSuccess?: () => void;
}

export function MergeStudentModal({
  open,
  onOpenChange,
  location: _location,
  currentStudentId: _currentStudentId,
  currentStudentDetails,
  onMergeSuccess,
}: MergeStudentModalProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isMerging, setIsMerging] = React.useState(false);

  const handleMerge = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please search and select a student to merge with");
      return;
    }

    setIsMerging(true);
    try {
      // TODO: Replace with actual API call when endpoint is available
      // const response = await mergeStudent(_location, _currentStudentId, targetStudentId);
      void _location; // Reserved for future API implementation
      void _currentStudentId; // Reserved for future API implementation
      // if (response.success) {
      //   toast.success("Students merged successfully");
      //   onOpenChange(false);
      //   onMergeSuccess?.();
      // } else {
      //   toast.error(response.message || "Failed to merge students");
      // }

      // Mock implementation
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("Students merged successfully");
      onOpenChange(false);
      setSearchQuery("");
      onMergeSuccess?.();
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
  };

  React.useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

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
      disabled: isMerging || !searchQuery.trim(),
    },
  ];

  return (
    <ReusableModal
      open={open}
      onOpenChange={onOpenChange}
      title="Merge Student"
      description="Select the student to merge with"
      size="lg"
      actions={modalActions}
      showFooter={true}
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Select a student to merge with{" "}
          {currentStudentDetails?.firstName} {currentStudentDetails?.lastName}
        </p>
        <div className="space-y-2">
          <Label htmlFor="mergeStudent">Search Student</Label>
          <Input
            id="mergeStudent"
            type="text"
            placeholder="Search by name or ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="focus:ring-0 focus:outline-none border-gray-300 dark:border-gray-600"
            style={{ boxShadow: "none" }}
            disabled={isMerging}
          />
        </div>
      </div>
    </ReusableModal>
  );
}

