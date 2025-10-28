"use client";

import React, { useState, useEffect } from "react";
import { InfoCard } from "@/components/InfoCard";
import { KeyValueDisplay } from "@/components/KeyValueDisplay";
import { ReusableModal } from "@/components/TablesModals";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  createCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
  getGeoData,
  AddressData,
  GeoData,
} from "./address-card.api";

interface Address {
  id: string;
  address: string;
  postalCode: string;
  city: string;
  cityId: number;
  provinceId: number;
  countryId: number;
  note?: string;
  label: string;
  isPrimary?: boolean;
}

interface AddressCardProps {
  addresses?: Address[];
  onAddClick?: () => void;
  onSave?: (addresses: Address[]) => void;
  className?: string;
  loading?: boolean;
  location: string;
  customerId: number;
}

export function AddressCard({
  addresses = [],
  onAddClick,
  onSave,
  className,
  loading = false,
  location,
  customerId,
}: AddressCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [currentAddress, setCurrentAddress] = useState({
    address: "",
    postalCode: "",
    city: "",
    cityId: 0,
    provinceId: 1,
    countryId: 1,
    note: "",
    label: "Home",
    isPrimary: false,
  });
  const [errors, setErrors] = useState({
    address: "",
    postalCode: "",
    city: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [geoData, setGeoData] = useState<GeoData>({
    city: [],
    province: [],
    country: [],
  });
  const [loadingGeoData, setLoadingGeoData] = useState(false);

  // Fetch geodata when modal opens
  useEffect(() => {
    if (isModalOpen && geoData.city.length === 0) {
      fetchGeoData();
    }
  }, [isModalOpen]);

  const fetchGeoData = async () => {
    setLoadingGeoData(true);
    try {
      const data = await getGeoData('all');
      if (data) {
        setGeoData(data);
      } else {
        toast.error("Failed to load location data");
      }
    } catch (error) {
      console.error("Error fetching geodata:", error);
      toast.error("Failed to load location data");
    } finally {
      setLoadingGeoData(false);
    }
  };

  const validateForm = () => {
    const newErrors = {
      address: "",
      postalCode: "",
      city: "",
    };

    if (!currentAddress.address.trim()) {
      newErrors.address = "Address cannot be blank.";
    }

    if (!currentAddress.postalCode.trim()) {
      newErrors.postalCode = "Postal code cannot be blank.";
    }

    if (!currentAddress.cityId || currentAddress.cityId === 0) {
      newErrors.city = "Please select a city.";
    }

    setErrors(newErrors);
    return !newErrors.address && !newErrors.postalCode && !newErrors.city;
  };

  const handleAddClick = () => {
    setIsModalOpen(true);
    setEditingAddress(null);
    setCurrentAddress({
      address: "",
      postalCode: "",
      city: "",
      cityId: 0,
      provinceId: 1,
      countryId: 1,
      note: "",
      label: "Home",
      isPrimary: false,
    });
    setErrors({ address: "", postalCode: "", city: "" });
    if (onAddClick) onAddClick();
  };

  const handleEditClick = (e: React.MouseEvent, address: Address) => {
    e.stopPropagation();
    setIsModalOpen(true);
    setEditingAddress(address);
    setCurrentAddress({
      address: address.address,
      postalCode: address.postalCode,
      city: address.city,
      cityId: address.cityId,
      provinceId: address.provinceId,
      countryId: address.countryId,
      note: address.note || "",
      label: address.label,
      isPrimary: address.isPrimary || false,
    });
    setErrors({ address: "", postalCode: "", city: "" });
  };

  const handleDeleteClick = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setIsSaving(true);

    try {
      const response = await deleteCustomerAddress(location, customerId, id);

      if (response?.success) {
        const updatedAddresses = addresses.filter((addr) => addr.id !== id);
        if (onSave) onSave(updatedAddresses);
        toast.success("Address deleted successfully");
      } else {
        toast.error(response?.message || "Failed to delete address");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      const addressData = {
        address: currentAddress.address,
        postalCode: currentAddress.postalCode,
        city: geoData.city.find((c) => c.id === currentAddress.cityId)?.name || currentAddress.city,
        cityId: currentAddress.cityId,
        provinceId: currentAddress.provinceId,
        countryId: currentAddress.countryId,
        note: currentAddress.note,
        label: currentAddress.label,
        isPrimary: currentAddress.isPrimary,
      };

      let response;

      if (editingAddress) {
        response = await updateCustomerAddress(location, customerId, {
          id: parseInt(editingAddress.id),
          ...addressData,
        });
      } else {
        response = await createCustomerAddress(location, customerId, addressData);
      }

      if (response?.success && response.data) {
        const formattedAddresses: Address[] = response.data.map(
          (addr: AddressData) => ({
            id: addr.id.toString(),
            address: addr.address,
            postalCode: addr.postalCode,
            city: addr.city,
            cityId: addr.cityId,
            provinceId: addr.provinceId,
            countryId: addr.countryId,
            note: addr.note,
            label: addr.label,
            isPrimary: addr.isPrimary,
          })
        );

        if (onSave) onSave(formattedAddresses);

        toast.success(
          editingAddress
            ? "Address updated successfully"
            : "Address created successfully"
        );

        handleCancel();
      } else {
        toast.error(response?.message || "Failed to save address");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingAddress(null);
    setCurrentAddress({
      address: "",
      postalCode: "",
      city: "",
      cityId: 0,
      provinceId: 1,
      countryId: 1,
      note: "",
      label: "Home",
      isPrimary: false,
    });
    setErrors({ address: "", postalCode: "", city: "" });
    setIsModalOpen(false);
  };

  const handleCityChange = (value: string) => {
    const cityId = parseInt(value);
    const selectedCity = geoData.city.find((c) => c.id === cityId);
    setCurrentAddress({
      ...currentAddress,
      cityId,
      city: selectedCity?.name || "",
    });
    if (errors.city) setErrors({ ...errors, city: "" });
  };

  const modalActions = [
    {
      label: "Cancel",
      onClick: handleCancel,
      variant: "outline" as const,
      disabled: isSaving,
    },
    {
      label: isSaving ? "Saving..." : "Save",
      onClick: handleSave,
      variant: "default" as const,
      disabled: isSaving,
    },
  ];

  return (
    <>
      <InfoCard
        title="Address"
        onAddClick={handleAddClick}
        className={className}
        loading={loading}
      >
        <div className="space-y-2">
          {loading ? (
            <>
              {[...Array(2)].map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded -mx-2"
                >
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </div>
              ))}
            </>
          ) : addresses.length > 0 ? (
            addresses.map((address) => {
              // Get province and country names from geoData
              const province = geoData.province.find(p => p.id === address.provinceId)?.name || 'Ontario';
              const country = geoData.country.find(c => c.id === address.countryId)?.name || 'Canada';
              
              // Build the full address value with line breaks
              const addressValue = `${address.address}\n${address.city}, ${province}\n${country} - ${address.postalCode}${
                address.note ? `\n${address.note}` : ""
              }`;
              
              return (
                <div
                  key={address.id}
                  className="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded -mx-2 group"
                >
                  <KeyValueDisplay
                    label={address.label}
                    value={addressValue}
                    className="justify-start flex-1"
                  />
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleEditClick(e, address)}
                      className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      aria-label="Edit address"
                      disabled={isSaving}
                    >
                      <Pencil className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(e, address.id)}
                      className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      aria-label="Delete address"
                      disabled={isSaving}
                    >
                      <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              No addresses added
            </span>
          )}
        </div>
      </InfoCard>

      <ReusableModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Address"
        size="lg"
        actions={modalActions}
        showFooter={true}
      >
        <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto px-4 pb-4">
          {editingAddress && (
            <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">
              Editing address
            </div>
          )}

          <div className="space-y-4">
            {/* Label */}
            <div className="space-y-2">
              <Label htmlFor="address-label">Label</Label>
              <Select
                value={currentAddress.label}
                onValueChange={(value) =>
                  setCurrentAddress({ ...currentAddress, label: value })
                }
                disabled={isSaving}
              >
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

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address-street">
                Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address-street"
                type="text"
                value={currentAddress.address}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setCurrentAddress({ ...currentAddress, address: e.target.value });
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

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="address-city">
                City <span className="text-red-500">*</span>
              </Label>
              <Select
                value={currentAddress.cityId ? currentAddress.cityId.toString() : ""}
                onValueChange={handleCityChange}
                disabled={isSaving || loadingGeoData}
              >
                <SelectTrigger id="address-city" className={errors.city ? "border-red-500" : ""}>
                  <SelectValue placeholder={loadingGeoData ? "Loading cities..." : "Select city"} />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {geoData.city.length > 0 ? (
                    geoData.city.map((city) => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        {city.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="0" disabled>
                      No cities available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errors.city && (
                <p className="text-sm text-red-500">{errors.city}</p>
              )}
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="address-country">Country</Label>
              <Select
                value={currentAddress.countryId ? currentAddress.countryId.toString() : "1"}
                onValueChange={(value) =>
                  setCurrentAddress({ ...currentAddress, countryId: parseInt(value) })
                }
                disabled={isSaving || loadingGeoData}
              >
                <SelectTrigger id="address-country">
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
                    <SelectItem value="1">
                      Canada
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Province */}
            <div className="space-y-2">
              <Label htmlFor="address-province">Province</Label>
              <Select
                value={currentAddress.provinceId ? currentAddress.provinceId.toString() : "1"}
                onValueChange={(value) =>
                  setCurrentAddress({ ...currentAddress, provinceId: parseInt(value) })
                }
                disabled={isSaving || loadingGeoData}
              >
                <SelectTrigger id="address-province">
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
                    <SelectItem value="1">
                      Ontario
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Postal Code */}
            <div className="space-y-2">
              <Label htmlFor="address-postal">
                Postal Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address-postal"
                type="text"
                value={currentAddress.postalCode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setCurrentAddress({ ...currentAddress, postalCode: e.target.value });
                  if (errors.postalCode) setErrors({ ...errors, postalCode: "" });
                }}
                placeholder="Enter postal code"
                className={errors.postalCode ? "border-red-500" : ""}
                disabled={isSaving}
              />
              {errors.postalCode && (
                <p className="text-sm text-red-500">{errors.postalCode}</p>
              )}
            </div>
          </div>
        </div>
      </ReusableModal>
    </>
  );
}