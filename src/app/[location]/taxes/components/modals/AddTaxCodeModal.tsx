"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GenericCrudModal, CrudModalConfig } from "@/components/GenericCrudModal";
import { getGeoData, GeoData } from "@/app/[location]/customers/components/AddressCard/address-card.api";
import { convertToDate } from "@/utils/dateUtils";

import {
  createTaxCode,
  deleteTaxCode,
  TaxCodeRow,
  CreateTaxCodeRequest,
  updateTaxCode,
  UpdateTaxCodeRequest,
} from "../../taxes.api";
import { getTaxTypeIdByName, getTaxTypeNameOptions } from "../../taxTypes";
import { formatDateToApiDisplay, normalizeStartDateValue, resolveStartDateForApi } from "../../utils/taxCodeUtils";
import { toTwoDecimalNumber, validateRateInput } from "../../utils/taxRateUtils";

interface AddTaxCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  location: string;
  initialData?: TaxCodeRow | null;
  mode?: "add" | "edit";
}

type TaxCodeFormData = {
  taxName: string;
  provinceId: string;
  code: string;
  rate: string;
  startDate: string;
};

export function AddTaxCodeModal({
  isOpen,
  onClose,
  onSuccess,
  location,
  initialData = null,
  mode = "add",
}: AddTaxCodeModalProps) {
  const [geoData, setGeoData] = useState<GeoData>({
    city: [],
    province: [],
    country: [],
  });
  const [loadingGeoData, setLoadingGeoData] = useState(false);

  const taxNameOptions = useMemo(() => getTaxTypeNameOptions(), []);

  // Load provinces when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setLoadingGeoData(true);
    getGeoData("province")
      .then((data) => {
        if (data) setGeoData(data);
      })
      .catch(() => toast.error("Failed to load provinces"))
      .finally(() => setLoadingGeoData(false));
  }, [isOpen]);

  const config: CrudModalConfig<TaxCodeRow, TaxCodeFormData, CreateTaxCodeRequest, UpdateTaxCodeRequest> = {
    entityName: "Tax Code",
    onCreate: createTaxCode,
    onUpdate: updateTaxCode,
    onDelete: deleteTaxCode,
    buildCreateRequest: (formData) => ({
      taxTypeId: getTaxTypeIdByName(formData.taxName) ?? 0,
      provinceId: Number(formData.provinceId),
      code: formData.code.trim(),
      rate: toTwoDecimalNumber(formData.rate),
      // If startDate is empty, send the agreed default to avoid backend using an invalid sentinel date.
      startDate: resolveStartDateForApi(formData.startDate),
    }),
    buildUpdateRequest: (formData, id) => ({
      id,
      taxTypeId: getTaxTypeIdByName(formData.taxName) ?? 0,
      provinceId: Number(formData.provinceId),
      code: formData.code.trim(),
      rate: toTwoDecimalNumber(formData.rate),
      startDate: resolveStartDateForApi(formData.startDate),
    }),
    initializeFormData: (row) => {
      let provinceId = row.provinceId ? String(row.provinceId) : "";
      if (!provinceId && row.provinceName && geoData.province.length > 0) {
        const match = geoData.province.find((p) => p.name.toLowerCase() === row.provinceName.toLowerCase());
        if (match) provinceId = String(match.id);
      }
      if (!provinceId && geoData.province.length > 0) {
        provinceId = String(geoData.province[0].id);
      }

      const taxName = row.taxName || taxNameOptions[0] || "";

      return {
        taxName,
        provinceId,
        code: row.code || "",
        rate: row.rate !== undefined && row.rate !== null ? String(row.rate) : "",
        // In edit mode, always show the (normalized) table value in the DatePicker.
        startDate: normalizeStartDateValue(row.startDate),
      };
    },
    getDefaultFormData: () => ({
      taxName: taxNameOptions[0] || "",
      provinceId: geoData.province?.[0]?.id?.toString() || "",
      code: "",
      rate: "",
      startDate: "",
    }),
    validateForm: (formData) => {
      const errors: Record<string, string> = {};

      if (!formData.taxName) errors.taxName = "Tax Name cannot be blank.";
      if (formData.taxName && !getTaxTypeIdByName(formData.taxName)) {
        errors.taxName = "Invalid Tax Name.";
      }
      if (!formData.provinceId) errors.provinceId = "Province cannot be blank.";

      if (!formData.code.trim()) {
        errors.code = "Code cannot be blank.";
      }

      const rateError = validateRateInput(formData.rate);
      if (rateError) errors.rate = rateError;

      return errors;
    },
  };

  return (
    <GenericCrudModal<TaxCodeRow, TaxCodeFormData, CreateTaxCodeRequest, UpdateTaxCodeRequest>
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      location={location}
      initialData={initialData}
      mode={mode}
      config={config}
      title="Tax Code"
    >
      {({ formData, errors, isBusy, handleInputChange }) => (
        <>
          {/** Keep date value derived from stored ISO string */}
          {/** If formData.startDate is already ISO (YYYY-MM-DD), convertToDate handles it */}
          {/** If API returns a different date string, convertToDate still attempts native parsing */}
          {/** (this mirrors other modals in the codebase). */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="taxName" className={errors.taxName ? "text-red-500" : ""}>
                Tax Name
              </Label>
              <Select
                value={formData.taxName}
                onValueChange={(value) => handleInputChange("taxName", value)}
                disabled={isBusy}
              >
                <SelectTrigger id="taxName" className={errors.taxName ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select tax name" />
                </SelectTrigger>
                <SelectContent>
                  {taxNameOptions.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.taxName && <p className="text-sm text-red-500">{errors.taxName}</p>}
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

            <div className="space-y-2">
              <Label htmlFor="code" className={errors.code ? "text-red-500" : ""}>
                Code
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value)}
                placeholder="Enter code"
                className={errors.code ? "border-red-500" : ""}
                disabled={isBusy}
              />
              {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate" className={errors.rate ? "text-red-500" : ""}>
                Rate
              </Label>
              <Input
                id="rate"
                value={formData.rate}
                onChange={(e) => handleInputChange("rate", e.target.value)}
                placeholder="Enter rate"
                className={errors.rate ? "border-red-500" : ""}
                disabled={isBusy}
                inputMode="decimal"
              />
              {errors.rate && <p className="text-sm text-red-500">{errors.rate}</p>}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <DatePicker
                id="startDate"
                label="Start Date"
                value={formData.startDate ? convertToDate(formData.startDate) : undefined}
                onSelect={(date) => {
                  handleInputChange("startDate", date ? formatDateToApiDisplay(date) : "");
                }}
                placeholder="Pick a date"
                fromYear={2000}
                toYear={2125}
                disabled={isBusy}
              />
            </div>
          </div>
        </>
      )}
    </GenericCrudModal>
  );
}


