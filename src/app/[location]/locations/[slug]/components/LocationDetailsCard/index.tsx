"use client";

import * as React from "react";
import { parseISO, format, isValid as isValidDate } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LocationDetails } from "../../../locations.api";
import { InfoRow } from "../InfoRow";

const formatDisplayDate = (raw?: string): string => {
  if (!raw) return "";
  try {
    const d = parseISO(raw);
    if (isValidDate(d)) return format(d, "MMM dd, yyyy");
    return raw;
  } catch {
    return raw;
  }
};

interface LocationDetailsCardProps {
  details: LocationDetails | null;
}

export function LocationDetailsCard({ details }: LocationDetailsCardProps) {
  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="text-lg">Details</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1">
          <InfoRow label="Email" value={details?.email || ""} />
          <InfoRow label="Phone" value={details?.phoneNumber || ""} />
          <InfoRow
            label="Royalty"
            value={
              details?.royaltyPercent !== undefined && details?.royaltyPercent !== null
                ? `${details.royaltyPercent}%`
                : ""
            }
          />
          <InfoRow
            label="Advertisement"
            value={
              details?.advertisementPercent !== undefined && details?.advertisementPercent !== null
                ? `${details.advertisementPercent}%`
                : ""
            }
          />
          <InfoRow label="Conversion Date" value={formatDisplayDate(details?.conversionDate)} />
        </div>
      </CardContent>
    </Card>
  );
}


