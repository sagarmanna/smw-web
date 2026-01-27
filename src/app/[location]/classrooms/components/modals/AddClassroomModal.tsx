"use client";

import React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GenericCrudModal, CrudModalConfig } from "@/components/GenericCrudModal";

import {
  ClassroomRow,
  CreateClassroomRequest,
  UpdateClassroomRequest,
  createClassroom,
  updateClassroom,
  deleteClassroom,
} from "../../classrooms.api";

interface AddClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onAfterAction?: (action: "create" | "update" | "delete") => void;
  location: string;
  initialData?: ClassroomRow | null;
  mode?: "add" | "edit";
}

type ClassroomFormData = {
  name: string;
  description: string;
};

export function AddClassroomModal({
  isOpen,
  onClose,
  onSuccess,
  onAfterAction,
  location,
  initialData = null,
  mode = "add",
}: AddClassroomModalProps) {
  const lastActionRef = React.useRef<"create" | "update" | "delete" | null>(null);

  const handleSuccess = React.useCallback(() => {
    const action = lastActionRef.current;
    if (action) onAfterAction?.(action);
    onSuccess?.();
  }, [onAfterAction, onSuccess]);

  const config: CrudModalConfig<ClassroomRow, ClassroomFormData, CreateClassroomRequest, UpdateClassroomRequest> = {
    entityName: "Classroom",
    onCreate: async (loc, payload) => {
      lastActionRef.current = "create";
      return createClassroom(loc, payload);
    },
    onUpdate: async (loc, payload) => {
      lastActionRef.current = "update";
      return updateClassroom(loc, payload);
    },
    onDelete: async (loc, id) => {
      lastActionRef.current = "delete";
      return deleteClassroom(loc, id);
    },
    buildCreateRequest: (formData) => ({
      name: formData.name.trim(),
      description: formData.description.trim(),
    }),
    buildUpdateRequest: (formData, id) => ({
      id,
      name: formData.name.trim(),
      description: formData.description.trim(),
    }),
    initializeFormData: (row) => ({
      name: row.name || "",
      description: row.description || "",
    }),
    getDefaultFormData: () => ({
      name: "",
      description: "",
    }),
    validateForm: (formData) => {
      const errors: Record<string, string> = {};
      if (!formData.name?.trim()) errors.name = "Shortname is required";
      if (!formData.description?.trim()) errors.description = "Longname is required";
      return errors;
    },
  };

  return (
    <GenericCrudModal<ClassroomRow, ClassroomFormData, CreateClassroomRequest, UpdateClassroomRequest>
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={handleSuccess}
      location={location}
      initialData={initialData}
      mode={mode}
      config={config}
      title={mode === "edit" ? "Edit Classroom" : "Add Classroom"}
    >
      {({ formData, errors, isBusy, handleInputChange }) => (
        <>
          <div className="space-y-2">
            <Label htmlFor="classroom-name" className="text-sm font-medium">
              Shortname
            </Label>
            <Input
              id="classroom-name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g. Room 1"
              disabled={isBusy}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="classroom-description" className="text-sm font-medium">
              Longname
            </Label>
            <Textarea
              id="classroom-description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="e.g. Classroom #1 (Piano)"
              disabled={isBusy}
              rows={3}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>
        </>
      )}
    </GenericCrudModal>
  );
}

