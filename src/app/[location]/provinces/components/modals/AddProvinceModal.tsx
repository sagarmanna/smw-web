"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GenericCrudModal, CrudModalConfig } from "@/components/GenericCrudModal";

import { getGeoData, GeoData } from "@/app/[location]/customers/components/AddressCard/address-card.api";
import {
  createProvince,
  updateProvince,
  deleteProvince,
  ProvinceRow,
  CreateProvinceRequest,
  UpdateProvinceRequest,
} from "../../provinces.api";

interface AddProvinceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  location: string;
  initialData?: ProvinceRow | null;
  mode?: "add" | "edit";
}

type ProvinceFormData = {
  name: string;
  taxRate: string;
  countryId: string;
};

export function AddProvinceModal({
  isOpen,
  onClose,
  onSuccess,
  location,
  initialData = null,
  mode = "add",
}: AddProvinceModalProps) {
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
    getGeoData("country")
      .then((data) => {
        if (data) {
          setGeoData(data);
        }
      })
      .catch(() => {
        toast.error("Failed to load countries");
      })
      .finally(() => setLoadingGeoData(false));
  }, [isOpen]);

  const config: CrudModalConfig<ProvinceRow, ProvinceFormData, CreateProvinceRequest, UpdateProvinceRequest> = {
    entityName: "Province",
    onCreate: createProvince,
    onUpdate: updateProvince,
    onDelete: deleteProvince,
    buildCreateRequest: (formData: ProvinceFormData): CreateProvinceRequest => ({
      name: formData.name.trim(),
      taxRate: Number(formData.taxRate),
      countryId: Number(formData.countryId),
    }),
    buildUpdateRequest: (formData: ProvinceFormData, id: number): UpdateProvinceRequest => ({
      id,
      name: formData.name.trim(),
      taxRate: Number(formData.taxRate),
      countryId: Number(formData.countryId),
    }),
    initializeFormData: (row: ProvinceRow): ProvinceFormData => {
      let countryId = row.countryId ? String(row.countryId) : "";

      // If API row only has country name, resolve countryId from geodata
      if (!countryId && row.country && geoData.country.length > 0) {
        const match = geoData.country.find((c) => c.name.toLowerCase() === row.country.toLowerCase());
        if (match) countryId = String(match.id);
      }

      // Fallback: default to first country so Select is never blank in edit mode
      if (!countryId && geoData.country.length > 0) {
        countryId = String(geoData.country[0].id);
      }

      return {
        name: row.name || "",
        taxRate: Number.isFinite(row.taxRate) ? String(row.taxRate) : "",
        countryId,
      };
    },
    getDefaultFormData: (): ProvinceFormData => ({
      name: "",
      taxRate: "",
      countryId: geoData.country?.[0]?.id?.toString() || "",
    }),
    validateForm: (formData: ProvinceFormData): Record<string, string> => {
      const errors: Record<string, string> = {};
      if (!formData.name.trim()) {
        errors.name = "Name cannot be blank.";
      }

      const parsedTaxRate = Number(formData.taxRate);
      if (!formData.taxRate.trim()) {
        errors.taxRate = "Tax rate cannot be blank.";
      } else if (!Number.isFinite(parsedTaxRate)) {
        errors.taxRate = "Tax rate must be a number.";
      } else if (parsedTaxRate < 0 || parsedTaxRate > 100) {
        errors.taxRate = "Tax rate must be between 0 and 100.";
      }

      if (!formData.countryId) {
        errors.countryId = "Country cannot be blank.";
      }
      return errors;
    },
  };

  return (
    <GenericCrudModal<ProvinceRow, ProvinceFormData, CreateProvinceRequest, UpdateProvinceRequest>
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
              placeholder="Enter province name"
              className={errors.name ? "border-red-500" : ""}
              disabled={isBusy}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxRate" className={errors.taxRate ? "text-red-500" : ""}>
              Tax Rate (%)
            </Label>
            <Input
              id="taxRate"
              value={formData.taxRate}
              onChange={(e) => handleInputChange("taxRate", e.target.value)}
              placeholder="Enter tax rate"
              className={errors.taxRate ? "border-red-500" : ""}
              disabled={isBusy}
              inputMode="decimal"
            />
            {errors.taxRate && <p className="text-sm text-red-500">{errors.taxRate}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="country" className={errors.countryId ? "text-red-500" : ""}>
              Country
            </Label>
            <Select
              value={formData.countryId}
              onValueChange={(value) => handleInputChange("countryId", value)}
              disabled={isBusy || loadingGeoData}
            >
              <SelectTrigger id="country" className={errors.countryId ? "border-red-500" : ""}>
                <SelectValue placeholder={loadingGeoData ? "Loading..." : "Select country"} />
              </SelectTrigger>
              <SelectContent>
                {geoData.country.length > 0 ? (
                  geoData.country.map((country) => (
                    <SelectItem key={country.id} value={country.id.toString()}>
                      {country.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="1">Canada</SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.countryId && <p className="text-sm text-red-500">{errors.countryId}</p>}
          </div>
        </>
      )}
    </GenericCrudModal>
  );
}


