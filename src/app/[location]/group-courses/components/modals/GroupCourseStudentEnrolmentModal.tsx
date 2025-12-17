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
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/components/ui/searchable-select";
import { cn } from "@/lib/utils";

interface GroupCourseStudentEnrolmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MockStudent {
  id: number;
  name: string;
}

const MOCK_STUDENTS: MockStudent[] = [
  { id: 1, name: "Aisha Lee" },
  { id: 2, name: "Astudent A" },
  { id: 3, name: "Hero 123" },
  { id: 4, name: "Anna Winston" },
  { id: 5, name: "Alicia Jones" },
];

export function GroupCourseStudentEnrolmentModal({
  open,
  onOpenChange,
}: GroupCourseStudentEnrolmentModalProps) {
  const [selectedStudent, setSelectedStudent] = React.useState<string>("");
  const [discountType, setDiscountType] = React.useState<"fixed" | "percentage">(
    "fixed"
  );
  const [discountValue, setDiscountValue] = React.useState<string>("");

  const studentOptions: SearchableSelectOption[] = React.useMemo(
    () =>
      MOCK_STUDENTS.map((student) => ({
        value: student.id.toString(),
        label: student.name,
      })),
    []
  );

  const handleCancel = React.useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handlePreview = React.useCallback(() => {
    // For now just log the data – integrate API when backend is ready
    console.log("Preview enrolment", {
      studentId: selectedStudent,
      discountType,
      discountValue,
    });
    onOpenChange(false);
  }, [onOpenChange, selectedStudent, discountType, discountValue]);

  const isPreviewDisabled = !selectedStudent || !discountValue;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Enrolment Detail
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Student Row */}
          <div className="space-y-2">
            <Label htmlFor="enrolment-student">Student</Label>
            <SearchableSelect
              id="enrolment-student"
              options={studentOptions}
              value={selectedStudent}
              onValueChange={setSelectedStudent}
              placeholder="Select Student"
              searchPlaceholder="Search students..."
              emptyText="No students available"
            />
          </div>

          {/* Discount Row */}
          <div className="space-y-2">
            <Label htmlFor="enrolment-discount">Discount</Label>
            <div className="flex items-center gap-3">
              {/* Segmented control for $ / % */}
              <div className="flex gap-1 border rounded-md overflow-hidden bg-background">
                <button
                  type="button"
                  onClick={() => setDiscountType("fixed")}
                  className={cn(
                    "text-sm px-3 py-1.5 transition-colors",
                    discountType === "fixed"
                      ? "bg-primary text-primary-foreground"
                      : "bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  $
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType("percentage")}
                  className={cn(
                    "text-sm px-3 py-1.5 transition-colors",
                    discountType === "percentage"
                      ? "bg-primary text-primary-foreground"
                      : "bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  %
                </button>
              </div>

              {/* Amount input */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {discountType === "fixed" ? "$" : "%"}
                </span>
                <Input
                  id="enrolment-discount"
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder="0.00"
                  className="w-32"
                  min="0"
                  step="0.01"
                  max={discountType === "percentage" ? "100" : undefined}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handlePreview} disabled={isPreviewDisabled}>
            Preview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


