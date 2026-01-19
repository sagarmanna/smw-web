"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Pencil } from "lucide-react";

import { DetailHeader } from "@/components/DetailHeader";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { AddLocationModal } from "../components/modals/AddLocationModal";
import { LocationDetails, LocationRow } from "../locations.api";
import { type LocationTimeBlock } from "./components/LocationAvailabilityCalendar";
import { LocationDetailsCard } from "./components/LocationDetailsCard";
import { LocationAddressCard } from "./components/LocationAddressCard";
import { LocationAvailabilityTabsSection } from "./components/LocationAvailabilityTabsSection";

interface LocationDetailClientProps {
  location: string;
  slug: string;
}

const createWeeklyBlocks = (args: {
  prefix: string;
  weekday: { fromTime: string; toTime: string }; // Mon-Fri
  saturday: { fromTime: string; toTime: string };
  sunday?: { fromTime: string; toTime: string };
}): LocationTimeBlock[] => {
  const { prefix, weekday, saturday, sunday } = args;

  const blocks: LocationTimeBlock[] = [
    { id: `${prefix}-mon`, resourceId: 1, ...weekday },
    { id: `${prefix}-tue`, resourceId: 2, ...weekday },
    { id: `${prefix}-wed`, resourceId: 3, ...weekday },
    { id: `${prefix}-thu`, resourceId: 4, ...weekday },
    { id: `${prefix}-fri`, resourceId: 5, ...weekday },
    { id: `${prefix}-sat`, resourceId: 6, ...saturday },
  ];

  if (sunday) {
    blocks.push({ id: `${prefix}-sun`, resourceId: 7, ...sunday });
  }

  return blocks;
};

export function LocationDetailClient({ location, slug }: LocationDetailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [details, setDetails] = React.useState<LocationDetails | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [hstRegistrationNo, setHstRegistrationNo] = React.useState("");

  // API not ready: local-only blocks for each tab (seeded to match screenshots).
  const [operationBlocks, setOperationBlocks] = React.useState<LocationTimeBlock[]>(() =>
    createWeeklyBlocks({
      prefix: "op",
      weekday: { fromTime: "14:00", toTime: "21:00" },
      saturday: { fromTime: "09:00", toTime: "18:00" },
    })
  );
  const [visibilityBlocks, setVisibilityBlocks] = React.useState<LocationTimeBlock[]>(() =>
    createWeeklyBlocks({
      prefix: "sv",
      weekday: { fromTime: "14:00", toTime: "19:00" },
      saturday: { fromTime: "09:00", toTime: "18:00" },
      sunday: { fromTime: "09:00", toTime: "17:00" },
    })
  );

  React.useEffect(() => {
    // API not ready yet: hydrate from query params passed from listing.
    // This keeps the detail page functional without a backend call.
    const stored = (() => {
      try {
        const key = `smw.locationDetail:${location}:${slug}`;
        const raw = sessionStorage.getItem(key);
        return raw ? (JSON.parse(raw) as { name?: string; address?: string; email?: string }) : null;
      } catch {
        return null;
      }
    })();

    const nextDetails: LocationDetails = {
      id: Number.isFinite(Number.parseInt(slug, 10)) ? Number.parseInt(slug, 10) : undefined,
      // Prefer sessionStorage (clean URL), fallback to query params (backward compatible), then slug.
      name: stored?.name || searchParams.get("name") || slug,
      address: stored?.address || searchParams.get("address") || "",
      email: stored?.email || searchParams.get("email") || "",
    };
    setDetails(nextDetails);
    setHstRegistrationNo(nextDetails.hstRegistrationNo || "");
    setIsLoading(false);
    setError(null);
  }, [location, searchParams, slug]);

  const pageTitle = details?.name?.trim() ? details.name.trim() : slug;

  const editInitialData = React.useMemo<LocationRow | null>(() => {
    if (!details) return null;
    const parsedId = Number.parseInt(slug, 10);
    const fallbackId = Number.isFinite(parsedId) ? parsedId : 0;
    return {
      id: details.id ?? fallbackId,
      name: details.name || "",
      address: details.address || "",
      email: details.email || "",
      slug,
    };
  }, [details, slug]);

  if (!details && !isLoading) {
    return (
      <div className="space-y-4 bg-white dark:bg-black px-2 sm:px-3">
        <ErrorDisplay
          error={error || "Location not found"}
          title="Unable to Load Location Details"
          fallbackMessage="An unexpected error occurred while loading the location details. Please try again later."
        />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-black -mt-2">
        {error && (
          <div className="mb-4">
            <ErrorDisplay
              error={error}
              title="Unable to Load Location Details"
              fallbackMessage="An unexpected error occurred while loading the location details. Please try again later."
            />
          </div>
        )}

        <DetailHeader
          breadcrumbItems={[
            {
              label: "Locations",
              onClick: () => router.push(`/${location}/locations`),
            },
          ]}
          currentPageTitle={pageTitle}
          loading={isLoading}
          showActions={false}
          rightContent={
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              onClick={() => setIsEditModalOpen(true)}
              aria-label="Edit location"
              disabled={!editInitialData}
            >
              <Pencil className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
            </Button>
          }
        />

        <div className="space-y-3 sm:space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <LocationDetailsCard details={details} />
            <LocationAddressCard details={details} />
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] items-center gap-3">
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  HST Registration Number
                </div>
                <Input
                  className="w-1/3 border-gray-300 dark:border-gray-600"
                  value={hstRegistrationNo}
                  onChange={(e) => setHstRegistrationNo(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Availability Tabs (reuses the same calendar UI as Teachers/AvailabilityCalendarTab) */}
          <LocationAvailabilityTabsSection
            operationBlocks={operationBlocks}
            setOperationBlocks={setOperationBlocks}
            visibilityBlocks={visibilityBlocks}
            setVisibilityBlocks={setVisibilityBlocks}
          />
        </div>
      </div>

      <AddLocationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          setIsEditModalOpen(false);
        }}
        location={location}
        mode="edit"
        initialData={editInitialData}
      />
    </>
  );
}


