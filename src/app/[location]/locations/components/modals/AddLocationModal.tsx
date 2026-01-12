"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

import { formatPhoneNumber, parsePhoneNumber, validatePhoneNumber } from "@/utils/phoneUtils";

import { getGeoData, GeoData } from "@/app/[location]/customers/components/AddressCard/address-card.api";
import { GenericCrudModal, CrudModalConfig } from "@/components/GenericCrudModal";

import { LocationRow } from "../../locations.api";

interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  location: string;
  initialData?: LocationRow | null;
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
  conversionDate?: Date;
};

type LocationPayload = {
  name: string;
  address: string;
  phoneNumber?: string;
  email: string;
  cityId: number;
  provinceId: number;
  countryId: number;
  postalCode: string;
  royaltyPercent: number;
  advertisementPercent: number;
  conversionDate?: string; // YYYY-MM-DD
};

type LocationUpdatePayload = LocationPayload & { id: number };

const isBlank = (v: string) => !v || v.trim().length === 0;

const toIsoDate = (d?: Date): string | undefined => {
  if (!d) return undefined;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export function AddLocationModal({
  isOpen,
  onClose,
  onSuccess,
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
    conversionDate: undefined,
    ...overrides,
  });

  const buildPayload = (formData: LocationFormData): LocationPayload => ({
    name: formData.name.trim(),
    address: formData.address.trim(),
    phoneNumber: formData.phoneNumber.trim() ? parsePhoneNumber(formData.phoneNumber.trim()) : undefined,
    email: formData.email.trim(),
    cityId: Number(formData.cityId),
    provinceId: Number(formData.provinceId),
    countryId: Number(formData.countryId),
    postalCode: formData.postalCode.trim(),
    royaltyPercent: Number(formData.royaltyPercent),
    advertisementPercent: Number(formData.advertisementPercent),
    conversionDate: toIsoDate(formData.conversionDate),
  });

  const validatePercentField = (rawValue: string, label: string): string | undefined => {
    if (isBlank(rawValue)) return `${label} cannot be blank.`;
    const n = Number(rawValue);
    if (Number.isNaN(n) || n < 0 || n > 100) return `${label} must be between 0 and 100.`;
    return undefined;
  };

  const notReadyMessage = "Location API is not ready yet.";
  const createNotReady = async (): Promise<{ success: boolean; message?: string }> => ({
    success: false,
    message: notReadyMessage,
  });
  const updateNotReady = async (): Promise<{ success: boolean; message?: string }> => ({
    success: false,
    message: notReadyMessage,
  });

  const config: CrudModalConfig<LocationRow, LocationFormData, LocationPayload, LocationUpdatePayload> = {
    entityName: "Location",
    onCreate: createNotReady,
    onUpdate: updateNotReady,
    buildCreateRequest: (formData: LocationFormData): LocationPayload => buildPayload(formData),
    buildUpdateRequest: (formData: LocationFormData, id: number): LocationUpdatePayload => ({
      id,
      ...buildPayload(formData),
    }),
    initializeFormData: (row: LocationRow): LocationFormData =>
      getBaseFormData({
        name: row.name || "",
        address: row.address || "",
        email: row.email || "",
      }),
    getDefaultFormData: (): LocationFormData => getBaseFormData(),
    validateForm: (formData: LocationFormData): Record<string, string> => {
      const errors: Record<string, string> = {};

      if (isBlank(formData.name)) errors.name = "Name cannot be blank.";
      if (isBlank(formData.address)) errors.address = "Address cannot be blank.";
      if (isBlank(formData.email)) errors.email = "Email cannot be blank.";
      if (isBlank(formData.cityId)) errors.cityId = "City cannot be blank.";
      if (isBlank(formData.provinceId)) errors.provinceId = "Province cannot be blank.";
      if (isBlank(formData.countryId)) errors.countryId = "Country cannot be blank.";
      if (isBlank(formData.postalCode)) errors.postalCode = "Postal Code cannot be blank.";

      // Phone is optional, but if provided, it must be a valid 10-digit number
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
    <GenericCrudModal<LocationRow, LocationFormData, LocationPayload, LocationUpdatePayload>
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      location={location}
      initialData={initialData}
      mode={mode}
      title="Location"
      dialogClassName="sm:max-w-[1000px]"
      config={config}
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
          </div>
        </div>
      )}
    </GenericCrudModal>
  );
}


