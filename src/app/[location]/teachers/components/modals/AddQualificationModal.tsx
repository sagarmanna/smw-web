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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { TeacherQualification } from "../../types";
import { getProgramsList, Program } from "../../teachers.api";

interface AddQualificationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { programs: number[]; rate?: number }) => void;
  title?: string;
  allowRate?: boolean;
  initialData?: TeacherQualification | null;
  onDelete?: (id: string) => void;
  mode?: "add" | "edit";
  programType?: "private" | "group"; // Filter programs by type
}

export function AddQualificationModal({
  open,
  onClose,
  onSubmit,
  title = "Qualification",
  allowRate = true,
  initialData = null,
  onDelete,
  mode = "add",
  programType,
}: AddQualificationModalProps) {
  const isEditMode = mode === "edit" && initialData !== null;
  const [programs, setPrograms] = React.useState<Program[]>([]);
  const [loadingPrograms, setLoadingPrograms] = React.useState(false);
  const [selectedPrograms, setSelectedPrograms] = React.useState<string[]>([]);
  const [selectedProgramIds, setSelectedProgramIds] = React.useState<number[]>([]);
  const [selectedProgram, setSelectedProgram] = React.useState<string>("");
  const [rate, setRate] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [showRateChangeConfirm, setShowRateChangeConfirm] = React.useState(false);
  const [pendingSubmitData, setPendingSubmitData] = React.useState<{ programs: number[]; rate?: number } | null>(null);
  const originalRate = React.useRef<number | undefined>(undefined);

  // Fetch programs when modal opens
  React.useEffect(() => {
    if (open && !isEditMode) {
      setLoadingPrograms(true);
      getProgramsList(programType)
        .then((programList) => {
          setPrograms(programList);
        })
        .catch((err) => {
          console.error("Error fetching programs:", err);
          setError("Failed to load programs. Please try again.");
        })
        .finally(() => {
          setLoadingPrograms(false);
        });
    }
  }, [open, isEditMode, programType]);

  React.useEffect(() => {
    if (open) {
      if (isEditMode && initialData) {
        setSelectedProgram(initialData.name);
        setSelectedPrograms([initialData.name]);
        setRate(initialData.rate?.toString() || "");
        originalRate.current = initialData.rate;
      } else {
        setSelectedPrograms([]);
        setSelectedProgram("");
        setRate("");
        originalRate.current = undefined;
      }
      setError(null);
      setShowDeleteConfirm(false);
      setShowRateChangeConfirm(false);
      setPendingSubmitData(null);
    } else {
      setSelectedPrograms([]);
      setSelectedProgramIds([]);
      setSelectedProgram("");
      setRate("");
      setError(null);
      setShowDeleteConfirm(false);
      setShowRateChangeConfirm(false);
      setPendingSubmitData(null);
      originalRate.current = undefined;
    }
  }, [open, isEditMode, initialData]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // For edit mode, we only need the rate (program cannot be changed)
    if (isEditMode) {
      if (!allowRate || !rate.trim()) {
        setError("Rate is required.");
        return;
      }

      const rateValue = parseFloat(rate);
      if (isNaN(rateValue) || rateValue < 0) {
        setError("Please enter a valid rate.");
        return;
      }

      const submitData: { programs: number[]; rate?: number } = {
        programs: [], // Empty array for edit mode - programs are not sent in update API
        rate: rateValue,
      };

      // Check if rate has changed in edit mode
      const originalRateValue = originalRate.current;
      const rateChanged = 
        (originalRateValue ?? undefined) !== (rateValue ?? undefined);
      
      if (rateChanged) {
        setPendingSubmitData(submitData);
        setShowRateChangeConfirm(true);
        return;
      }

      onSubmit(submitData);
      onClose();
      return;
    }

    // For add mode, validate programs are selected
    if (selectedProgramIds.length === 0) {
      setError("Please select a program.");
      return;
    }

    const submitData: { programs: number[]; rate?: number } = {
      programs: selectedProgramIds,
    };

    if (allowRate && rate.trim()) {
      const rateValue = parseFloat(rate);
      if (isNaN(rateValue) || rateValue < 0) {
        setError("Please enter a valid rate.");
        return;
      }
      submitData.rate = rateValue;
    }

    // Validate rate is provided for add mode
    if (!submitData.rate) {
      setError("Rate is required.");
      return;
    }

    onSubmit(submitData);
    onClose();
  };

  const handleRateChangeConfirm = () => {
    if (pendingSubmitData) {
      onSubmit(pendingSubmitData);
      setShowRateChangeConfirm(false);
      setPendingSubmitData(null);
      onClose();
    }
  };

  const handleRateChangeCancel = () => {
    setShowRateChangeConfirm(false);
    setPendingSubmitData(null);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (isEditMode && initialData && onDelete) {
      onDelete(initialData.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  const resetForm = () => {
    setSelectedPrograms([]);
    setSelectedProgramIds([]);
    setSelectedProgram("");
    setRate("");
    setError(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          resetForm();
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="program">
                Programs <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-1">(Select one or more)</span>
              </Label>
              {isEditMode ? (
                <Input
                  id="program"
                  value={selectedProgram}
                  disabled
                  className="w-full bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                  readOnly
                />
              ) : (
                <MultiSelectCombobox
                  options={programs.map((program) => ({
                    label: program.name,
                    value: program.id.toString(),
                  }))}
                  value={selectedPrograms}
                  onValueChange={(values) => {
                    setSelectedPrograms(values);
                    // Convert selected program names (IDs as strings) to actual IDs
                    const ids = values
                      .map((val) => {
                        const program = programs.find((p) => p.id.toString() === val);
                        return program?.id;
                      })
                      .filter((id): id is number => id !== undefined);
                    setSelectedProgramIds(ids);
                    setError("");
                  }}
                  placeholder={loadingPrograms ? "Loading programs..." : "Select programs..."}
                  searchPlaceholder="Search programs..."
                  emptyText={loadingPrograms ? "Loading..." : "No programs found."}
                  disabled={loadingPrograms}
                />
              )}
            </div>

            {allowRate && (
              <div className="space-y-2">
                <Label htmlFor="rate">Rate ($/hr)</Label>
                <Input
                  id="rate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={rate}
                  onChange={(event) => {
                    setRate(event.target.value);
                    setError("");
                  }}
                  placeholder="0.00"
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            )}
          </div>

          <DialogFooter className="flex items-center justify-between w-full">
            <div className="flex-1">
              {isEditMode && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteClick}
                >
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">
              Are you sure you want to delete this?
            </DialogTitle>
          </DialogHeader>
          <DialogFooter className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={handleDeleteCancel}>
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rate Change Confirmation Modal */}
      <Dialog open={showRateChangeConfirm} onOpenChange={setShowRateChangeConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">
              Rate Modification Warning
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground">
              Modifying teacher&apos;s rate would affect all the future lesson teacher&apos;s cost. Do you want to continue?
            </p>
          </div>
          <DialogFooter className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={handleRateChangeCancel}>
              Cancel
            </Button>
            <Button onClick={handleRateChangeConfirm}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

