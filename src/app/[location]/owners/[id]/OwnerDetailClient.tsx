"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { toast } from "sonner";
import { DetailHeaderWithProfile } from "@/app/[location]/customers/components/DetailHeaderWithProfile";
import { ActionMenuGroup } from "@/components/DetailHeader";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { useOwnerDetails } from "../hooks/useOwnerDetails";
import { OwnerDetailsCard } from "../components/OwnerDetailsCard";
import { OwnerEmailCard } from "../components/OwnerEmailCard";
import { OwnerPhoneCard } from "../components/OwnerPhoneCard";
import { OwnerAddressCard } from "../components/OwnerAddressCard";
import { OwnerTabsSection } from "../components/OwnerTabsSection";
import { deleteOwner } from "./owners-details.api";
import { formatFullName } from "../utils/nameUtils";

interface OwnerDetailClientProps {
  location: string;
  id: string;
}

export function OwnerDetailClient({ location, id }: OwnerDetailClientProps) {
  const router = useRouter();
  const ownerId = Number(id);

  // Get loading and error from Redux - single source of truth
  const isLoading = useAppSelector((state) => state.ownerDetails.isLoading);
  const error = useAppSelector((state) => state.ownerDetails.error);
  const ownerInfo = useAppSelector((state) => state.ownerDetails.ownerInfo);

  const {
    details,
    emails,
    phones,
    addresses,
    saveDetails,
    savingDetails,
    updatePassword,
    updateEmails,
    updatePhones,
    updateAddresses,
    refresh,
  } = useOwnerDetails(location, ownerId);

  // All hooks must be called before any early returns
  const pageTitle = React.useMemo(() => {
    if (!details) return `Owner #${id}`;
    return formatFullName(details.firstName, details.lastName) || `Owner #${id}`;
  }, [details, id]);

  const breadcrumbItems = React.useMemo(
    () => [
      {
        label: "Owners",
        onClick: () => router.push(`/${location}/owners`),
      },
    ],
    [location, router]
  );

  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDeleteClick = React.useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = React.useCallback(async () => {
    setIsDeleting(true);
    try {
      const response = await deleteOwner(location, ownerId);
      
      if (response.success) {
        toast.success(response.message || "Owner deleted successfully");
        // Redirect to owners list
        router.push(`/${location}/owners`);
      } else {
        toast.error(response.message || "Failed to delete owner");
      }
    } catch (error: unknown) {
      const errorResponse = error as { errorCode?: string; message?: string };
      const errorMessage = errorResponse.message || "Failed to delete owner";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [location, ownerId, router]);

  const actionMenuGroups = React.useMemo<ActionMenuGroup[]>(
    () => [
    {
      label: "Action",
      items: [
        {
          label: "Delete",
          onClick: handleDeleteClick,
          variant: "destructive",
        },
      ],
    },
    ],
    [handleDeleteClick]
  );

  // Error state - show error but still render cards with skeleton
  const showError = error && !ownerInfo;

  if (isLoading && !ownerInfo) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation size="xl" text="Loading owner..." className="text-center" />
      </div>
    );
  }

  if (!ownerInfo && !isLoading) {
    return (
      <div className="space-y-4 bg-white px-2 sm:px-3">
        <ErrorDisplay
          error={error || "Owner not found"}
          title="Unable to Load Owner Details"
          fallbackMessage="An unexpected error occurred while loading the owner details. Please try again later."
        />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-black -mt-2">
        {showError && (
          <div className="mb-4">
            <ErrorDisplay
              error={error}
              title="Unable to Load Owner Details"
              fallbackMessage="An unexpected error occurred while loading the owner details. Please try again later."
            />
          </div>
        )}
        
        <DetailHeaderWithProfile
          breadcrumbItems={breadcrumbItems}
          currentPageTitle={pageTitle}
          loading={isLoading}
          actionMenuGroups={actionMenuGroups}
          actionButtonAriaLabel="Owner actions"
          showProfileIcon={true}
          profileIconSize="md"
        />

        {/* Main Content Grid - All cards share the same cached data from Redux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mt-4">
          {/* Left Column */}
          <div className="space-y-3 sm:space-y-4">
            <OwnerDetailsCard
              details={details}
              onSaveDetails={saveDetails}
              onUpdatePassword={updatePassword}
              savingDetails={savingDetails}
              isLoading={isLoading}
            />

            {/* Mobile Email and Phone Cards - Only on Mobile */}
            <div className="lg:hidden space-y-3 sm:space-y-4">
              <OwnerEmailCard
                emails={emails}
                onUpdate={updateEmails}
                loading={isLoading}
                location={location}
                ownerId={ownerId}
                onRefresh={refresh}
              />

              <OwnerPhoneCard
                phones={phones}
                onUpdate={updatePhones}
                loading={isLoading}
                location={location}
                ownerId={ownerId}
                onRefresh={refresh}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-3 sm:space-y-4">
            {/* Desktop Email and Phone Cards */}
            <div className="hidden lg:block">
              <OwnerEmailCard
                emails={emails}
                onUpdate={updateEmails}
                loading={isLoading}
                location={location}
                ownerId={ownerId}
                onRefresh={refresh}
              />
            </div>

            <div className="hidden lg:block">
              <OwnerPhoneCard
                phones={phones}
                onUpdate={updatePhones}
                loading={isLoading}
                location={location}
                ownerId={ownerId}
                onRefresh={refresh}
              />
            </div>

            <OwnerAddressCard
              addresses={addresses}
              onUpdate={updateAddresses}
              loading={isLoading}
              location={location}
              ownerId={ownerId}
              onRefresh={refresh}
            />
          </div>
        </div>

        {/* Tabs Section */}
        <OwnerTabsSection location={location} ownerId={ownerId} />
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Are you sure you want to delete this owner?"
        description="This action cannot be undone. The owner and all associated data will be permanently deleted."
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </>
  );
}

