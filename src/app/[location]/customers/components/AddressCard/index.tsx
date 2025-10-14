import React, { useState } from "react";
import { InfoCard } from "@/components/InfoCard";
import { ReusableModal } from "@/components/TablesModals";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Address {
  id: string;
  label: string;
  address: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
}

interface AddressCardProps {
  addresses?: Address[];
  onAddClick?: () => void;
  onSave?: (addresses: Address[]) => void;
  className?: string;
}

export function AddressCard({ 
  addresses = [],
  onAddClick, 
  onSave,
  className 
}: AddressCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Partial<Address>>({
    label: "Home",
    address: "",
    city: "",
    province: "Ontario",
    country: "Canada",
    postalCode: ""
  });
  const [errors, setErrors] = useState({
    address: false,
    city: false,
    postalCode: false
  });
  const [showErrors, setShowErrors] = useState(false);

  const handleAddClick = () => {
    setIsModalOpen(true);
    setCurrentAddress({
      label: "Home",
      address: "",
      city: "",
      province: "Ontario",
      country: "Canada",
      postalCode: ""
    });
    setErrors({
      address: false,
      city: false,
      postalCode: false
    });
    setShowErrors(false);
    if (onAddClick) {
      onAddClick();
    }
  };

  const validateForm = () => {
    const newErrors = {
      address: !currentAddress.address?.trim(),
      city: !currentAddress.city?.trim(),
      postalCode: !currentAddress.postalCode?.trim() || !/^\d+$/.test(currentAddress.postalCode.trim())
    };
    setErrors(newErrors);
    return !newErrors.address && !newErrors.city && !newErrors.postalCode;
  };

  const handleRemoveAddress = (id: string) => {
    const updatedAddresses = addresses.filter(addr => addr.id !== id);
    if (onSave) {
      onSave(updatedAddresses);
    }
  };

  const handleSave = () => {
    setShowErrors(true);
    
    if (!validateForm()) {
      return;
    }

    const newAddress: Address = {
      id: Date.now().toString(),
      label: currentAddress.label || "Home",
      address: currentAddress.address || "",
      city: currentAddress.city || "",
      province: currentAddress.province || "Ontario",
      country: currentAddress.country || "Canada",
      postalCode: currentAddress.postalCode || ""
    };

    if (onSave) {
      onSave([...addresses, newAddress]);
    }
    
    setCurrentAddress({
      label: "Home",
      address: "",
      city: "",
      province: "Ontario",
      country: "Canada",
      postalCode: ""
    });
    setErrors({
      address: false,
      city: false,
      postalCode: false
    });
    setShowErrors(false);
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setCurrentAddress({
      label: "Home",
      address: "",
      city: "",
      province: "Ontario",
      country: "Canada",
      postalCode: ""
    });
    setErrors({
      address: false,
      city: false,
      postalCode: false
    });
    setShowErrors(false);
    setIsModalOpen(false);
  };

  const modalActions = [
    {
      label: "Cancel",
      onClick: handleCancel,
      variant: "outline" as const
    },
    {
      label: "Save",
      onClick: handleSave,
      variant: "default" as const
    }
  ];

  const formatAddress = (addr: Address) => {
    const parts = [addr.address, addr.city, addr.province, addr.postalCode].filter(Boolean);
    return parts.join(", ");
  };

  return (
    <>
      <InfoCard 
        title="Addresses" 
        onAddClick={handleAddClick}
        className={className}
      >
        <div className="space-y-2">
          {addresses.length > 0 ? (
            addresses.map((addr) => (
              <div key={addr.id} className="flex justify-between items-start space-y-1">
                <div>
                  <div className="text-sm text-gray-600">{addr.label}</div>
                  <div className="text-sm">{formatAddress(addr)}</div>
                </div>
                <button
                  onClick={() => handleRemoveAddress(addr.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
            ))
          ) : (
            <span className="text-gray-500 text-sm">No addresses added</span>
          )}
        </div>
      </InfoCard>

      <ReusableModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Address"
        size="xl"
        actions={modalActions}
        showFooter={true}
      >
        <div className="space-y-4">
          {/* Address Form */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="address-label">Label</Label>
              <Select 
                value={currentAddress.label} 
                onValueChange={(value) => setCurrentAddress({ ...currentAddress, label: value })}
              >
                <SelectTrigger id="address-label">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Home">Home</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Billing">Billing</SelectItem>
                  <SelectItem value="Shipping">Shipping</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={currentAddress.address || ""}
                onChange={(e) => {
                  setCurrentAddress({ ...currentAddress, address: e.target.value });
                  if (showErrors) {
                    setErrors({ ...errors, address: !e.target.value.trim() });
                  }
                }}
                placeholder="Street address"
                className={showErrors && errors.address ? "border-red-600" : ""}
              />
              {showErrors && errors.address && (
                <p className="text-sm text-red-600">Address cannot be blank.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Select 
                value={currentAddress.city || ""} 
                onValueChange={(value) => {
                  setCurrentAddress({ ...currentAddress, city: value });
                  if (showErrors) {
                    setErrors({ ...errors, city: !value.trim() });
                  }
                }}
              >
                <SelectTrigger id="city" className={showErrors && errors.city ? "border-red-600" : ""}>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ajax">Ajax</SelectItem>
                  <SelectItem value="Toronto">Toronto</SelectItem>
                  <SelectItem value="Mississauga">Mississauga</SelectItem>
                  <SelectItem value="Brampton">Brampton</SelectItem>
                  <SelectItem value="Hamilton">Hamilton</SelectItem>
                  <SelectItem value="Ottawa">Ottawa</SelectItem>
                  <SelectItem value="Markham">Markham</SelectItem>
                  <SelectItem value="Vaughan">Vaughan</SelectItem>
                  <SelectItem value="Kitchener">Kitchener</SelectItem>
                  <SelectItem value="Windsor">Windsor</SelectItem>
                  <SelectItem value="London">London</SelectItem>
                  <SelectItem value="Oakville">Oakville</SelectItem>
                  <SelectItem value="Burlington">Burlington</SelectItem>
                  <SelectItem value="Oshawa">Oshawa</SelectItem>
                  <SelectItem value="Barrie">Barrie</SelectItem>
                  <SelectItem value="Guelph">Guelph</SelectItem>
                  <SelectItem value="Cambridge">Cambridge</SelectItem>
                  <SelectItem value="Whitby">Whitby</SelectItem>
                  <SelectItem value="Waterloo">Waterloo</SelectItem>
                  <SelectItem value="Pickering">Pickering</SelectItem>
                </SelectContent>
              </Select>
              {showErrors && errors.city && (
                <p className="text-sm text-red-600">City cannot be blank.</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select 
                  value={currentAddress.country} 
                  onValueChange={(value) => setCurrentAddress({ ...currentAddress, country: value })}
                >
                  <SelectTrigger id="country">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="USA">USA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="province">Province</Label>
                <Select 
                  value={currentAddress.province} 
                  onValueChange={(value) => setCurrentAddress({ ...currentAddress, province: value })}
                >
                  <SelectTrigger id="province">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ontario">Ontario</SelectItem>
                    <SelectItem value="Quebec">Quebec</SelectItem>
                    <SelectItem value="British Columbia">British Columbia</SelectItem>
                    <SelectItem value="Alberta">Alberta</SelectItem>
                    <SelectItem value="Manitoba">Manitoba</SelectItem>
                    <SelectItem value="Saskatchewan">Saskatchewan</SelectItem>
                    <SelectItem value="Nova Scotia">Nova Scotia</SelectItem>
                    <SelectItem value="New Brunswick">New Brunswick</SelectItem>
                    <SelectItem value="Newfoundland and Labrador">Newfoundland and Labrador</SelectItem>
                    <SelectItem value="Prince Edward Island">Prince Edward Island</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal-code">Postal Code</Label>
              <Input
                id="postal-code"
                type="text"
                inputMode="numeric"
                value={currentAddress.postalCode || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow numbers
                  if (value === "" || /^\d+$/.test(value)) {
                    setCurrentAddress({ ...currentAddress, postalCode: value });
                    if (showErrors) {
                      setErrors({ ...errors, postalCode: !value.trim() || !/^\d+$/.test(value.trim()) });
                    }
                  } else {
                    if (showErrors) {
                      setErrors({ ...errors, postalCode: true });
                    }
                  }
                }}
                placeholder="Postal code"
                className={showErrors && errors.postalCode ? "border-red-600" : ""}
              />
              {showErrors && errors.postalCode && (
                <p className="text-sm text-red-600">
                  {!currentAddress.postalCode?.trim() 
                    ? "Postal code cannot be blank." 
                    : "Postal code must contain only numbers."}
                </p>
              )}
            </div>
          </div>
        </div>
      </ReusableModal>
    </>
  );
}