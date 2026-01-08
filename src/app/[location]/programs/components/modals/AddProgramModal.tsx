"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GenericCrudModal, CrudModalConfig } from "@/components/GenericCrudModal";
import { createProgram, updateProgram, deleteProgram, ProgramRow, CreateProgramRequest, UpdateProgramRequest } from "../../programs.api";

interface AddProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  location: string;
  initialData?: ProgramRow | null;
  mode?: "add" | "edit";
  programType: "PRIVATE" | "GROUP";
}

type ProgramFormData = {
  name: string;
  rate: string;
  status: string;
};

// Helper function to calculate lesson rate for PRIVATE programs
const calculatePrivateLessonRate = (ratePerHour: number, durationMinutes: number): number => {
  if (durationMinutes === 30) {
    return ratePerHour * 0.5; // 30 min = 0.5 hour
  } else if (durationMinutes === 45) {
    return ratePerHour * 0.75; // 45 min = 0.75 hour
  } else {
    return ratePerHour * 1; // 60 min = 1 hour
  }
};

// Helper function for GROUP programs
// Based on the image: Rate per course $400 = $200 per lesson × 4 = $800/month
// So lesson rate = rate per course / 2
const calculateGroupLessonRate = (ratePerCourse: number): number => {
  // Each lesson = rate per course / 2
  return ratePerCourse / 2;
};

export function AddProgramModal({
  isOpen,
  onClose,
  onSuccess,
  location,
  initialData = null,
  mode = "add",
  programType,
}: AddProgramModalProps) {
  const config: CrudModalConfig<ProgramRow, ProgramFormData, CreateProgramRequest, UpdateProgramRequest> = {
    entityName: "Program",
    onCreate: createProgram,
    onUpdate: updateProgram,
    onDelete: deleteProgram,
    buildCreateRequest: (formData: ProgramFormData): CreateProgramRequest => {
      const rate = parseFloat(formData.rate) || 0;
      return {
        name: formData.name.trim(),
        ...(programType === "PRIVATE" ? { ratePerHour: rate } : { ratePerCourse: rate }),
        type: programType,
        isActive: formData.status === "active",
      };
    },
    buildUpdateRequest: (formData: ProgramFormData, id: number): UpdateProgramRequest => {
      const rate = parseFloat(formData.rate) || 0;
      return {
        id,
        name: formData.name.trim(),
        ...(programType === "PRIVATE" ? { ratePerHour: rate } : { ratePerCourse: rate }),
        type: programType,
        isActive: formData.status === "active",
      };
    },
    initializeFormData: (row: ProgramRow): ProgramFormData => {
      const rate = programType === "PRIVATE" 
        ? (row.ratePerHour?.toString() || "") 
        : (row.ratePerCourse?.toString() || "");
      
      return {
        name: row.name || "",
        rate,
        status: row.isActive === false ? "inactive" : "active",
      };
    },
    getDefaultFormData: (): ProgramFormData => ({
      name: "",
      rate: "",
      status: "active",
    }),
    validateForm: (formData: ProgramFormData): Record<string, string> => {
      const errors: Record<string, string> = {};
      if (!formData.name.trim()) {
        errors.name = "Name cannot be blank.";
      }
      if (!formData.rate || parseFloat(formData.rate) <= 0) {
        errors.rate = "Rate cannot be blank.";
      }
      return errors;
    },
  };

  return (
    <GenericCrudModal<ProgramRow, ProgramFormData, CreateProgramRequest, UpdateProgramRequest>
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      location={location}
      initialData={initialData}
      mode={mode}
      config={config}
    >
      {({ formData, errors, isBusy, handleInputChange }) => {
        const rate = parseFloat(formData.rate) || 0;
        
        // Calculate lesson rates and monthly costs
        let calculations: {
          thirtyMin: { lessonRate: number; monthly: number };
          fortyFiveMin: { lessonRate: number; monthly: number };
          sixtyMin: { lessonRate: number; monthly: number };
        };
        
        if (programType === "PRIVATE") {
          const thirtyMinRate = calculatePrivateLessonRate(rate, 30);
          const fortyFiveMinRate = calculatePrivateLessonRate(rate, 45);
          const sixtyMinRate = calculatePrivateLessonRate(rate, 60);
          calculations = {
            thirtyMin: { lessonRate: thirtyMinRate, monthly: thirtyMinRate * 4 },
            fortyFiveMin: { lessonRate: fortyFiveMinRate, monthly: fortyFiveMinRate * 4 },
            sixtyMin: { lessonRate: sixtyMinRate, monthly: sixtyMinRate * 4 },
          };
        } else {
          // For GROUP programs, rate is per course
          const lessonRate = calculateGroupLessonRate(rate);
          const monthlyTotal = lessonRate * 4; // 4 lessons per month
          calculations = {
            thirtyMin: { lessonRate, monthly: monthlyTotal },
            fortyFiveMin: { lessonRate, monthly: monthlyTotal },
            sixtyMin: { lessonRate, monthly: monthlyTotal },
          };
        }

        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="name" className={errors.name ? "text-red-500" : ""}>
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter program name"
                className={errors.name ? "border-red-500" : ""}
                disabled={isBusy}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate" className={errors.rate ? "text-red-500" : ""}>
                {programType === "PRIVATE" ? "Rate Per Hour($)" : "Rate Per Course($)"}
              </Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                min="0"
                value={formData.rate}
                onChange={(e) => handleInputChange("rate", e.target.value)}
                placeholder={`Enter ${programType === "PRIVATE" ? "hourly" : "course"} rate`}
                className={errors.rate ? "border-red-500" : ""}
                disabled={isBusy}
              />
              {errors.rate && <p className="text-sm text-red-500">{errors.rate}</p>}
            </div>

            {mode === "edit" && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                  disabled={isBusy}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Monthly Calculation Preview - Only show for PRIVATE programs */}
            {programType === "PRIVATE" && (
              <div className="space-y-2 pt-4 border-t">
                <h3 className="font-bold text-sm">What&apos;s that per month?</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>
                    Four 30min Lessons @ ${calculations.thirtyMin.lessonRate.toFixed(2)} each = ${calculations.thirtyMin.monthly.toFixed(2)}/mn
                  </div>
                  <div>
                    Four 45min Lessons @ ${calculations.fortyFiveMin.lessonRate.toFixed(2)} each = ${calculations.fortyFiveMin.monthly.toFixed(2)}/mn
                  </div>
                  <div>
                    Four 60min Lessons @ ${calculations.sixtyMin.lessonRate.toFixed(2)} each = ${calculations.sixtyMin.monthly.toFixed(2)}/mn
                  </div>
                </div>
              </div>
            )}
          </>
        );
      }}
    </GenericCrudModal>
  );
}

