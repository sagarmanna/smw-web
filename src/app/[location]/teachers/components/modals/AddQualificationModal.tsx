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

// Common program options - can be moved to constants file if needed
const PROGRAM_OPTIONS = [
  "Piano",
  "Guitar",
  "Violin",
  "Drums",
  "Voice",
  "Saxophone",
  "Flute",
  "Clarinet",
  "Trumpet",
  "Cello",
  "Bass",
  "Other",
];

interface AddQualificationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { programs: string[]; rate?: number }) => void;
  title?: string;
  allowRate?: boolean;
  availablePrograms?: string[];
}

export function AddQualificationModal({
  open,
  onClose,
  onSubmit,
  title = "Qualification",
  allowRate = true,
  availablePrograms = PROGRAM_OPTIONS,
}: AddQualificationModalProps) {
  const [selectedPrograms, setSelectedPrograms] = React.useState<string[]>([]);
  const [rate, setRate] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setSelectedPrograms([]);
      setRate("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (selectedPrograms.length === 0) {
      setError("Please select at least one program.");
      return;
    }

    const submitData: { programs: string[]; rate?: number } = {
      programs: selectedPrograms,
    };

    if (allowRate && rate.trim()) {
      const rateValue = parseFloat(rate);
      if (isNaN(rateValue) || rateValue < 0) {
        setError("Please enter a valid rate.");
        return;
      }
      submitData.rate = rateValue;
    }

    onSubmit(submitData);
    onClose();
  };

  const resetForm = () => {
    setSelectedPrograms([]);
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
              <Label htmlFor="programs">
                Programs <span className="text-red-500">*</span>
              </Label>
              <MultiSelectCombobox
                options={availablePrograms.map((program) => ({
                  label: program,
                  value: program,
                }))}
                value={selectedPrograms}
                onValueChange={(values) => {
                  setSelectedPrograms(values);
                  setError("");
                }}
                placeholder="Select programs..."
                searchPlaceholder="Search programs..."
                emptyText="No programs found."
              />
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

