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
import { TeacherAddress } from "../../types";

interface CreateAddressModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (address: TeacherAddress) => void;
}

export function CreateAddressModal({
  open,
  onClose,
  onSubmit,
}: CreateAddressModalProps) {
  const [label, setLabel] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [city, setCity] = React.useState("");
  const [postalCode, setPostalCode] = React.useState("");
  const [note, setNote] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const resetForm = () => {
    setLabel("");
    setAddress("");
    setCity("");
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

    const newAddress: TeacherAddress = {
      id: crypto.randomUUID(),
      label: label.trim() || "Office",
      address: address.trim(),
      city: city.trim() || "Unknown",
      cityId: 0,
      provinceId: 0,
      countryId: 0,
      postalCode: postalCode.trim() || "00000",
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
          <DialogTitle>Add Address</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="address-label">Label</Label>
              <Input
                id="address-label"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="Office"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address-postal">Postal Code</Label>
              <Input
                id="address-postal"
                value={postalCode}
                onChange={(event) => setPostalCode(event.target.value)}
                placeholder="A1A 1A1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address-line">Address</Label>
            <Input
              id="address-line"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="123 Main Street"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address-city">City</Label>
            <Input
              id="address-city"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="City"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address-note">Note</Label>
            <Input
              id="address-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional note"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Address</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

