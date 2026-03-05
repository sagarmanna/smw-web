"use client";

import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDisplayDate } from "@/utils/dateUtils";
import type { LocationDetails } from "../../../locations.api";
import { InfoRow } from "../InfoRow";

interface LocationDetailsCardProps {
  details: LocationDetails | null;
  /** When false, hides Royalty, Advertisement, and Conversion Date (e.g. for non-administrators). Default true for backward compatibility. */
  showAdminFields?: boolean;
}

export function LocationDetailsCard({ details, showAdminFields = true }: LocationDetailsCardProps) {
  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="text-lg">Details</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1">
          <InfoRow label="Email" value={details?.email || ""} />
          <InfoRow label="Phone" value={details?.phoneNumber || ""} />
          {showAdminFields && (
            <>
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
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


