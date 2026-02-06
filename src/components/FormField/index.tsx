"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface FormFieldProps {
  id?: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}

/**
 * Reusable form field wrapper with label and error display.
 * Applies error styling to label when error is present.
 */
export function FormField({ id, label, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className={error ? "text-red-500" : ""}>
        {label}
      </Label>
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

export interface GeoSelectFieldProps {
  id: string;
  label: string;
  value: string;
  options: { id: number; name: string }[];
  placeholder: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onValueChange: (value: string) => void;
}

/**
 * Select field for geo data (city, province, country).
 * Shows "Loading..." placeholder when options are loading.
 */
export function GeoSelectField({
  id,
  label,
  value,
  options,
  placeholder,
  error,
  loading,
  disabled,
  onValueChange,
}: GeoSelectFieldProps) {
  return (
    <FormField id={id} label={label} error={error}>
      <Select value={value} onValueChange={onValueChange} disabled={disabled || loading}>
        <SelectTrigger className={error ? "border-red-500" : ""}>
          <SelectValue placeholder={loading ? "Loading..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.id} value={o.id.toString()}>
              {o.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}
