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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TeacherAddress } from "../../types";

interface CreateAddressModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (address: TeacherAddress) => void;
  editingAddress?: TeacherAddress | null;
}

export function CreateAddressModal({
  open,
  onClose,
  onSubmit,
  editingAddress = null,
}: CreateAddressModalProps) {
  const [label, setLabel] = React.useState("Home");
  const [address, setAddress] = React.useState("");
  const [city, setCity] = React.useState("");
  const [cityId, setCityId] = React.useState(0);
  const [provinceId, setProvinceId] = React.useState(1);
  const [countryId, setCountryId] = React.useState(1);
  const [postalCode, setPostalCode] = React.useState("");
  const [note, setNote] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (editingAddress) {
      setLabel(editingAddress.label || "Home");
      setAddress(editingAddress.address || "");
      setCity(editingAddress.city || "");
      setCityId(editingAddress.cityId || 0);
      setProvinceId(editingAddress.provinceId || 1);
      setCountryId(editingAddress.countryId || 1);
      setPostalCode(editingAddress.postalCode || "");
      setNote(editingAddress.note || "");
    } else {
      setLabel("Home");
      setAddress("");
      setCity("");
      setCityId(0);
      setProvinceId(1);
      setCountryId(1);
      setPostalCode("");
      setNote("");
    }
    setError(null);
  }, [editingAddress, open]);

  const resetForm = () => {
    setLabel("Home");
    setAddress("");
    setCity("");
    setCityId(0);
    setProvinceId(1);
    setCountryId(1);
    setPostalCode("");
    setNote("");
    setError(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!address.trim()) {
      setError("Address is required.");
      return;
    }

    if (!city.trim()) {
      setError("City is required.");
      return;
    }

    if (!postalCode.trim()) {
      setError("Postal code is required.");
      return;
    }

    const newAddress: TeacherAddress = {
      id: editingAddress?.id || crypto.randomUUID(),
      label: label.trim() || "Home",
      address: address.trim(),
      city: city.trim(),
      cityId: cityId || 0,
      provinceId: provinceId || 1,
      countryId: countryId || 1,
      postalCode: postalCode.trim(),
      note: note.trim() || undefined,
    };

    onSubmit(newAddress);
    resetForm();
    onClose();
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
          {error && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="address-label">Label</Label>
            <Select value={label} onValueChange={setLabel}>
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
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Enter street address"
              required
            />
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
                // Map city ID to city name
                const cityMap: Record<string, string> = {
                  "1": "Toronto",
                  "2": "Vancouver",
                  "3": "Montreal",
                  "4": "Calgary",
                  "5": "Ottawa",
                };
                setCity(cityMap[value] || value);
              }}
            >
              <SelectTrigger id="address-city">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Toronto</SelectItem>
                <SelectItem value="2">Vancouver</SelectItem>
                <SelectItem value="3">Montreal</SelectItem>
                <SelectItem value="4">Calgary</SelectItem>
                <SelectItem value="5">Ottawa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="address-country">Country</Label>
              <Select
                value={countryId.toString()}
                onValueChange={(value) => setCountryId(parseInt(value))}
              >
                <SelectTrigger id="address-country">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Canada</SelectItem>
                  <SelectItem value="2">United States</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address-province">Province</Label>
              <Select
                value={provinceId.toString()}
                onValueChange={(value) => setProvinceId(parseInt(value))}
              >
                <SelectTrigger id="address-province">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Ontario</SelectItem>
                  <SelectItem value="2">British Columbia</SelectItem>
                  <SelectItem value="3">Quebec</SelectItem>
                  <SelectItem value="4">Alberta</SelectItem>
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
              onChange={(event) => setPostalCode(event.target.value)}
              placeholder="Enter postal code"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address-note">Note</Label>
            <Textarea
              id="address-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Enter note"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

