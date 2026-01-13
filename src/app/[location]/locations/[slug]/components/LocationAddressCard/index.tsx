"use client";

import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LocationDetails } from "../../../locations.api";
import { InfoRow } from "../InfoRow";

interface LocationAddressCardProps {
  details: LocationDetails | null;
}

export function LocationAddressCard({ details }: LocationAddressCardProps) {
  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="text-lg">Address</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1">
          <InfoRow label="Address" value={details?.address || ""} />
          <InfoRow label="City" value={details?.city || ""} />
          <InfoRow label="Province" value={details?.province || ""} />
          <InfoRow label="Country" value={details?.country || ""} />
          <InfoRow label="Postal" value={details?.postalCode || ""} />
        </div>
      </CardContent>
    </Card>
  );
}


