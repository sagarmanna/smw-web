"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getReferralSources, type ReferralSourceData } from "@/app/[location]/customers/components/DetailsCard/referralSource";
import { getGeoData, type GeoData } from "@/app/[location]/customers/components/AddressCard/address-card.api";
import { cn } from "@/lib/utils";
import { formatPhoneNumber } from "@/utils/phoneUtils";

interface NewCustomerDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack?: () => void;
  onNext?: (data: CustomerDetailsFormData) => void;
  location: string;
  /**
   * Optional initial data used to re-hydrate the form
   * when navigating back from later wizard steps.
   */
  initialData?: Partial<CustomerDetailsFormData>;
}

export interface CustomerDetailsFormData {
  firstName: string;
  lastName: string;
  email: string;
  emailLabel: string;
  phone: string;
  phoneExt: string;
  phoneLabel: string;
  addressLabel: string;
  streetAddress: string;
  city: string;
  cityId: number;
  province: string;
  provinceId: number;
  country: string;
  countryId: number;
  postalCode: string;
  referralSource: string;
  referralSourceId?: number;
  referralSourceDescription?: string;
}

const defaultFormData: CustomerDetailsFormData = {
  firstName: "",
  lastName: "",
  email: "",
  emailLabel: "Home",
  phone: "",
  phoneExt: "",
  phoneLabel: "Home",
  addressLabel: "Home",
  streetAddress: "",
  city: "",
  cityId: 0,
  province: "",
  provinceId: 1,
  country: "",
  countryId: 1,
  postalCode: "",
  referralSource: "", // Default selection
};

const LABEL_OPTIONS = ["Home", "Work", "Other"];

export function NewCustomerDetailsModal({
  open,
  onOpenChange,
  onBack,
  onNext,
  location: _location,
  initialData,
}: NewCustomerDetailsModalProps) {
  const [formData, setFormData] = React.useState<CustomerDetailsFormData>({
    ...defaultFormData,
    ...initialData,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [referralSources, setReferralSources] = React.useState<ReferralSourceData[]>([]);
  const [loadingReferralSources, setLoadingReferralSources] = React.useState(false);
  const [geoData, setGeoData] = React.useState<GeoData>({
    city: [],
    province: [],
    country: [],
  });
  const [loadingGeoData, setLoadingGeoData] = React.useState(false);

  // Load referral sources
  React.useEffect(() => {
    if (!open) return;
    setLoadingReferralSources(true);
    getReferralSources()
      .then((sources) => {
        // Just load the list; do not auto-select any value so the field
        // can remain empty by default unless the user chooses one.
        setReferralSources(sources);
      })
      .catch((err) => console.error("Error fetching referral sources:", err))
      .finally(() => setLoadingReferralSources(false));
  }, [open]);

  // Load geo data
  React.useEffect(() => {
    if (!open) return;
    setLoadingGeoData(true);
    getGeoData("all")
      .then((data) => {
        if (data) {
          setGeoData(data);
          // Set default province and country if available
          if (data.province.length > 0 && formData.provinceId === 1) {
            const ontario = data.province.find((p) => p.name.toLowerCase().includes("ontario"));
            if (ontario) {
              setFormData((prev) => ({ ...prev, provinceId: ontario.id, province: ontario.name }));
            }
          }
          if (data.country.length > 0 && formData.countryId === 1) {
            const canada = data.country.find((c) => c.name.toLowerCase().includes("canada"));
            if (canada) {
              setFormData((prev) => ({ ...prev, countryId: canada.id, country: canada.name }));
            }
          }
        }
      })
      .catch((err) => console.error("Error fetching geo data:", err))
      .finally(() => setLoadingGeoData(false));
  }, [open]);

  // Reset / hydrate form when modal opens or initialData changes
  React.useEffect(() => {
    if (open) {
      setFormData((prev) => ({
        ...defaultFormData,
        ...prev,
        ...initialData,
      }));
    } else {
      setFormData(defaultFormData);
      setErrors({});
    }
  }, [open, initialData]);

  const handleFieldChange = (field: keyof CustomerDetailsFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    handleFieldChange("phone", formatted);
  };

  const handleCityChange = (cityId: string) => {
    const id = parseInt(cityId, 10);
    const city = geoData.city.find((c) => c.id === id);
    setFormData((prev) => ({
      ...prev,
      cityId: id,
      city: city?.name || "",
    }));
    if (errors.city) setErrors((prev) => ({ ...prev, city: "" }));
  };

  const handleProvinceChange = (provinceId: string) => {
    const id = parseInt(provinceId, 10);
    const province = geoData.province.find((p) => p.id === id);
    setFormData((prev) => ({
      ...prev,
      provinceId: id,
      province: province?.name || "",
      // Reset city when province changes
      city: "",
      cityId: 0,
    }));
  };

  const handleCountryChange = (countryId: string) => {
    const id = parseInt(countryId, 10);
    const country = geoData.country.find((c) => c.id === id);
    setFormData((prev) => ({
      ...prev,
      countryId: id,
      country: country?.name || "",
      // Reset province and city when country changes
      province: "",
      provinceId: 1,
      city: "",
      cityId: 0,
    }));
  };

  const handleReferralSourceChange = (sourceName: string) => {
    const source = referralSources.find((s) => s.name === sourceName);
    setFormData((prev) => ({
      ...prev,
      referralSource: sourceName,
      referralSourceId: source?.id,
      referralSourceDescription: sourceName.toLowerCase().includes("other") ? prev.referralSourceDescription : undefined,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName?.trim()) newErrors.firstName = "Firstname cannot be blank.";
    if (!formData.lastName?.trim()) newErrors.lastName = "Lastname cannot be blank.";
    if (!formData.email?.trim()) newErrors.email = "Email cannot be blank.";
    if (!formData.phone?.trim()) newErrors.phone = "Number cannot be blank.";
    if (!formData.streetAddress?.trim()) newErrors.streetAddress = "Address cannot be blank.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateForm()) return;
    onNext?.(formData);
  };

  const isOtherSelected = formData.referralSource?.toLowerCase().includes("other");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Customer Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Customer Name */}
          <div className="flex items-center gap-4">
            <Label className="text-sm font-semibold w-40">Customer Name</Label>
            <div className="flex-1 flex items-center gap-2">
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleFieldChange("firstName", e.target.value)}
                placeholder="First Name"
                className={cn("flex-1", errors.firstName && "border-red-500")}
              />
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleFieldChange("lastName", e.target.value)}
                placeholder="Last Name"
                className={cn("flex-1", errors.lastName && "border-red-500")}
              />
            </div>
          </div>
          {(errors.firstName || errors.lastName) && (
            <div className="flex items-center gap-4">
              <div className="w-40"></div>
              <div className="flex-1 flex items-center gap-2">
                {errors.firstName && <p className="text-xs text-red-500 flex-1">{errors.firstName}</p>}
                {errors.lastName && <p className="text-xs text-red-500 flex-1">{errors.lastName}</p>}
              </div>
            </div>
          )}

          {/* Customer Email */}
          <div className="flex items-center gap-4">
            <Label className="text-sm font-semibold w-40">Customer Email</Label>
            <div className="flex-1 flex items-center gap-2">
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                placeholder="Email"
                className={cn("flex-1", errors.email && "border-red-500")}
              />
              <Select
                value={formData.emailLabel}
                onValueChange={(value) => handleFieldChange("emailLabel", value)}
              >
                <SelectTrigger id="emailLabel" className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LABEL_OPTIONS.map((label) => (
                    <SelectItem key={label} value={label}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {errors.email && (
            <div className="flex items-center gap-4">
              <div className="w-40"></div>
              <p className="text-xs text-red-500">{errors.email}</p>
            </div>
          )}

          {/* Customer Phone */}
          <div className="flex items-center gap-4">
            <Label className="text-sm font-semibold w-40">Customer Phone</Label>
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1">
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handlePhoneNumberChange}
                  placeholder="(___) ___-____"
                  maxLength={14}
                  className={cn("w-full", errors.phone && "border-red-500")}
                />
              </div>
              <Input
                id="phoneExt"
                type="text"
                value={formData.phoneExt}
                onChange={(e) => handleFieldChange("phoneExt", e.target.value)}
                placeholder="Ext"
                className="w-20"
              />
              <Select
                value={formData.phoneLabel}
                onValueChange={(value) => handleFieldChange("phoneLabel", value)}
              >
                <SelectTrigger id="phoneLabel" className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LABEL_OPTIONS.map((label) => (
                    <SelectItem key={label} value={label}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {errors.phone && (
            <div className="flex items-center gap-4">
              <div className="w-40"></div>
              <p className="text-xs text-red-500">{errors.phone}</p>
            </div>
          )}

          {/* Customer Address */}
          <div className="flex items-center gap-4">
            <Label className="text-sm font-semibold w-40">Customer Address</Label>
            <div className="flex-1 flex items-center gap-2">
              <Select
                value={formData.addressLabel}
                onValueChange={(value) => handleFieldChange("addressLabel", value)}
              >
                <SelectTrigger id="addressLabel" className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LABEL_OPTIONS.map((label) => (
                    <SelectItem key={label} value={label}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex-1">
                <Input
                  id="streetAddress"
                  value={formData.streetAddress}
                  onChange={(e) => handleFieldChange("streetAddress", e.target.value)}
                  placeholder="Street Address"
                  className={cn("w-full", errors.streetAddress && "border-red-500")}
                />
              </div>
            </div>
          </div>
          {errors.streetAddress && (
            <div className="flex items-center gap-4">
              <div className="w-40"></div>
              <p className="text-xs text-red-500">{errors.streetAddress}</p>
            </div>
          )}
          <div className="flex items-center gap-4">
            <div className="w-40"></div>
            <Select
              value={formData.cityId > 0 ? formData.cityId.toString() : ""}
              onValueChange={handleCityChange}
              disabled={loadingGeoData}
            >
              <SelectTrigger id="city" className="flex-1">
                <SelectValue placeholder={loadingGeoData ? "Loading..." : "Toronto"} />
              </SelectTrigger>
              <SelectContent>
                {geoData.city.map((city) => (
                  <SelectItem key={city.id} value={city.id.toString()}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-40"></div>
            <Select
              value={formData.provinceId.toString()}
              onValueChange={handleProvinceChange}
              disabled={loadingGeoData}
            >
              <SelectTrigger id="province" className="flex-1">
                <SelectValue placeholder={loadingGeoData ? "Loading..." : "Ontario"} />
              </SelectTrigger>
              <SelectContent>
                {geoData.province.map((province) => (
                  <SelectItem key={province.id} value={province.id.toString()}>
                    {province.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-40"></div>
            <Select
              value={formData.countryId.toString()}
              onValueChange={handleCountryChange}
              disabled={loadingGeoData}
            >
              <SelectTrigger id="country" className="flex-1">
                <SelectValue placeholder={loadingGeoData ? "Loading..." : "Canada"} />
              </SelectTrigger>
              <SelectContent>
                {geoData.country.map((country) => (
                  <SelectItem key={country.id} value={country.id.toString()}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-40"></div>
            <Input
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) => handleFieldChange("postalCode", e.target.value)}
              placeholder="Postal Code"
              className="flex-1"
            />
          </div>

          {/* How did you find us? */}
          <div className="flex items-start gap-4">
            <Label className="text-sm font-semibold w-40 pt-2">
              How did you find us?
            </Label>
            <div className="flex-1">
              {loadingReferralSources ? (
                <p className="text-sm text-muted-foreground">Loading referral sources...</p>
              ) : (
                <div className="space-y-2 mt-2">
                  {referralSources.map((source) => (
                    <div key={source.id} className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleReferralSourceChange(source.name)}
                        className={cn(
                          "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                          formData.referralSource === source.name
                            ? "border-primary bg-primary"
                            : "border-input hover:border-primary/50"
                        )}
                      >
                        {formData.referralSource === source.name && (
                          <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReferralSourceChange(source.name)}
                        className={cn(
                          "text-sm font-normal text-left transition-colors",
                          formData.referralSource === source.name
                            ? "text-primary font-medium"
                            : "text-foreground hover:text-primary/80"
                        )}
                      >
                        {source.name}
                      </button>
                    </div>
                  ))}
                  {isOtherSelected && (
                    <div className="ml-6 space-y-2">
                      <Input
                        value={formData.referralSourceDescription || ""}
                        onChange={(e) => handleFieldChange("referralSourceDescription", e.target.value)}
                        placeholder="Please provide details"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="!flex !flex-row !justify-between !items-center gap-2">
          <Button onClick={onBack}>Back</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleNext}>Next</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

