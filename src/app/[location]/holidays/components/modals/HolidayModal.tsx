"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { GenericCrudModal, CrudModalConfig } from "@/components/GenericCrudModal";
import {
  HolidayRow,
  CreateHolidayRequest,
  UpdateHolidayRequest,
} from "../../holidays.api";
import { parseDateString } from "@/utils/dateUtils";
import { format } from "date-fns";
import { useAppDispatch } from "@/redux/hooks";
import {
  addHoliday,
  updateHolidayThunk,
  deleteHolidayThunk,
} from "../../holidaysListing.slice";

interface HolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  location: string;
  initialData?: HolidayRow | null;
  mode?: "add" | "edit";
}

type HolidayFormData = {
  date: Date | undefined;
  description: string;
};

export function HolidayModal({
  isOpen,
  onClose,
  onSuccess,
  location,
  initialData = null,
  mode = "add",
}: HolidayModalProps) {
  const dispatch = useAppDispatch();

  /**
   * Wrapper function for creating holiday
   * Calls API via Redux thunk and returns standardized response
   */
  const handleCreate = async (
    loc: string,
    payload: CreateHolidayRequest
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      await dispatch(addHoliday({ location: loc, data: payload })).unwrap();
      return { success: true, message: "Holiday created successfully" };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create holiday",
      };
    }
  };

  /**
   * Wrapper function for updating holiday
   * Calls API via Redux thunk and returns standardized response
   */
  const handleUpdate = async (
    loc: string,
    payload: UpdateHolidayRequest
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      await dispatch(
        updateHolidayThunk({ location: loc, data: payload })
      ).unwrap();
      return { success: true, message: "Holiday updated successfully" };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update holiday",
      };
    }
  };

  /**
   * Wrapper function for deleting holiday
   * Calls API via Redux thunk and returns standardized response
   */
  const handleDelete = async (
    loc: string,
    id: number
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      await dispatch(deleteHolidayThunk({ location: loc, id })).unwrap();
      return { success: true, message: "Holiday deleted successfully" };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete holiday",
      };
    }
  };

  const config: CrudModalConfig<
    HolidayRow,
    HolidayFormData,
    CreateHolidayRequest,
    UpdateHolidayRequest
  > = {
    entityName: "Holiday",
    onCreate: handleCreate,
    onUpdate: handleUpdate,
    onDelete: handleDelete,
    buildCreateRequest: (formData: HolidayFormData): CreateHolidayRequest => {
      if (!formData.date) {
        throw new Error("Date is required");
      }
      // Convert Date object to ISO format (YYYY-MM-DD) using local timezone
      const isoDate = format(formData.date, "yyyy-MM-dd");
      return {
        date: isoDate,
        description: formData.description.trim(),
      };
    },
    buildUpdateRequest: (formData: HolidayFormData, id: number): UpdateHolidayRequest => {
      if (!formData.date) {
        throw new Error("Date is required");
      }
      // Convert Date object to ISO format (YYYY-MM-DD) using local timezone
      const isoDate = format(formData.date, "yyyy-MM-dd");
      return {
        id,
        date: isoDate,
        description: formData.description.trim(),
      };
    },
    initializeFormData: (row: HolidayRow): HolidayFormData => {
      // Parse display date format directly to Date object (e.g., "Dec 25, 2017")
      const date = parseDateString(row.date) || undefined;
      
      return {
        date,
        description: row.description || "",
      };
    },
    getDefaultFormData: (): HolidayFormData => ({
      date: undefined,
      description: "Holiday",
    }),
    validateForm: (formData: HolidayFormData): Record<string, string> => {
      const errors: Record<string, string> = {};
      if (!formData.date) {
        errors.date = "Date is required.";
      }
      if (!formData.description.trim()) {
        errors.description = "Description cannot be blank.";
      }
      return errors;
    },
  };

  return (
    <GenericCrudModal<HolidayRow, HolidayFormData, CreateHolidayRequest, UpdateHolidayRequest>
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      location={location}
      initialData={initialData}
      mode={mode}
      config={config}
    >
      {({ formData, errors, isBusy, handleInputChange, setFormData }) => (
        <div className="space-y-4">
          <DatePicker
            id="holiday-date"
            label="Date"
            value={formData.date}
            onSelect={(date) => {
              setFormData((prev) => ({ ...prev, date }));
            }}
            placeholder="Pick a date"
            fromYear={2005}
            toYear={2125}
            disabled={isBusy}
            error={!!errors.date}
            errorMessage={errors.date}
          />
          <div className="space-y-2">
            <Label htmlFor="description" className={errors.description ? "text-red-500" : ""}>
              Description
            </Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter holiday description"
              className={errors.description ? "border-red-500" : ""}
              disabled={isBusy}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>
        </div>
      )}
    </GenericCrudModal>
  );
}
