"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import { DraggableItemRow } from "@/components/DraggableItemRow";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
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
  const [hasLoadedGeoData, setHasLoadedGeoData] = useState(false);

  // Fetch geodata only when the edit/add modal opens (avoid initial-load call)
  useEffect(() => {
    if (!isModalOpen || hasLoadedGeoData) return;

    let isMounted = true;
    const loadGeoData = async () => {
      setLoadingGeoData(true);
      try {
        const data = await getGeoData("all");

        if (!isMounted) return;

        if (data) {
          setGeoData(data);
          setHasLoadedGeoData(true);
        } else {
          toast.error("Failed to load location data");
        }
        
      } catch (error) {
        if (isMounted) {
          toast.error("Failed to load location data");
        }
      } finally {
        if (isMounted) {
          setLoadingGeoData(false);
        }
      }
    };

    loadGeoData();

    return () => {
      isMounted = false;
    };
  }, [isModalOpen, hasLoadedGeoData]);

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

    // Check if cityId is valid OR if we're editing and city name exists
    const cityExists = geoData.city.some(c => c.id === currentAddress.cityId);
    const hasValidCityName = currentAddress.city && currentAddress.city.trim() !== "";
    
    if (!currentAddress.cityId || currentAddress.cityId === 0) {
      // If editing and has a valid city name, try to find and set the cityId
      if (editingAddress && hasValidCityName) {
        const foundCity = geoData.city.find(c => c.name.toLowerCase() === currentAddress.city.toLowerCase());
        if (foundCity) {
          // Auto-fix the cityId if we found a match
          setCurrentAddress(prev => ({ ...prev, cityId: foundCity.id }));
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

  const handleAddClick = () => {
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
    setIsModalOpen(true);
    if (onAddClick) onAddClick();
  };

  const handleEditClick = (e: React.MouseEvent, address: Address) => {
    e.stopPropagation();
    setEditingAddress(address);
    
    // Ensure cityId is properly set - if city name exists but no cityId, find it from geoData
    let cityId = address.cityId;
    if ((!cityId || cityId === 0) && address.city && geoData.city.length > 0) {
      const foundCity = geoData.city.find(c => c.name.toLowerCase() === address.city.toLowerCase());
      if (foundCity) {
        cityId = foundCity.id;
      }
    }
    
    setCurrentAddress({
      address: address.address,
      postalCode: address.postalCode,
      city: address.city,
      cityId: cityId,
      provinceId: address.provinceId,
      countryId: address.countryId,
      note: address.note || "",
      label: address.label,
      isPrimary: address.isPrimary || false,
    });
    setErrors({ address: "", postalCode: "", city: "" });
    setIsModalOpen(true);
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

  // Get the display value for the city Select
  const getCityDisplayValue = () => {
    if (!currentAddress.cityId || currentAddress.cityId === 0) {
      return "";
    }
    
    return currentAddress.cityId.toString();
  };

  const handleReorder = useCallback(
    async (reorderedAddresses: Address[]) => {
      // Check if primary status changed
      const newPrimary = reorderedAddresses.find((a) => a.isPrimary);
      const oldPrimary = addresses.find((a) => a.isPrimary && a.id !== newPrimary?.id);

      // Update local state first for immediate UI feedback
      if (onSave) onSave(reorderedAddresses);

      // If primary status changed, persist to API
      if (newPrimary && newPrimary.id !== oldPrimary?.id) {
        try {
          // First, update the new primary address
          const newPrimaryId = Number(newPrimary.id);
          const cityName = geoData.city.find((c) => c.id === newPrimary.cityId)?.name || newPrimary.city;
          const newPrimaryResult = await updateCustomerAddress(
            location,
            customerId,
            {
              id: newPrimaryId,
              address: newPrimary.address,
              postalCode: newPrimary.postalCode,
              city: cityName,
              cityId: newPrimary.cityId,
              provinceId: newPrimary.provinceId,
              countryId: newPrimary.countryId,
              note: newPrimary.note,
              label: newPrimary.label,
              isPrimary: true,
            }
          );

          if (!newPrimaryResult?.success) {
            toast.error(newPrimaryResult?.message || "Failed to update primary address");
            if (onSave) onSave(addresses);
            return;
          }

          // Then update all other addresses to non-primary
          const otherAddresses = addresses.filter((a) => a.id !== newPrimary.id);
          if (otherAddresses.length > 0) {
            await Promise.all(
              otherAddresses.map((address) => {
                const addressId = Number(address.id);
                const addressCityName = geoData.city.find((c) => c.id === address.cityId)?.name || address.city;
                return updateCustomerAddress(
                  location,
                  customerId,
                  {
                    id: addressId,
                    address: address.address,
                    postalCode: address.postalCode,
                    city: addressCityName,
                    cityId: address.cityId,
                    provinceId: address.provinceId,
                    countryId: address.countryId,
                    note: address.note,
                    label: address.label,
                    isPrimary: false,
                  }
                );
              })
            );
          }

          // Use the response from the new primary update (should contain all addresses)
          // Normalize the response - ensure only the new primary is marked as primary
          if (newPrimaryResult.data) {
            const formattedAddresses: Address[] = newPrimaryResult.data.map(
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
                // Ensure only the new primary is marked as primary
                isPrimary: addr.id === newPrimaryId,
              })
            );
            if (onSave) onSave(formattedAddresses);
          }
        } catch (error) {
          console.error("Error updating primary address:", error);
          toast.error("Failed to update primary address");
          // Revert on error
          if (onSave) onSave(addresses);
        }
      }
    },
    [addresses, location, customerId, onSave, geoData]
  );

  const {
    handleDragStart,
    handleDragOver,
    handleDrop,
    isDragging,
    isDragOver,
  } = useDragAndDrop<Address>({
    items: addresses,
    onReorder: handleReorder,
    getItemId: (address) => address.id,
  });

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
            addresses.map((address, index) => {
              // Get province and country names from geoData
              const province = geoData.province.find(p => p.id === address.provinceId)?.name || 'Ontario';
              const country = geoData.country.find(c => c.id === address.countryId)?.name || 'Canada';
              
              // Build the full address value with line breaks
              const addressValue = `${address.address}\n${address.city}, ${province}\n${country} - ${address.postalCode}${
                address.note ? `\n${address.note}` : ""
              }`;
              
              return (
                <DraggableItemRow
                  key={address.id}
                  item={address}
                  label={address.label}
                  value={
                    <span className="whitespace-pre-line flex items-center gap-2">
                      <span>{addressValue}</span>
                      {address.isPrimary && (
                        <Badge variant="secondary" className="text-xs">
                          Primary
                        </Badge>
                      )}
                    </span>
                  }
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  getItemId={(item) => item.id}
                  editAriaLabel="Edit address"
                  deleteAriaLabel="Delete address"
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, address)}
                  onDragOver={(e) => handleDragOver(e, address, index)}
                  onDrop={(e) => handleDrop(e, address, index)}
                  isDragging={isDragging(address)}
                  isDragOver={isDragOver(address, index)}
                />
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
        <div className="space-y-4 max-h-[70vh] sm:max-h-[75vh] md:max-h-[80vh] overflow-y-auto px-3 sm:px-4 md:px-6 pb-4">
          {editingAddress && (
            <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">
              Editing address
            </div>
          )}

          <div className="space-y-3 sm:space-y-4">
            {/* Label */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="address-label" className="text-sm sm:text-base">Label</Label>
              <Select
                value={currentAddress.label}
                onValueChange={(value) =>
                  setCurrentAddress({ ...currentAddress, label: value })
                }
                disabled={isSaving}
              >
                <SelectTrigger id="address-label" className="h-9 sm:h-10">
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
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="address-street" className="text-sm sm:text-base">
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
                className={`h-9 sm:h-10 text-sm sm:text-base ${errors.address ? "border-red-500" : ""}`}
                disabled={isSaving}
              />
              {errors.address && (
                <p className="text-xs sm:text-sm text-red-500">{errors.address}</p>
              )}
            </div>

            {/* City */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="address-city" className="text-sm sm:text-base">
                City <span className="text-red-500">*</span>
              </Label>
              <Select
                value={getCityDisplayValue()}
                onValueChange={handleCityChange}
                disabled={isSaving || loadingGeoData}
              >
                <SelectTrigger 
                  id="address-city" 
                  className={`h-9 sm:h-10 ${errors.city ? "border-red-500" : ""}`}
                >
                  <SelectValue 
                    placeholder={
                      loadingGeoData 
                        ? "Loading cities..." 
                        : currentAddress.city || "Select city"
                    } 
                  />
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
                      {loadingGeoData ? "Loading..." : "No cities available"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errors.city && (
                <p className="text-xs sm:text-sm text-red-500">{errors.city}</p>
              )}
              {currentAddress.city && currentAddress.cityId > 0 && !geoData.city.find(c => c.id === currentAddress.cityId) && (
                <p className="text-xs sm:text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                  ⚠️ Current city &quot;{currentAddress.city}&quot; is not available in the locations list. Please select a valid city from the dropdown.
                </p>
              )}
            </div>

            {/* Country and Province in a grid on larger screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Country */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="address-country" className="text-sm sm:text-base">Country</Label>
                <Select
                  value={currentAddress.countryId ? currentAddress.countryId.toString() : "1"}
                  onValueChange={(value) =>
                    setCurrentAddress({ ...currentAddress, countryId: parseInt(value) })
                  }
                  disabled={isSaving || loadingGeoData}
                >
                  <SelectTrigger id="address-country" className="h-9 sm:h-10">
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
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="address-province" className="text-sm sm:text-base">Province</Label>
                <Select
                  value={currentAddress.provinceId ? currentAddress.provinceId.toString() : "1"}
                  onValueChange={(value) =>
                    setCurrentAddress({ ...currentAddress, provinceId: parseInt(value) })
                  }
                  disabled={isSaving || loadingGeoData}
                >
                  <SelectTrigger id="address-province" className="h-9 sm:h-10">
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
            </div>

            {/* Postal Code */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="address-postal" className="text-sm sm:text-base">
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
                className={`h-9 sm:h-10 text-sm sm:text-base ${errors.postalCode ? "border-red-500" : ""}`}
                disabled={isSaving}
              />
              {errors.postalCode && (
                <p className="text-xs sm:text-sm text-red-500">{errors.postalCode}</p>
              )}
            </div>
          </div>
        </div>
      </ReusableModal>
    </>
  );
}