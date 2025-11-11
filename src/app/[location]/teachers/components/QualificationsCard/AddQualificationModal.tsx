"use client";

import * as React from "react";
import { ReusableModal } from "@/components/TablesModals";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { toast } from "sonner";

interface AddQualificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onAdd: (qualifications: Array<{ program: string; rate: number }>) => void;
  availablePrograms?: Array<{ value: string; label: string }>;
}

// Default programs for Private Qualifications
export const PRIVATE_PROGRAMS = [
  { value: "xpiano-core", label: "xPiano Core" },
  { value: "xvocal-core", label: "xVocal Core" },
  { value: "xvocal-contemporary", label: "xVocal Contemporary" },
  { value: "xvocal-hybrid", label: "xVocal Hybrid" },
  { value: "xdrums-core", label: "xDrums Core" },
  { value: "xdrums-contemporary", label: "xDrums Contemporary" },
  { value: "xdrums-hybrid", label: "xDrums Hybrid" },
  { value: "xguitar-core", label: "xGuitar Core" },
  { value: "xguitar-contemporary", label: "xGuitar Contemporary" },
  { value: "xguitar-hybrid", label: "xGuitar Hybrid" },
  { value: "xpiano-contemporary", label: "xPiano Contemporary" },
  { value: "xpiano-hybrid", label: "xPiano Hybrid" },
  { value: "xclarinet", label: "xClarinet" },
  { value: "xsaxophone", label: "xSaxophone" },
  { value: "xflute", label: "xFlute" },
  { value: "xtrumpet", label: "xTrumpet" },
  { value: "xviolin", label: "xViolin" },
  { value: "40th-anniversary-vocal", label: "40th Anniversary Vocal" },
  { value: "test65", label: "Test65" },
  { value: "test72-5", label: "test72.5" },
  { value: "instrument", label: "Instrument" },
  { value: "rami-test-program", label: "Rami Test Program" },
];

// Programs for Group Qualifications
export const GROUP_PROGRAMS = [
  { value: "level-5-theory", label: "Level 5 Theory" },
  { value: "level-6-theory", label: "Level 6 Theory" },
  { value: "level-7-theory", label: "Level 7 Theory" },
  { value: "level-8-theory", label: "Level 8 Theory" },
  { value: "level-9-harmony", label: "Level 9 Harmony" },
  { value: "level-5-theory-summer-crash", label: "Level 5 Theory Summer Crash Course" },
  { value: "level-6-theory-summer-crash", label: "Level 6 Theory Summer Crash Course" },
  { value: "level-7-theory-summer-crash", label: "Level 7 Theory Summer Crash Course" },
  { value: "level-8-theory-summer-crash", label: "Level 8 Theory Summer Crash Course" },
  { value: "level-9-harmony-summer-crash", label: "Level 9 Harmony Summer Crash Course" },
  { value: "group-piano-beginner", label: "Group Piano - Beginner" },
  { value: "group-piano-intermediate", label: "Group Piano - Intermediate" },
  { value: "group-vocal-beginner", label: "Group Vocal - Beginner" },
  { value: "group-vocal-intermediate", label: "Group Vocal - Intermediate" },
  { value: "group-guitar-beginner", label: "Group Guitar - Beginner" },
  { value: "group-guitar-intermediate", label: "Group Guitar - Intermediate" },
  { value: "ensemble-practice", label: "Ensemble Practice" },
  { value: "band-workshop", label: "Band Workshop" },
];

export function AddQualificationModal({
  open,
  onOpenChange,
  title,
  onAdd,
  availablePrograms = PRIVATE_PROGRAMS,
}: AddQualificationModalProps) {
  const [selectedPrograms, setSelectedPrograms] = React.useState<string[]>([]);
  const [rate, setRate] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSave = async () => {
    // Validate
    if (selectedPrograms.length === 0) {
      setError("Please select at least one program");
      return;
    }

    if (!rate.trim() || isNaN(Number(rate)) || Number(rate) <= 0) {
      setError("Please enter a valid rate");
      return;
    }

    setSaving(true);
    try {
      // TODO: Implement actual API call when backend is ready
      await new Promise((resolve) => setTimeout(resolve, 500));

      const qualifications = selectedPrograms.map((program) => ({
        program,
        rate: Number(rate),
      }));

      onAdd(qualifications);
      
      // Reset form
      setSelectedPrograms([]);
      setRate("");
      setError("");
      
      onOpenChange(false);
      toast.success(`${selectedPrograms.length} qualification(s) added successfully`);
    } catch (error) {
      console.error("Error adding qualifications:", error);
      toast.error("Failed to add qualifications");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedPrograms([]);
    setRate("");
    setError("");
    onOpenChange(false);
  };

  return (
    <ReusableModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      size="md"
      actions={[
        {
          label: "Cancel",
          onClick: handleCancel,
          variant: "outline",
          disabled: saving,
        },
        {
          label: saving ? "Saving..." : "Save",
          onClick: handleSave,
          variant: "default",
          disabled: saving,
        },
      ]}
    >
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <Label htmlFor="programs">Programs</Label>
          <MultiSelectCombobox
            options={availablePrograms}
            value={selectedPrograms}
            onValueChange={(values) => {
              setSelectedPrograms(values);
              setError("");
            }}
            placeholder="Select programs..."
            searchPlaceholder="Search programs..."
            emptyText="No programs found."
            disabled={saving}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="rate">Rate ($/hr)</Label>
          <Input
            id="rate"
            type="number"
            step="0.01"
            min="0"
            value={rate}
            onChange={(e) => {
              setRate(e.target.value);
              setError("");
            }}
            disabled={saving}
            placeholder="0.00"
            className="mt-1"
          />
        </div>
      </div>
    </ReusableModal>
  );
}

