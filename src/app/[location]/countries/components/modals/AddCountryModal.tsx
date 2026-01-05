"use client";

import React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GenericCrudModal, CrudModalConfig } from "@/components/GenericCrudModal";

import { createCountry, updateCountry, deleteCountry, CountryRow, CreateCountryRequest, UpdateCountryRequest } from "../../countries.api";

interface AddCountryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  location: string;
  initialData?: CountryRow | null;
  mode?: "add" | "edit";
}

type CountryFormData = {
  name: string;
};

export function AddCountryModal({
  isOpen,
  onClose,
  onSuccess,
  location,
  initialData = null,
  mode = "add",
}: AddCountryModalProps) {
  const config: CrudModalConfig<CountryRow, CountryFormData, CreateCountryRequest, UpdateCountryRequest> = {
    entityName: "Country",
    onCreate: createCountry,
    onUpdate: updateCountry,
    onDelete: deleteCountry,
    buildCreateRequest: (formData: CountryFormData): CreateCountryRequest => ({
      name: formData.name.trim(),
    }),
    buildUpdateRequest: (formData: CountryFormData, id: number): UpdateCountryRequest => ({
      id,
      name: formData.name.trim(),
    }),
    initializeFormData: (row: CountryRow): CountryFormData => ({
      name: row.name || "",
    }),
    getDefaultFormData: (): CountryFormData => ({
      name: "",
    }),
    validateForm: (formData: CountryFormData): Record<string, string> => {
      const errors: Record<string, string> = {};
      if (!formData.name.trim()) {
        errors.name = "Name cannot be blank.";
      }
      return errors;
    },
  };

  return (
    <GenericCrudModal<CountryRow, CountryFormData, CreateCountryRequest, UpdateCountryRequest>
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
            placeholder="Enter country name"
            className={errors.name ? "border-red-500" : ""}
            disabled={isBusy}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>
      )}
    </GenericCrudModal>
  );
}


