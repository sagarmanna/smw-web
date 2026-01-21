"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GenericCrudModal, type CrudModalConfig } from "@/components/GenericCrudModal";

import {
  type ItemCategoryRow,
  type CreateItemCategoryRequest,
  type UpdateItemCategoryRequest,
  createItemCategory,
  updateItemCategory,
  deleteItemCategory,
} from "../../itemCategories.api";

type ItemCategoryFormData = {
  name: string;
};

interface ItemCategoryCrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  location: string;
  mode: "add" | "edit";
  initialData?: ItemCategoryRow | null;
}

const buildItemCategoryCrudConfig = (): CrudModalConfig<
  ItemCategoryRow,
  ItemCategoryFormData,
  CreateItemCategoryRequest,
  UpdateItemCategoryRequest
> => ({
  entityName: "Item Category",
  onCreate: createItemCategory,
  onUpdate: updateItemCategory,
  onDelete: deleteItemCategory,
  buildCreateRequest: (formData) => ({
    name: formData.name.trim(),
  }),
  buildUpdateRequest: (formData, id) => ({
    id,
    name: formData.name.trim(),
  }),
  initializeFormData: (row) => ({
    name: row.name ?? "",
  }),
  getDefaultFormData: () => ({
    name: "",
  }),
  validateForm: (formData) => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = "Name cannot be blank.";
    }
    return errors;
  },
});

export function ItemCategoryCrudModal({
  isOpen,
  onClose,
  onSuccess,
  location,
  mode,
  initialData = null,
}: ItemCategoryCrudModalProps) {
  const config = React.useMemo(() => buildItemCategoryCrudConfig(), []);

  return (
    <GenericCrudModal<ItemCategoryRow, ItemCategoryFormData, CreateItemCategoryRequest, UpdateItemCategoryRequest>
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      location={location}
      initialData={initialData}
      mode={mode}
      config={config}
      title="Item Category"
      deleteTitle="Delete Item Category"
      deleteDescription={<span>Are you sure you want to delete this?</span>}
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
            className={errors.name ? "border-red-500" : ""}
            disabled={isBusy}
            autoFocus
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>
      )}
    </GenericCrudModal>
  );
}


