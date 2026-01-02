"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getGeoData, GeoData } from "@/app/[location]/customers/components/AddressCard/address-card.api";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";

import { createCity, updateCity, deleteCity, CityRow } from "../../cities.api";

interface AddCityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  location: string;
  initialData?: CityRow | null;
  mode?: "add" | "edit";
}

export function AddCityModal({
  isOpen,
  onClose,
  onSuccess,
  location,
  initialData = null,
  mode = "add",
}: AddCityModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    provinceId: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [geoData, setGeoData] = useState<GeoData>({
    city: [],
    province: [],
    country: [],
  });
  const [loadingGeoData, setLoadingGeoData] = useState(false);
  const isBusy = isLoading || isDeleting;

  // Load geo data when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setLoadingGeoData(true);
    getGeoData("province")
      .then((data) => {
        if (data) {
          setGeoData(data);
          setFormData((prev) => {
            // In edit mode, resolve provinceId from existing city province name if needed
            if (mode === "edit" && initialData) {
              const alreadySet = !!prev.provinceId;
              if (alreadySet) return prev;

              const byId =
                typeof initialData.provinceId === "number" && initialData.provinceId > 0
                  ? data.province.find((p) => p.id === initialData.provinceId)
                  : undefined;

              const byName =
                !byId && initialData.province
                  ? data.province.find((p) => p.name.toLowerCase() === initialData.province.toLowerCase())
                  : undefined;

              const resolved = byId || byName || data.province?.[0];
              return resolved ? { ...prev, provinceId: String(resolved.id) } : prev;
            }

            // Add mode: default to first province (matches screenshot behavior)
            if (prev.provinceId) return prev;
            const first = data.province?.[0];
            return first ? { ...prev, provinceId: String(first.id) } : prev;
          });
        }
      })
      .catch(() => {
        toast.error("Failed to load provinces");
      })
      .finally(() => setLoadingGeoData(false));
  }, [isOpen, mode, initialData]);

  // Initialize form data when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData && mode === "edit") {
        setFormData({
          name: initialData.name || "",
          provinceId: initialData.provinceId ? String(initialData.provinceId) : "",
        });
      } else {
        setFormData({
          name: "",
          provinceId: "",
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData, mode]);

  const resetForm = () => {
    setFormData({ name: "", provinceId: "" });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name cannot be blank.";
    }
    if (!formData.provinceId) {
      newErrors.provinceId = "Province cannot be blank.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (mode === "edit" && !initialData) {
      toast.error("Missing city data for update");
      return;
    }

    setIsLoading(true);
    try {
      const response =
        mode === "edit"
          ? await updateCity(location, {
              id: initialData!.id,
              name: formData.name.trim(),
              provinceId: Number(formData.provinceId),
            })
          : await createCity(location, {
              name: formData.name.trim(),
              provinceId: Number(formData.provinceId),
            });

      if (response.success) {
        toast.success(response.message || `City ${mode === "edit" ? "updated" : "created"} successfully`);
        resetForm();
        onClose();
        onSuccess?.();
      } else {
        toast.error(response.message || `Failed to ${mode === "edit" ? "update" : "create"} city`);
      }
    } catch (error) {
      toast.error("An error occurred while saving the city");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!initialData) return;
    setIsDeleting(true);
    try {
      const response = await deleteCity(location, initialData.id);

      if (response.success) {
        toast.success(response.message || "City deleted successfully");
        setShowDeleteConfirm(false);
        resetForm();
        onClose();
        onSuccess?.();
      } else {
        toast.error(response.message || "Failed to delete city");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the city");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>City</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className={errors.name ? "text-red-500" : ""}>
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter city name"
                className={errors.name ? "border-red-500" : ""}
                disabled={isBusy}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="province"
                className={errors.provinceId ? "text-red-500" :  ""}
              >
                Province Name
              </Label>
              <Select
                value={formData.provinceId}
                onValueChange={(value) => handleInputChange("provinceId", value)}
                disabled={isBusy || loadingGeoData}
              >
                <SelectTrigger id="province" className={errors.provinceId ? "border-red-500" : ""}>
                  <SelectValue placeholder={loadingGeoData ? "Loading..." : "Select province"} />
                </SelectTrigger>
                <SelectContent>
                  {geoData.province.length > 0 ? (
                    geoData.province.map((province) => (
                      <SelectItem key={province.id} value={province.id.toString()}>
                        {province.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="1">Ontario</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errors.provinceId && <p className="text-sm text-red-500">{errors.provinceId}</p>}
            </div>

            <DialogFooter className="sm:justify-between sm:space-x-0">
              {mode === "edit" && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isBusy}
                >
                  Delete
                </Button>
              )}

              {/* Keep Cancel + Save together (no gap), positioned at the right end */}
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

      <DeleteConfirmationModal
        open={showDeleteConfirm}
        onOpenChange={(open) => {
          if (isDeleting) return;
          setShowDeleteConfirm(open);
        }}
        title="Delete City"
        description={
          <span>
            Are you sure you want to delete this city?
          </span>
        }
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </>
  );
}

