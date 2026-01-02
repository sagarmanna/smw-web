"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getGeoData, GeoData } from "@/app/[location]/customers/components/AddressCard/address-card.api";
import { GenericCrudModal, CrudModalConfig } from "@/components/GenericCrudModal";
import { createCity, updateCity, deleteCity, CityRow, CreateCityRequest, UpdateCityRequest } from "../../cities.api";

interface AddCityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  location: string;
  initialData?: CityRow | null;
  mode?: "add" | "edit";
}

type CityFormData = {
  name: string;
  provinceId: string;
};

export function AddCityModal({
  isOpen,
  onClose,
  onSuccess,
  location,
  initialData = null,
  mode = "add",
}: AddCityModalProps) {
  const [geoData, setGeoData] = useState<GeoData>({
    city: [],
    province: [],
    country: [],
  });
  const [loadingGeoData, setLoadingGeoData] = useState(false);

  // Load geo data when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setLoadingGeoData(true);
    getGeoData("province")
      .then((data) => {
        if (data) {
          setGeoData(data);
        }
      })
      .catch(() => {
        toast.error("Failed to load provinces");
      })
      .finally(() => setLoadingGeoData(false));
  }, [isOpen]);

  const config: CrudModalConfig<CityRow, CityFormData, CreateCityRequest, UpdateCityRequest> = {
    entityName: "City",
    onCreate: createCity,
    onUpdate: updateCity,
    onDelete: deleteCity,
    buildCreateRequest: (formData: CityFormData): CreateCityRequest => ({
      name: formData.name.trim(),
      provinceId: Number(formData.provinceId),
    }),
    buildUpdateRequest: (formData: CityFormData, id: number): UpdateCityRequest => ({
      id,
      name: formData.name.trim(),
      provinceId: Number(formData.provinceId),
    }),
    initializeFormData: (row: CityRow): CityFormData => {
      let provinceId = row.provinceId ? String(row.provinceId) : "";

      // If API row only has province name, resolve provinceId from geodata
      if (!provinceId && row.province && geoData.province.length > 0) {
        const match = geoData.province.find(
          (p) => p.name.toLowerCase() === row.province.toLowerCase()
        );
        if (match) provinceId = String(match.id);
      }

      // Fallback: default to first province so Select is never blank in edit mode
      if (!provinceId && geoData.province.length > 0) {
        provinceId = String(geoData.province[0].id);
      }

      return {
        name: row.name || "",
        provinceId,
      };
    },
    getDefaultFormData: (): CityFormData => ({
      name: "",
      provinceId: geoData.province?.[0]?.id?.toString() || "",
    }),
    validateForm: (formData: CityFormData): Record<string, string> => {
      const errors: Record<string, string> = {};
      if (!formData.name.trim()) {
        errors.name = "Name cannot be blank.";
      }
      if (!formData.provinceId) {
        errors.provinceId = "Province cannot be blank.";
      }
      return errors;
    },
  };

  // Note: edit-mode province resolution is handled in initializeFormData (and will rerun after geoData loads)

  return (
    <GenericCrudModal<CityRow, CityFormData, CreateCityRequest, UpdateCityRequest>
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      location={location}
      initialData={initialData}
      mode={mode}
      config={config}
    >
      {({ formData, errors, isBusy, handleInputChange }) => (
        <>
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
            <Label htmlFor="province" className={errors.provinceId ? "text-red-500" : ""}>
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
        </>
      )}
    </GenericCrudModal>
  );
}
