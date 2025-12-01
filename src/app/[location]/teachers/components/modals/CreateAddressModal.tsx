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
import { TeacherAddress } from "../../types";
import type { GeoData } from "../../../customers/components/AddressCard/address-card.api";
import { getGeoData } from "../../../customers/components/AddressCard/address-card.api";
import {
  addTeacherAddress,
  updateTeacherAddress,
} from "../../[id]/teachers-details.api";
import { toast } from "sonner";

interface CreateAddressModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (address: TeacherAddress) => void;
  editingAddress?: TeacherAddress | null;
  location: string;
  teacherId: number;
  onUpdateAddresses?: (addresses: TeacherAddress[]) => void;
  onRefresh?: () => Promise<void>;
}

export function CreateAddressModal({
  open,
  onClose,
  onSubmit,
  editingAddress = null,
  location,
  teacherId,
  onUpdateAddresses,
  onRefresh,
}: CreateAddressModalProps) {
  const [label, setLabel] = React.useState("Home");
  const [address, setAddress] = React.useState("");
  const [city, setCity] = React.useState("");
  const [cityId, setCityId] = React.useState(0);
  const [provinceId, setProvinceId] = React.useState(1);
  const [countryId, setCountryId] = React.useState(1);
  const [postalCode, setPostalCode] = React.useState("");
  const [errors, setErrors] = React.useState({
    address: "",
    postalCode: "",
    city: "",
  });
  const [isSaving, setIsSaving] = React.useState(false);
  const [geoData, setGeoData] = React.useState<GeoData>({
    city: [],
    province: [],
    country: [],
  });
  const [loadingGeoData, setLoadingGeoData] = React.useState(false);

  React.useEffect(() => {
    const fetchGeo = async () => {
      setLoadingGeoData(true);
      try {
        const data = await getGeoData("all");
        if (data) {
          setGeoData(data);
        }
      } finally {
        setLoadingGeoData(false);
      }
    };

    fetchGeo();
  }, []);

  React.useEffect(() => {
    if (editingAddress) {
      setLabel(editingAddress.label || "Home");
      setAddress(editingAddress.address || "");
      setCity(editingAddress.city || "");
      setCityId(editingAddress.cityId || 0);
      setProvinceId(editingAddress.provinceId || 1);
      setCountryId(editingAddress.countryId || 1);
      setPostalCode(editingAddress.postalCode || "");
    } else {
      setLabel("Home");
      setAddress("");
      setCity("");
      setCityId(0);
      setProvinceId(1);
      setCountryId(1);
      setPostalCode("");
    }
    setErrors({ address: "", postalCode: "", city: "" });
  }, [editingAddress, open]);

  const resetForm = () => {
    setLabel("Home");
    setAddress("");
    setCity("");
    setCityId(0);
    setProvinceId(1);
    setCountryId(1);
    setPostalCode("");
    setErrors({ address: "", postalCode: "", city: "" });
  };

  const validateForm = () => {
    const newErrors = {
      address: "",
      postalCode: "",
      city: "",
    };

    if (!address.trim()) {
      newErrors.address = "Address cannot be blank.";
    }

    if (!postalCode.trim()) {
      newErrors.postalCode = "Postal code cannot be blank.";
    }

    // Check if cityId is valid OR if we're editing and city name exists
    const cityExists = geoData.city.some((c) => c.id === cityId);
    const hasValidCityName = city && city.trim() !== "";

    if (!cityId || cityId === 0) {
      // If editing and has a valid city name, try to find and set the cityId
      if (editingAddress && hasValidCityName) {
        const foundCity = geoData.city.find(
          (c) => c.name.toLowerCase() === city.toLowerCase()
        );
        if (foundCity) {
          // Auto-fix the cityId if we found a match
          setCityId(foundCity.id);
        } else {
          newErrors.city = "Please select a city.";
        }
      } else {
        newErrors.city = "Please select a city.";
      }
    } else if (!cityExists) {
      newErrors.city = "Please select a valid city.";
    }

    setErrors(newErrors);
    return !newErrors.address && !newErrors.postalCode && !newErrors.city;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) return;

    setIsSaving(true);

    try {
      const selectedCity =
        geoData.city.find((c) => c.id === cityId)?.name || city.trim();

      const addressData = {
        address: address.trim(),
        postalCode: postalCode.trim(),
        city: selectedCity,
        cityId: cityId || 0,
        provinceId: provinceId || 1,
        countryId: countryId || 1,
        label: label.trim() || "Home",
        isPrimary: false,
      };

      const result = editingAddress
        ? await updateTeacherAddress(
            location,
            teacherId,
            Number(editingAddress.id),
            addressData
          )
        : await addTeacherAddress(location, teacherId, addressData);

      if (result?.success && result.data && Array.isArray(result.data)) {
        toast.success(
          editingAddress
            ? "Address updated successfully"
            : "Address added successfully"
        );

        // Transform API response - handle nested structure from API
        const transformedAddresses: TeacherAddress[] = result.data.map((item: {
          id: number;
          address: string;
          city: string | { name?: string };
          cityId?: number;
          provinceId?: number;
          countryId?: number;
          postalCode: string;
          province?: string | { name?: string };
          country?: string | { name?: string };
          label?: string;
          isPrimary?: boolean;
          userContact?: {
            label?: string;
            labelId?: number;
            isPrimary?: boolean | number;
          };
          contact?: {
            label?: string;
            labelId?: number;
            isPrimary?: boolean | number;
          };
        }) => {
          // API response has nested structure: item.userContact.label, item.userContact.isPrimary
          const userContact = item.userContact || item.contact || {};
          const labelMap: Record<number, string> = {
            1: "Home",
            2: "Work",
            3: "Other",
          };

          // City/province/country may come back as nested objects; normalise to strings
          const rawCity = item.city;
          const normalisedCity =
            typeof rawCity === "string"
              ? rawCity
              : rawCity?.name || addressData.city || city || "";

          const rawProvince = item.province;
          const normalisedProvince =
            typeof rawProvince === "string"
              ? rawProvince
              : rawProvince?.name || undefined;

          const rawCountry = item.country;
          const normalisedCountry =
            typeof rawCountry === "string"
              ? rawCountry
              : rawCountry?.name || undefined;

          return {
            id: item.id?.toString() || String(item.id),
            label:
              userContact.label ||
              labelMap[userContact.labelId as number] ||
              item.label ||
              "Home",
            address: item.address || addressData.address,
            city: normalisedCity,
            cityId: item.cityId || cityId || addressData.cityId || 0,
            provinceId: item.provinceId || provinceId || addressData.provinceId || 1,
            countryId: item.countryId || countryId || addressData.countryId || 1,
            postalCode: item.postalCode || addressData.postalCode,
            province: normalisedProvince,
            country: normalisedCountry,
            isPrimary:
              userContact.isPrimary === 1 ||
              userContact.isPrimary === true ||
              item.isPrimary === true,
          };
        });

        if (onUpdateAddresses) {
          onUpdateAddresses(transformedAddresses);
        }

        if (onSubmit && transformedAddresses.length > 0) {
          const latest = transformedAddresses.find(
            (a) => a.address === addressData.address
          );
          if (latest) {
            onSubmit(latest);
          }
        }

        resetForm();
        onClose();

        // Ensure latest data is reflected from server
        if (onRefresh) {
          await onRefresh();
        }
      } else {
        toast.error(result?.message || "Failed to save address");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("Failed to save address. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          resetForm();
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Address</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address-label">Label</Label>
            <Select value={label} onValueChange={setLabel} disabled={isSaving}>
              <SelectTrigger id="address-label">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Home">Home</SelectItem>
                <SelectItem value="Work">Work</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address-line">
              Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address-line"
              value={address}
              onChange={(event) => {
                setAddress(event.target.value);
                if (errors.address) setErrors({ ...errors, address: "" });
              }}
              placeholder="Enter street address"
              className={errors.address ? "border-red-500" : ""}
              disabled={isSaving}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address-city">
              City <span className="text-red-500">*</span>
            </Label>
            <Select
              value={cityId > 0 ? cityId.toString() : ""}
              onValueChange={(value) => {
                const id = parseInt(value);
                setCityId(id);
                const selected = geoData.city.find((c) => c.id === id);
                setCity(selected?.name || "");
                if (errors.city) setErrors({ ...errors, city: "" });
              }}
              disabled={loadingGeoData || isSaving}
            >
              <SelectTrigger
                id="address-city"
                className={errors.city ? "border-red-500" : ""}
              >
                <SelectValue
                  placeholder={
                    loadingGeoData
                      ? "Loading cities..."
                      : city || "Select city"
                  }
                />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {geoData.city.length > 0 ? (
                  geoData.city.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="0" disabled>
                    {loadingGeoData ? "Loading..." : "No cities available"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.city && (
              <p className="text-sm text-red-500">{errors.city}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="address-country">Country</Label>
              <Select
                value={countryId.toString()}
                onValueChange={(value) => setCountryId(parseInt(value))}
                disabled={loadingGeoData || isSaving}
              >
                <SelectTrigger id="address-country">
                  <SelectValue
                    placeholder={
                      loadingGeoData ? "Loading..." : "Select country"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {geoData.country.length > 0 ? (
                    geoData.country.map((country) => (
                      <SelectItem
                        key={country.id}
                        value={country.id.toString()}
                      >
                        {country.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="1">Canada</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address-province">Province</Label>
              <Select
                value={provinceId.toString()}
                onValueChange={(value) => setProvinceId(parseInt(value))}
                disabled={loadingGeoData || isSaving}
              >
                <SelectTrigger id="address-province">
                  <SelectValue
                    placeholder={
                      loadingGeoData ? "Loading..." : "Select province"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {geoData.province.length > 0 ? (
                    geoData.province.map((province) => (
                      <SelectItem
                        key={province.id}
                        value={province.id.toString()}
                      >
                        {province.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="1">Ontario</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address-postal">
              Postal Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address-postal"
              value={postalCode}
              onChange={(event) => {
                setPostalCode(event.target.value);
                if (errors.postalCode)
                  setErrors({ ...errors, postalCode: "" });
              }}
              placeholder="Enter postal code"
              className={errors.postalCode ? "border-red-500" : ""}
              disabled={isSaving}
            />
            {errors.postalCode && (
              <p className="text-sm text-red-500">{errors.postalCode}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

