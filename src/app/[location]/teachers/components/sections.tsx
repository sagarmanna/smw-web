"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  TeacherAddress,
  TeacherEmail,
  TeacherPhone,
  TeacherQualification,
} from "../types";

const formatCurrency = (value?: number) => {
  if (value === undefined) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
};

interface EmailListProps {
  emails: TeacherEmail[];
}

export function EmailList({ emails }: EmailListProps) {
  return (
    <div className="space-y-2">
      {emails.map((item) => (
        <div
          key={item.id}
          className="flex items-start justify-between rounded border border-border/50 bg-background px-3 py-2"
        >
          <div>
            <div className="text-sm font-semibold text-foreground">{item.label}</div>
            <div className="text-sm text-muted-foreground">{item.email}</div>
            {item.note && (
              <div className="mt-1 text-xs text-muted-foreground">{item.note}</div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            {item.isPrimary && <Badge variant="secondary">Primary</Badge>}
          </div>
        </div>
      ))}
    </div>
  );
}

interface PhoneListProps {
  phones: TeacherPhone[];
}

export function PhoneList({ phones }: PhoneListProps) {
  return (
    <div className="space-y-2">
      {phones.map((item) => (
        <div
          key={item.id}
          className="rounded border border-border/50 bg-background px-3 py-2 text-sm"
        >
          <div className="font-semibold text-foreground">{item.label}</div>
          <div className="text-muted-foreground">{item.number}</div>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            {item.extension && <span>Ext {item.extension}</span>}
            {item.note && <span>{item.note}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

interface AddressListProps {
  addresses: TeacherAddress[];
}

export function AddressList({ addresses }: AddressListProps) {
  return (
    <div className="space-y-2">
      {addresses.map((item) => (
        <div
          key={item.id}
          className="rounded border border-border/50 bg-background px-3 py-2 text-sm"
        >
          <div className="font-semibold text-foreground">{item.label}</div>
          <div className="text-muted-foreground">{item.address}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {[item.city, item.postalCode].filter(Boolean).join(", ")}
          </div>
          {item.note && (
            <div className="mt-1 text-xs text-muted-foreground">{item.note}</div>
          )}
        </div>
      ))}
    </div>
  );
}

interface QualificationsListProps {
  items: TeacherQualification[];
}

export function QualificationsList({ items }: QualificationsListProps) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between rounded border border-border/50 bg-background px-3 py-2 text-sm"
        >
          <span className="font-medium text-foreground">{item.name}</span>
          <span className="text-muted-foreground">{formatCurrency(item.rate)}</span>
        </div>
      ))}
    </div>
  );
}

