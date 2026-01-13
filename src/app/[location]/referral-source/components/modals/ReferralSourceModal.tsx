"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GenericCrudModal, CrudModalConfig } from "@/components/GenericCrudModal";
import {
  ReferralSourceRow,
  CreateReferralSourceRequest,
  UpdateReferralSourceRequest,
} from "../../referralSource.api";
import { useAppDispatch } from "@/redux/hooks";
import {
  addReferralSource,
  updateReferralSourceThunk,
  deleteReferralSourceThunk,
} from "../../referralSourceListing.slice";

interface ReferralSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  location: string;
  initialData?: ReferralSourceRow | null;
  mode?: "add" | "edit";
}

type ReferralSourceFormData = {
  name: string;
};

export function ReferralSourceModal({
  isOpen,
  onClose,
  onSuccess,
  location,
  initialData = null,
  mode = "add",
}: ReferralSourceModalProps) {
  const dispatch = useAppDispatch();

  /**
   * Wrapper function for creating referral source
   * Calls API via Redux thunk and returns standardized response
   */
  const handleCreate = async (
    loc: string,
    payload: CreateReferralSourceRequest
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      await dispatch(addReferralSource({ location: loc, data: payload })).unwrap();
      return { success: true, message: "Referral source created successfully" };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create referral source",
      };
    }
  };

  /**
   * Wrapper function for updating referral source
   * Calls API via Redux thunk and returns standardized response
   */
  const handleUpdate = async (
    loc: string,
    payload: UpdateReferralSourceRequest
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      await dispatch(
        updateReferralSourceThunk({ location: loc, data: payload })
      ).unwrap();
      return { success: true, message: "Referral source updated successfully" };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update referral source",
      };
    }
  };

  /**
   * Wrapper function for deleting referral source
   * Calls API via Redux thunk and returns standardized response
   */
  const handleDelete = async (
    loc: string,
    id: number
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      await dispatch(deleteReferralSourceThunk({ location: loc, id })).unwrap();
      return { success: true, message: "Referral source deleted successfully" };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete referral source",
      };
    }
  };

  const config: CrudModalConfig<
    ReferralSourceRow,
    ReferralSourceFormData,
    CreateReferralSourceRequest,
    UpdateReferralSourceRequest
  > = {
    entityName: "Referral Source",
    onCreate: handleCreate,
    onUpdate: handleUpdate,
    onDelete: handleDelete,
    buildCreateRequest: (formData: ReferralSourceFormData): CreateReferralSourceRequest => ({
      name: formData.name.trim(),
    }),
    buildUpdateRequest: (formData: ReferralSourceFormData, id: number): UpdateReferralSourceRequest => ({
      id,
      name: formData.name.trim(),
    }),
    initializeFormData: (row: ReferralSourceRow): ReferralSourceFormData => ({
      name: row.name || "",
    }),
    getDefaultFormData: (): ReferralSourceFormData => ({
      name: "",
    }),
    validateForm: (formData: ReferralSourceFormData): Record<string, string> => {
      const errors: Record<string, string> = {};
      if (!formData.name.trim()) {
        errors.name = "Name cannot be blank.";
      }
      return errors;
    },
  };

  return (
    <GenericCrudModal<ReferralSourceRow, ReferralSourceFormData, CreateReferralSourceRequest, UpdateReferralSourceRequest>
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      location={location}
      initialData={initialData}
      mode={mode}
      config={config}
    >
      {({ formData, errors, isBusy, handleInputChange }) => (
        <div className="space-y-2">
          <Label htmlFor="name" className={errors.name ? "text-red-500" : ""}>
            Name
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Enter referral source name"
            className={errors.name ? "border-red-500" : ""}
            disabled={isBusy}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>
      )}
    </GenericCrudModal>
  );
}
