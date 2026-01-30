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
import { GenericAddress, GenericBasicDetails, WithApiMessage } from "../../types/common";
import { UserDetailsApiAdapter } from "../../types/adapters";
import { toast } from "sonner";
import type { GeoData } from "@/app/[location]/customers/components/AddressCard/address-card.api";
import { getGeoData } from "@/app/[location]/customers/components/AddressCard/address-card.api";

interface CreateAddressModalProps<
  TEmail,
  TPhone,
  TAddress extends GenericAddress
> {
  open: boolean;
  onClose: () => void;
  onSubmit?: (address: TAddress) => void;
  editingAddress?: TAddress | null;
  location: string;
  entityId: number;
  onUpdateAddresses?: (addresses: TAddress[]) => void;
  currentAddresses?: TAddress[];
  onRefresh?: () => Promise<void>;
  apiAdapter: UserDetailsApiAdapter<GenericBasicDetails, TEmail, TPhone, TAddress>;
}

export function CreateAddressModal<
  TEmail,
  TPhone,
  TAddress extends GenericAddress
>({
  open,
  onClose,
  onSubmit,
  editingAddress = null,
  location,
  entityId,
  onUpdateAddresses,
  currentAddresses = [],
  apiAdapter,
}: CreateAddressModalProps<TEmail, TPhone, TAddress>) {
  const [label, setLabel] = React.useState("Work");
  const [address, setAddress] = React.useState("");
  const [city, setCity] = React.useState("");
  const [cityId, setCityId] = React.useState(0);
  const [provinceId, setProvinceId] = React.useState(1);
  const [countryId, setCountryId] = React.useState(1);
  const [postalCode, setPostalCode] = React.useState("");
  const [errors, setErrors] = React.useState({
    address: "",
    city: "",
  });
  const [isSaving, setIsSaving] = React.useState(false);
  const [geoData, setGeoData] = React.useState<GeoData>({
    city: [],
    province: [],
    country: [],
  });
  const [loadingGeoData, setLoadingGeoData] = React.useState(false);
  const [hasSetDefaultCity, setHasSetDefaultCity] = React.useState(false);

  // Fetch geo data when modal opens
  React.useEffect(() => {
    if (!open) {
      // Reset the flag when modal closes
      setHasSetDefaultCity(false);
      return;
    }

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
  }, [open]);

  // Set default city (Alliston) when geo data is loaded and not editing
  React.useEffect(() => {
    if (
      !editingAddress &&
      geoData.city.length > 0 &&
      !hasSetDefaultCity &&
      open
    ) {
      const alliston = geoData.city.find(
        (c) => c.name.toLowerCase() === "alliston"
      );
      if (alliston) {
        setCityId(alliston.id);
        setCity(alliston.name);
        setHasSetDefaultCity(true);
      }
    }
  }, [geoData.city, editingAddress, hasSetDefaultCity, open]);

  // Initialize form when editing address changes
  React.useEffect(() => {
    if (editingAddress) {
      setLabel(editingAddress.label || "Work");
      setAddress(editingAddress.address || "");
      setCity(editingAddress.city || "");
      setCityId(editingAddress.cityId || 0);
      setProvinceId(editingAddress.provinceId || 1);
      setCountryId(editingAddress.countryId || 1);
      setPostalCode(editingAddress.postalCode || "");
    } else {
      setLabel("Work");
      setAddress("");
      setProvinceId(1);
      setCountryId(1);
      setPostalCode("");
      // City will be set by the default city effect
    }
    setErrors({ address: "", city: "" });
  }, [editingAddress]);

  const resetForm = React.useCallback(() => {
    setLabel("Work");
    setAddress("");
    // Reset to Alliston as default city if available
    const alliston = geoData.city.find(
      (c) => c.name.toLowerCase() === "alliston"
    );
    if (alliston) {
      setCityId(alliston.id);
      setCity(alliston.name);
    } else {
      setCity("");
      setCityId(0);
    }
    setProvinceId(1);
    setCountryId(1);
    setPostalCode("");
    setErrors({ address: "", city: "" });
  }, [geoData.city]);

  const validateForm = () => {
    const newErrors = {
      address: "",
      city: "",
    };

    if (!address.trim()) {
      newErrors.address = "Address cannot be blank.";
    }

    const cityExists = geoData.city.some((c) => c.id === cityId);
    const hasValidCityName = city && city.trim() !== "";

    if (!cityId || cityId === 0) {
      if (editingAddress && hasValidCityName) {
        const foundCity = geoData.city.find(
          (c) => c.name.toLowerCase() === city.toLowerCase()
        );
        if (foundCity) {
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
    return !newErrors.address && !newErrors.city;
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
        label: label.trim() || "Work",
        isPrimary: false,
      } as Omit<TAddress, 'id'>;

      let result: TAddress;

      if (editingAddress) {
        const success = await apiAdapter.updateAddress(
          location,
          entityId,
          editingAddress.id,
          addressData as Partial<TAddress>
        );
        if (!success) {
          throw new Error("Failed to update address");
        }
        // Update Redux state directly - no GET call needed
        // Create updated address object from input data and existing ID
        result = {
          ...editingAddress,
          ...addressData,
        } as TAddress;
        // For update, we don't have the API message, so use default
        toast.success("Address updated successfully");
      } else {
        const createResult = await apiAdapter.createAddress(location, entityId, addressData);
        result = createResult as TAddress;
        // Use API response message if available, otherwise use default
        const resultWithMessage = createResult as WithApiMessage<TAddress>;
        toast.success(resultWithMessage._apiMessage || "Address added successfully");
      }

      // Update Redux state directly with the result - no GET call needed
      if (onUpdateAddresses) {
        if (editingAddress) {
          // Update existing address in the list
          const updatedList = currentAddresses.map((a) =>
            a.id === editingAddress.id ? result : a
          ) as TAddress[];
          onUpdateAddresses(updatedList);
        } else {
          // Add new address to the list
          onUpdateAddresses([...currentAddresses, result] as TAddress[]);
        }
      }

      if (onSubmit) {
        onSubmit(result);
      }

      // No GET call needed - Redux state is updated directly per caching rules
      // onRefresh would trigger fetchAdministrator (GET API), which violates caching rules

      resetForm();
      onClose();
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save address. Please try again.");
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
            <Label htmlFor="address-postal">Postal Code</Label>
            <Input
              id="address-postal"
              value={postalCode}
              onChange={(event) => {
                setPostalCode(event.target.value);
              }}
              placeholder="Enter postal code"
              disabled={isSaving}
            />
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

