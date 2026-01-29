"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

import type { GenericAddress } from "@/components/user-details/types/common";
import type { GeoData } from "@/app/[location]/customers/components/AddressCard/address-card.api";

interface CreateProfileAddressModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (address: GenericAddress) => void;
  editingAddress?: GenericAddress | null;
  // compatibility only
  location: string;
  entityId: number;
}

function newId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function CreateProfileAddressModal({
  open,
  onClose,
  onSubmit,
  editingAddress,
}: CreateProfileAddressModalProps) {
  const [label, setLabel] = React.useState("Home");
  const [address, setAddress] = React.useState("");
  const [geoData, setGeoData] = React.useState<GeoData>({ city: [], province: [], country: [] });
  const [cityId, setCityId] = React.useState<number>(0);
  const [provinceId, setProvinceId] = React.useState<number>(0);
  const [countryId, setCountryId] = React.useState<number>(0);
  const [postalCode, setPostalCode] = React.useState("");
  const [isPrimary, setIsPrimary] = React.useState(false);
  const geoToastShownRef = React.useRef(false);

  // Reuse the same geodata source as the Customers AddressCard
  React.useEffect(() => {
    if (!open) {
      geoToastShownRef.current = false;
      return;
    }

    const load = async () => {
      try {
        const { getGeoData } = await import(
          "@/app/[location]/customers/components/AddressCard/address-card.api"
        );
        const data = await getGeoData("all");
        const hasOptions =
          !!data &&
          Array.isArray(data.city) &&
          Array.isArray(data.province) &&
          Array.isArray(data.country) &&
          data.city.length > 0 &&
          data.province.length > 0 &&
          data.country.length > 0;

        if (!hasOptions) {
          if (!geoToastShownRef.current) {
            toast.error("Geo options are not available yet.");
            geoToastShownRef.current = true;
          }
          return;
        }

        setGeoData(data);
      } catch {
        // UI-only: if geodata can't load, keep empty and disable selects
        if (!geoToastShownRef.current) {
          toast.error("Geo options are not available yet.");
          geoToastShownRef.current = true;
        }
      }
    };

    load();
  }, [open]);

  const selectedCity = React.useMemo(
    () => geoData.city.find((c) => c.id === cityId),
    [geoData.city, cityId]
  );
  const selectedProvince = React.useMemo(
    () => geoData.province.find((p) => p.id === provinceId),
    [geoData.province, provinceId]
  );
  const selectedCountry = React.useMemo(
    () => geoData.country.find((c) => c.id === countryId),
    [geoData.country, countryId]
  );

  React.useEffect(() => {
    if (!open) return;
    if (editingAddress) {
      setLabel(editingAddress.label || "Home");
      setAddress(editingAddress.address || "");
      // Prefer ids if present; fallback to matching by name
      const matchedCity =
        geoData.city.find((c) => c.id === editingAddress.cityId) ||
        geoData.city.find((c) => c.name === editingAddress.city) ||
        undefined;
      const matchedProvince =
        geoData.province.find((p) => p.id === editingAddress.provinceId) ||
        geoData.province.find((p) => p.name === editingAddress.province) ||
        undefined;
      const matchedCountry =
        geoData.country.find((c) => c.id === editingAddress.countryId) ||
        geoData.country.find((c) => c.name === editingAddress.country) ||
        undefined;
      if (matchedCity) setCityId(matchedCity.id);
      if (matchedProvince) setProvinceId(matchedProvince.id);
      if (matchedCountry) setCountryId(matchedCountry.id);
      setPostalCode(editingAddress.postalCode || "");
      setIsPrimary(!!editingAddress.isPrimary);
    } else {
      setLabel("Home");
      setAddress("");
      if (geoData.city[0]?.id) setCityId(geoData.city[0].id);
      if (geoData.province[0]?.id) setProvinceId(geoData.province[0].id);
      if (geoData.country[0]?.id) setCountryId(geoData.country[0].id);
      setPostalCode("");
      setIsPrimary(false);
    }
  }, [open, editingAddress, geoData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    if (!selectedCity || !selectedProvince || !selectedCountry) return;

    const result: GenericAddress = {
      id: editingAddress?.id || newId(),
      label,
      address: address.trim(),
      city: selectedCity.name,
      cityId: selectedCity.id,
      provinceId: selectedProvince.id,
      countryId: selectedCountry.id,
      postalCode: postalCode.trim(),
      province: selectedProvince.name,
      country: selectedCountry.name,
      isPrimary,
    };
    onSubmit?.(result);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Address</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Label</Label>
            <Select value={label} onValueChange={setLabel}>
              <SelectTrigger>
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
            <Label htmlFor="street">Street</Label>
            <Input id="street" value={address} onChange={(ev) => setAddress(ev.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Select
                value={cityId ? String(cityId) : ""}
                onValueChange={(v) => setCityId(Number(v))}
                disabled={geoData.city.length === 0}
              >
                <SelectTrigger id="city">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {geoData.city.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal">Postal Code</Label>
              <Input id="postal" value={postalCode} onChange={(ev) => setPostalCode(ev.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="province">Province/State</Label>
              <Select
                value={provinceId ? String(provinceId) : ""}
                onValueChange={(v) => setProvinceId(Number(v))}
                disabled={geoData.province.length === 0}
              >
                <SelectTrigger id="province">
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  {geoData.province.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select
                value={countryId ? String(countryId) : ""}
                onValueChange={(v) => setCountryId(Number(v))}
                disabled={geoData.country.length === 0}
              >
                <SelectTrigger id="country">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {geoData.country.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox checked={isPrimary} onCheckedChange={(v) => setIsPrimary(v === true)} id="primary-address" />
            <Label htmlFor="primary-address" className="text-sm">
              Primary
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{editingAddress ? "Save" : "Add"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

