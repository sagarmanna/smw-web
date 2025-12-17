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

interface NewCustomerDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack?: () => void;
  onNext?: (data: CustomerDetailsFormData) => void;
  location: string;
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
  referralSource: "",
};

const LABEL_OPTIONS = ["Home", "Work", "Other"];

export function NewCustomerDetailsModal({
  open,
  onOpenChange,
  onBack,
  onNext,
  location: _location,
}: NewCustomerDetailsModalProps) {
  const [formData, setFormData] = React.useState<CustomerDetailsFormData>(defaultFormData);
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
      .then((sources) => setReferralSources(sources))
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

  // Reset form when modal closes
  React.useEffect(() => {
    if (!open) {
      setFormData(defaultFormData);
      setErrors({});
    }
  }, [open]);

  const handleFieldChange = (field: keyof CustomerDetailsFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
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
    if (errors.referralSource) setErrors((prev) => ({ ...prev, referralSource: "" }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName?.trim()) newErrors.firstName = "First name cannot be blank.";
    if (!formData.lastName?.trim()) newErrors.lastName = "Last name cannot be blank.";
    if (!formData.email?.trim()) newErrors.email = "Email cannot be blank.";
    if (!formData.referralSource?.trim()) newErrors.referralSource = "Please select how you found us.";
    
    const isOtherSelected = formData.referralSource?.toLowerCase().includes("other");
    if (isOtherSelected && !formData.referralSourceDescription?.trim()) {
      newErrors.referralSourceDescription = "Please provide additional details.";
    }

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
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Customer Name</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className={cn(errors.firstName && "text-red-600 dark:text-red-400")}>
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleFieldChange("firstName", e.target.value)}
                  placeholder="Enter first name"
                  className={cn(errors.firstName && "border-red-500")}
                />
                {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className={cn(errors.lastName && "text-red-600 dark:text-red-400")}>
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleFieldChange("lastName", e.target.value)}
                  placeholder="Enter last name"
                  className={cn(errors.lastName && "border-red-500")}
                />
                {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
              </div>
            </div>
          </div>

          {/* Customer Email */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Customer Email</Label>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <div className="space-y-2">
                <Label htmlFor="email" className={cn(errors.email && "text-red-600 dark:text-red-400")}>
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  placeholder="Enter email"
                  className={cn(errors.email && "border-red-500")}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailLabel">Home</Label>
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
          </div>

          {/* Customer Phone */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Customer Phone</Label>
            <div className="grid grid-cols-[1fr_auto_auto] gap-2">
              <div className="space-y-2">
                <Label htmlFor="phone">number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneExt">Ext</Label>
                <Input
                  id="phoneExt"
                  type="text"
                  value={formData.phoneExt}
                  onChange={(e) => handleFieldChange("phoneExt", e.target.value)}
                  placeholder="Ext"
                  className="w-20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneLabel">Home</Label>
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
          </div>

          {/* Customer Address */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Customer Address</Label>
            <div className="grid grid-cols-[auto_1fr] gap-2 mb-2">
              <div className="space-y-2">
                <Label htmlFor="addressLabel">Home</Label>
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="streetAddress">Street Address</Label>
                <Input
                  id="streetAddress"
                  value={formData.streetAddress}
                  onChange={(e) => handleFieldChange("streetAddress", e.target.value)}
                  placeholder="Enter street address"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="space-y-2">
                <Label htmlFor="city">{loadingGeoData ? "Loading..." : "Toronto"}</Label>
                <Select
                  value={formData.cityId > 0 ? formData.cityId.toString() : ""}
                  onValueChange={handleCityChange}
                  disabled={loadingGeoData}
                >
                  <SelectTrigger id="city">
                    <SelectValue placeholder="Select city" />
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
              <div className="space-y-2">
                <Label htmlFor="province">{loadingGeoData ? "Loading..." : "Ontario"}</Label>
                <Select
                  value={formData.provinceId.toString()}
                  onValueChange={handleProvinceChange}
                  disabled={loadingGeoData}
                >
                  <SelectTrigger id="province">
                    <SelectValue placeholder="Select province" />
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
              <div className="space-y-2">
                <Label htmlFor="country">{loadingGeoData ? "Loading..." : "Canada"}</Label>
                <Select
                  value={formData.countryId.toString()}
                  onValueChange={handleCountryChange}
                  disabled={loadingGeoData}
                >
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Select country" />
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => handleFieldChange("postalCode", e.target.value)}
                placeholder="Enter postal code"
              />
            </div>
          </div>

          {/* How did you find us? */}
          <div className="space-y-2">
            <Label className={cn("text-sm font-semibold", errors.referralSource && "text-red-600 dark:text-red-400")}>
              How did you find us?
            </Label>
            {loadingReferralSources ? (
              <p className="text-sm text-muted-foreground">Loading referral sources...</p>
            ) : (
              <div className="space-y-2">
                {referralSources.map((source) => (
                  <div key={source.id} className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleReferralSourceChange(source.name)}
                      className={cn(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                        formData.referralSource === source.name
                          ? "border-primary bg-primary"
                          : errors.referralSource
                          ? "border-red-600 dark:border-red-400"
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
                          : errors.referralSource
                          ? "text-red-600 dark:text-red-400"
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
                      className={cn(errors.referralSourceDescription && "border-red-500")}
                    />
                    {errors.referralSourceDescription && (
                      <p className="text-xs text-red-500">{errors.referralSourceDescription}</p>
                    )}
                  </div>
                )}
              </div>
            )}
            {errors.referralSource && (
              <p className="text-xs text-red-500">{errors.referralSource}</p>
            )}
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

