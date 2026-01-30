/**
 * Generic CRUD Modal Component
 * Handles common modal structure, loading states, delete confirmation, and CRUD operations
 * Accepts custom form fields as children
 */

"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { isNetworkError, NETWORK_ERROR_MESSAGE } from "@/utils/api/createCrudApi";

export interface CrudModalConfig<TRow, TFormData, TCreateRequest, TUpdateRequest> {
  /**
   * Entity name for titles and messages (e.g., "City", "Province")
   */
  entityName: string;

  /**
   * Create function
   */
  onCreate: (location: string, payload: TCreateRequest) => Promise<{ success: boolean; message?: string }>;

  /**
   * Update function
   */
  onUpdate: (location: string, payload: TUpdateRequest) => Promise<{ success: boolean; message?: string }>;

  /**
   * Delete function
   */
  onDelete?: (location: string, id: number) => Promise<{ success: boolean; message?: string }>;

  /**
   * Transform form data to create request
   */
  buildCreateRequest: (formData: TFormData) => TCreateRequest;

  /**
   * Transform form data to update request
   */
  buildUpdateRequest: (formData: TFormData, id: number) => TUpdateRequest;

  /**
   * Initialize form data from row (for edit mode)
   */
  initializeFormData: (row: TRow) => TFormData;

  /**
   * Get default form data (for add mode)
   */
  getDefaultFormData: () => TFormData;

  /**
   * Validate form data
   */
  validateForm: (formData: TFormData) => Record<string, string>;

  /**
   * Reset form data to default
   */
  resetFormData?: (formData: TFormData) => TFormData;
}

export interface GenericCrudModalProps<TRow, TFormData, TCreateRequest = unknown, TUpdateRequest = unknown> {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  location: string;
  initialData?: TRow | null;
  mode?: "add" | "edit";
  config: CrudModalConfig<TRow, TFormData, TCreateRequest, TUpdateRequest>;
  title?: string;
  /**
   * Optional className to control DialogContent width/spacing for complex forms.
   * Example: "sm:max-w-[900px]"
   */
  dialogClassName?: string;
  deleteTitle?: string;
  deleteDescription?: React.ReactNode;
  children: (props: {
    formData: TFormData;
    setFormData: React.Dispatch<React.SetStateAction<TFormData>>;
    errors: Record<string, string>;
    isBusy: boolean;
    handleInputChange: (field: keyof TFormData, value: unknown) => void;
  }) => React.ReactNode;
}

export function GenericCrudModal<TRow extends { id: number }, TFormData extends Record<string, unknown>, TCreateRequest = unknown, TUpdateRequest = unknown>({
  isOpen,
  onClose,
  onSuccess,
  location,
  initialData = null,
  mode = "add",
  config,
  title,
  dialogClassName,
  deleteTitle,
  deleteDescription,
  children,
}: GenericCrudModalProps<TRow, TFormData, TCreateRequest, TUpdateRequest>) {
  const {
    entityName,
    onCreate,
    onUpdate,
    onDelete,
    buildCreateRequest,
    buildUpdateRequest,
    initializeFormData,
    getDefaultFormData,
    validateForm,
    resetFormData,
  } = config;

  const [formData, setFormData] = useState<TFormData>(getDefaultFormData());
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isBusy = isLoading || isDeleting;

  // Initialize form data when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData && mode === "edit") {
        setFormData(initializeFormData(initialData));
      } else {
        setFormData(getDefaultFormData());
      }
      setErrors({});
    }
  }, [isOpen, initialData, mode, initializeFormData, getDefaultFormData]);

  const resetForm = () => {
    const defaultData = getDefaultFormData();
    setFormData(resetFormData ? resetFormData(defaultData) : defaultData);
    setErrors({});
  };

  const handleInputChange = (field: keyof TFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (mode === "edit" && !initialData) {
      toast.error(`Missing ${entityName.toLowerCase()} data for update`);
      return;
    }

    setIsLoading(true);
    try {
      const response =
        mode === "edit"
          ? await onUpdate(location, buildUpdateRequest(formData, initialData!.id))
          : await onCreate(location, buildCreateRequest(formData));

      if (response.success) {
        toast.success(response.message || `${entityName} ${mode === "edit" ? "updated" : "created"} successfully`);
        resetForm();
        onClose();
        onSuccess?.();
      } else {
        toast.error(response.message || `Failed to ${mode === "edit" ? "update" : "create"} ${entityName.toLowerCase()}`);
      }
    } catch (error) {
      const errorMessage = isNetworkError(error)
        ? NETWORK_ERROR_MESSAGE
        : `An error occurred while saving the ${entityName.toLowerCase()}`;
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!initialData || !onDelete) return;
    setIsDeleting(true);
    try {
      const response = await onDelete(location, initialData.id);

      if (response.success) {
        toast.success(response.message || `${entityName} deleted successfully`);
        setShowDeleteConfirm(false);
        resetForm();
        onClose();
        onSuccess?.();
      } else {
        toast.error(response.message || `Failed to delete ${entityName.toLowerCase()}`);
      }
    } catch (error) {
      const errorMessage = isNetworkError(error)
        ? NETWORK_ERROR_MESSAGE
        : `An error occurred while deleting the ${entityName.toLowerCase()}`;
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isBusy) {
      resetForm();
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className={dialogClassName || "sm:max-w-[425px]"}>
          <DialogHeader>
            <DialogTitle>{title || entityName}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {children({
              formData,
              setFormData,
              errors,
              isBusy,
              handleInputChange,
            })}

            <DialogFooter className="sm:justify-between sm:space-x-0">
              {mode === "edit" && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isBusy}
                >
                  Delete
                </Button>
              )}

              <div className="flex ml-auto gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isBusy}
                  className="rounded"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isBusy} className="rounded">
                  {isLoading ? "Saving..." : "Save"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {onDelete && (
        <DeleteConfirmationModal
          open={showDeleteConfirm}
          onOpenChange={(open) => {
            if (isDeleting) return;
            setShowDeleteConfirm(open);
          }}
          title={deleteTitle || `Delete ${entityName}`}
          description={deleteDescription || <span>Are you sure you want to delete this {entityName.toLowerCase()}?</span>}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
          confirmLabel="Delete"
          cancelLabel="Cancel"
        />
      )}
    </>
  );
}

