"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

import { DetailHeader } from "@/components/DetailHeader";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { extractErrorMessage } from "@/utils/api/createCrudApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { AddLocationModal } from "../components/modals/AddLocationModal";
import { LocationDetails } from "../locations.api";
import { getLocationInfo, updateLocationHst } from "./locationDetail.api";
import { type LocationTimeBlock } from "./components/LocationAvailabilityCalendar";
import { LocationDetailsCard } from "./components/LocationDetailsCard";
import { LocationAddressCard } from "./components/LocationAddressCard";
import { LocationAvailabilityTabsSection } from "./components/LocationAvailabilityTabsSection";

interface LocationDetailClientProps {
  location: string;
  slug: string;
}

export function LocationDetailClient({ location, slug }: LocationDetailClientProps) {
  const router = useRouter();

  const [details, setDetails] = React.useState<LocationDetails | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [hstInput, setHstInput] = React.useState("");
  const [isUpdatingHst, setIsUpdatingHst] = React.useState(false);

  // Availability blocks are backed by the location availability API
  // (see LocationAvailabilityTabsSection + locationAvailability.api).
  const [operationBlocks, setOperationBlocks] = React.useState<LocationTimeBlock[]>([]);
  const [visibilityBlocks, setVisibilityBlocks] = React.useState<LocationTimeBlock[]>([]);

  const fetchDetails = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiDetails = await getLocationInfo(location);
      if (apiDetails) {
        setDetails(apiDetails);
        setHstInput(apiDetails.hstRegistrationNo || "");
      } else {
        setDetails(null);
        setError("Location details not found");
      }
    } catch (e) {
      setError(extractErrorMessage(e, "Failed to load location details"));
      setDetails(null);
    } finally {
      setIsLoading(false);
    }
  }, [location]);

  React.useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  React.useEffect(() => {
    if (details?.hstRegistrationNo !== undefined) {
      setHstInput(details.hstRegistrationNo || "");
    }
  }, [details?.hstRegistrationNo]);

  const pageTitle = details?.name?.trim() ? details.name.trim() : slug;

  const handleAfterAction = React.useCallback(
    (action: "create" | "update" | "delete") => {
      if (action === "delete") {
        router.push(`/${location}/locations`);
      } else {
        fetchDetails();
      }
    },
    [router, location, fetchDetails]
  );

  const handleHstKeyDown = React.useCallback(
    async (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Enter") return;
      event.preventDefault();

      const nextHst = hstInput.trim();

      setIsUpdatingHst(true);
      try {
        const updated = await updateLocationHst(location, nextHst);
        if (updated === null) {
          toast.error("Failed to update HST number.");
          return;
        }

        setDetails((prev) =>
          prev ? { ...prev, hstRegistrationNo: updated } : prev
        );
        setHstInput(updated);
        toast.success("HST number updated.");
      } catch (e) {
        toast.error(extractErrorMessage(e, "Failed to update HST number."));
      } finally {
        setIsUpdatingHst(false);
      }
    },
    [hstInput, location]
  );

  const editInitialData = React.useMemo(() => {
    if (!details) return null;
    const parsedId = Number.parseInt(slug, 10);
    const fallbackId = Number.isFinite(parsedId) ? parsedId : 0;
    return {
      ...details,
      id: details.id ?? fallbackId,
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
                  value={hstInput}
                  onChange={(e) => setHstInput(e.target.value)}
                  onKeyDown={handleHstKeyDown}
                  disabled={isUpdatingHst}
                />
              </div>
            </CardContent>
          </Card>

          {/* Availability Tabs (reuses the same calendar UI as Teachers/AvailabilityCalendarTab) */}
          <LocationAvailabilityTabsSection
            location={location}
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
        onAfterAction={handleAfterAction}
        location={location}
        mode="edit"
        initialData={editInitialData}
      />
    </>
  );
}


