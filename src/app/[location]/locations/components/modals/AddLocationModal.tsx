"use client";

import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

import { formatPhoneNumber, parsePhoneNumber, validatePhoneNumber } from "@/utils/phoneUtils";

import { getGeoData, GeoData } from "@/app/[location]/customers/components/AddressCard/address-card.api";
import { GenericCrudModal, CrudModalConfig } from "@/components/GenericCrudModal";

import {
  LocationRow,
  LocationDetails,
  createLocation,
  updateLocation,
  deleteLocation,
  type CreateLocationRequest,
} from "../../locations.api";

/** Data passed to edit modal - LocationRow from list, or LocationDetails from detail page */
type LocationEditData = (LocationRow | LocationDetails) & { id: number };

interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onAfterAction?: (action: "create" | "update" | "delete") => void;
  location: string;
  initialData?: LocationEditData | null;
  mode?: "add" | "edit";
}

type LocationFormData = {
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  cityId: string;
  provinceId: string;
  countryId: string;
  postalCode: string;
  royaltyPercent: string;
  advertisementPercent: string;
  hstRegistrationNo: string;
  conversionDate?: Date;
};

type LocationUpdatePayload = CreateLocationRequest & { id: number; conversionDate?: string };

const isBlank = (v: string) => !v || v.trim().length === 0;

export function AddLocationModal({
  isOpen,
  onClose,
  onSuccess,
  onAfterAction,
  location,
  initialData = null,
  mode = "add",
}: AddLocationModalProps) {
  const [geoData, setGeoData] = useState<GeoData>({
    city: [],
    province: [],
    country: [],
  });
  const [loadingGeoData, setLoadingGeoData] = useState(false);

  const lastActionRef = useRef<"create" | "update" | "delete" | null>(null);

  const handleSuccess = useCallback(() => {
    const action = lastActionRef.current;
    if (action) {
      onAfterAction?.(action);
    }
    onSuccess?.();
  }, [onAfterAction, onSuccess]);

  useEffect(() => {
    if (!isOpen) return;
    setLoadingGeoData(true);
    getGeoData("all")
      .then((data) => {
        if (data) setGeoData(data);
      })
      .catch(() => toast.error("Failed to load geo data"))
      .finally(() => setLoadingGeoData(false));
  }, [isOpen]);

  const defaults = useMemo(() => {
    return {
      cityId: geoData.city?.[0]?.id?.toString() || "",
      provinceId: geoData.province?.[0]?.id?.toString() || "",
      countryId: geoData.country?.[0]?.id?.toString() || "",
    };
  }, [geoData.city, geoData.province, geoData.country]);

  const getBaseFormData = (overrides?: Partial<LocationFormData>): LocationFormData => ({
    name: "",
    address: "",
    phoneNumber: "",
    email: "",
    cityId: defaults.cityId,
    provinceId: defaults.provinceId,
    countryId: defaults.countryId,
    postalCode: "",
    royaltyPercent: "",
    advertisementPercent: "",
    hstRegistrationNo: "",
    conversionDate: undefined,
    ...overrides,
  });

  const buildCreatePayload = (formData: LocationFormData): CreateLocationRequest => {
    const payload: CreateLocationRequest = {
      name: formData.name.trim(),
      address: formData.address.trim(),
      phone_number: formData.phoneNumber.trim() ? parsePhoneNumber(formData.phoneNumber.trim()) ?? "" : "",
      email: formData.email.trim(),
      city_id: Number(formData.cityId),
      province_id: Number(formData.provinceId),
      country_id: Number(formData.countryId),
      postal_code: formData.postalCode.trim(),
      royaltyValue: Number(formData.royaltyPercent),
      advertisementValue: Number(formData.advertisementPercent),
    };

    const hst = formData.hstRegistrationNo?.trim();
    if (hst) payload.hstRegistrationNo = hst;

    if (formData.conversionDate) {
      const d = formData.conversionDate;
      payload.conversionDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }

    return payload;
  };

  const validatePercentField = (rawValue: string, label: string): string | undefined => {
    if (isBlank(rawValue)) return `${label} cannot be blank.`;
    const n = Number(rawValue);
    if (Number.isNaN(n) || n < 0 || n > 100) return `${label} must be between 0 and 100.`;
    return undefined;
  };

  const resolveGeoId = (list: { id: number; name: string }[], name?: string) =>
    (name && list.find((x) => x.name === name)?.id?.toString()) || "";

  const config: CrudModalConfig<LocationEditData, LocationFormData, CreateLocationRequest, LocationUpdatePayload> = {
    entityName: "Location",
    onCreate: async (loc, payload) => {
      lastActionRef.current = "create";
      return createLocation(loc, payload);
    },
    onUpdate: async (loc, payload) => {
      lastActionRef.current = "update";
      return updateLocation(loc, payload);
    },
    onDelete: async (loc, id) => {
      lastActionRef.current = "delete";
      return deleteLocation(loc, id);
    },
    buildCreateRequest: (formData: LocationFormData): CreateLocationRequest => buildCreatePayload(formData),
    buildUpdateRequest: (formData: LocationFormData, id: number): LocationUpdatePayload => {
      const base = buildCreatePayload(formData);
      const payload: LocationUpdatePayload = { id, ...base };
      return payload;
    },
    initializeFormData: (row: LocationEditData): LocationFormData => {
      const details = row as LocationDetails;
      return getBaseFormData({
        name: row.name || "",
        address: row.address || "",
        email: row.email || "",
        phoneNumber: details.phoneNumber || "",
        postalCode: details.postalCode || "",
        royaltyPercent: details.royaltyPercent?.toString() ?? "",
        advertisementPercent: details.advertisementPercent?.toString() ?? "",
        hstRegistrationNo: details.hstRegistrationNo || "",
        cityId: resolveGeoId(geoData.city, details.city) || defaults.cityId,
        provinceId: resolveGeoId(geoData.province, details.province) || defaults.provinceId,
        countryId: resolveGeoId(geoData.country, details.country) || defaults.countryId,
        conversionDate: details.conversionDate ? new Date(details.conversionDate) : undefined,
      });
    },
    getDefaultFormData: (): LocationFormData => getBaseFormData(),
    validateForm: (formData: LocationFormData): Record<string, string> => {
      const errors: Record<string, string> = {};

      if (isBlank(formData.name)) errors.name = "Name cannot be blank.";
      if (isBlank(formData.address)) errors.address = "Address cannot be blank.";
      if (isBlank(formData.phoneNumber)) errors.phoneNumber = "Phone Number cannot be blank.";
      if (isBlank(formData.email)) errors.email = "Email cannot be blank.";
      if (isBlank(formData.cityId)) errors.cityId = "City cannot be blank.";
      if (isBlank(formData.provinceId)) errors.provinceId = "Province cannot be blank.";
      if (isBlank(formData.countryId)) errors.countryId = "Country cannot be blank.";
      if (isBlank(formData.postalCode)) errors.postalCode = "Postal Code cannot be blank.";

      // Phone is required and must be a valid 10-digit number
      if (!isBlank(formData.phoneNumber) && !validatePhoneNumber(formData.phoneNumber)) {
        errors.phoneNumber = "Phone Number must be 10 digits.";
      }

      const royaltyError = validatePercentField(formData.royaltyPercent, "Royalty (%)");
      if (royaltyError) errors.royaltyPercent = royaltyError;

      const advertisementError = validatePercentField(formData.advertisementPercent, "Advertisement (%)");
      if (advertisementError) errors.advertisementPercent = advertisementError;

      return errors;
    },
  };

  return (
    <GenericCrudModal<LocationEditData, LocationFormData, CreateLocationRequest, LocationUpdatePayload>
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={handleSuccess}
      location={location}
      initialData={initialData}
      mode={mode}
      title="Location"
      dialogClassName="sm:max-w-[1000px]"
      config={config}
      deleteTitle="Delete Location"
      deleteDescription={<span>Are you sure you want to delete this location?</span>}
    >
      {({ formData, errors, isBusy, handleInputChange }) => (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className={errors.address ? "text-red-500" : ""}>
                Address
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className={errors.address ? "border-red-500" : ""}
                disabled={isBusy}
              />
              {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className={errors.phoneNumber ? "text-red-500" : ""}>
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", formatPhoneNumber(e.target.value))}
                className={errors.phoneNumber ? "border-red-500" : ""}
                disabled={isBusy}
              />
              {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className={errors.email ? "text-red-500" : ""}>
                Email
              </Label>
              <Input
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={errors.email ? "border-red-500" : ""}
                disabled={isBusy}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className={errors.cityId ? "text-red-500" : ""}>City</Label>
              <Select
                value={formData.cityId}
                onValueChange={(value) => handleInputChange("cityId", value)}
                disabled={isBusy || loadingGeoData}
              >
                <SelectTrigger className={errors.cityId ? "border-red-500" : ""}>
                  <SelectValue placeholder={loadingGeoData ? "Loading..." : "Select city"} />
                </SelectTrigger>
                <SelectContent>
                  {geoData.city.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.cityId && <p className="text-sm text-red-500">{errors.cityId}</p>}
            </div>

            <div className="space-y-2">
              <Label className={errors.provinceId ? "text-red-500" : ""}>Province</Label>
              <Select
                value={formData.provinceId}
                onValueChange={(value) => handleInputChange("provinceId", value)}
                disabled={isBusy || loadingGeoData}
              >
                <SelectTrigger className={errors.provinceId ? "border-red-500" : ""}>
                  <SelectValue placeholder={loadingGeoData ? "Loading..." : "Select province"} />
                </SelectTrigger>
                <SelectContent>
                  {geoData.province.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.provinceId && <p className="text-sm text-red-500">{errors.provinceId}</p>}
            </div>

            <div className="space-y-2">
              <Label className={errors.countryId ? "text-red-500" : ""}>Country</Label>
              <Select
                value={formData.countryId}
                onValueChange={(value) => handleInputChange("countryId", value)}
                disabled={isBusy || loadingGeoData}
              >
                <SelectTrigger className={errors.countryId ? "border-red-500" : ""}>
                  <SelectValue placeholder={loadingGeoData ? "Loading..." : "Select country"} />
                </SelectTrigger>
                <SelectContent>
                  {geoData.country.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.countryId && <p className="text-sm text-red-500">{errors.countryId}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="postalCode" className={errors.postalCode ? "text-red-500" : ""}>
                Postal Code
              </Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => handleInputChange("postalCode", e.target.value)}
                className={errors.postalCode ? "border-red-500" : ""}
                disabled={isBusy}
              />
              {errors.postalCode && <p className="text-sm text-red-500">{errors.postalCode}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="royaltyPercent" className={errors.royaltyPercent ? "text-red-500" : ""}>
                Royalty (%)
              </Label>
              <Input
                id="royaltyPercent"
                inputMode="decimal"
                value={formData.royaltyPercent}
                onChange={(e) => handleInputChange("royaltyPercent", e.target.value)}
                className={errors.royaltyPercent ? "border-red-500" : ""}
                disabled={isBusy}
              />
              {errors.royaltyPercent && <p className="text-sm text-red-500">{errors.royaltyPercent}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="advertisementPercent" className={errors.advertisementPercent ? "text-red-500" : ""}>
                Advertisement (%)
              </Label>
              <Input
                id="advertisementPercent"
                inputMode="decimal"
                value={formData.advertisementPercent}
                onChange={(e) => handleInputChange("advertisementPercent", e.target.value)}
                className={errors.advertisementPercent ? "border-red-500" : ""}
                disabled={isBusy}
              />
              {errors.advertisementPercent && (
                <p className="text-sm text-red-500">{errors.advertisementPercent}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Conversion Date</Label>
              <DatePicker
                value={formData.conversionDate}
                onSelect={(d) => handleInputChange("conversionDate", d)}
                placeholder="Pick a date"
                disabled={isBusy}
              />
            </div>

            {mode === "edit" && (
              <div className="space-y-2">
                <Label htmlFor="hstRegistrationNo">HST Registration Number</Label>
                <Input
                  id="hstRegistrationNo"
                  value={formData.hstRegistrationNo}
                  onChange={(e) => handleInputChange("hstRegistrationNo", e.target.value)}
                  disabled={isBusy}
                  placeholder="Enter HST registration number"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </GenericCrudModal>
  );
}


