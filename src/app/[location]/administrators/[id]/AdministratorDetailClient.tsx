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
import { useAdministratorDetails } from "../hooks/useAdministratorDetails";
import { AdministratorDetailsCard } from "../components/AdministratorDetailsCard";
import { AdministratorEmailCard } from "../components/AdministratorEmailCard";
import { AdministratorPhoneCard } from "../components/AdministratorPhoneCard";
import { AdministratorAddressCard } from "../components/AdministratorAddressCard";
import { AdministratorTabsSection } from "../components/AdministratorTabsSection";
import { deleteUserByRole } from "@/lib/api/user.api";

interface AdministratorDetailClientProps {
  location: string;
  id: string;
}

export function AdministratorDetailClient({ location, id }: AdministratorDetailClientProps) {
  const router = useRouter();
  const administratorId = Number(id);

  // Get loading and error from Redux - single source of truth
  const isLoading = useAppSelector((state) => state.administrator.isLoading);
  const error = useAppSelector((state) => state.administrator.error);
  const administratorInfo = useAppSelector((state) => state.administrator.administratorInfo);

  const {
    details,
    emails,
    phones,
    addresses,
    saveDetails,
    savingDetails,
    updateEmails,
    updatePhones,
    updateAddresses,
    refresh,
  } = useAdministratorDetails(location, administratorId);

  // All hooks must be called before any early returns
  const pageTitle = React.useMemo(() => {
    if (!details) return `Administrator #${id}`;
    return `${details.firstName} ${details.lastName}`.trim() || `Administrator #${id}`;
  }, [details, id]);

  const breadcrumbItems = React.useMemo(
    () => [
      {
        label: "Administrators",
        onClick: () => router.push(`/${location}/administrators`),
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
      const response = await deleteUserByRole(location, administratorId, 'administrator');
      
      if (response.success) {
        toast.success(response.message || "Administrator deleted successfully");
        // Redirect to administrators list
        router.push(`/${location}/administrators`);
      } else {
        toast.error(response.message || "Failed to delete administrator");
      }
    } catch (error: unknown) {
      const errorResponse = error as { errorCode?: string; message?: string };
      const errorMessage = errorResponse.message || "Failed to delete administrator";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [location, administratorId, router]);

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
  const showError = error && !administratorInfo;

  if (isLoading && !administratorInfo) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation size="xl" text="Loading administrator..." className="text-center" />
      </div>
    );
  }

  if (!administratorInfo && !isLoading) {
    return (
      <div className="space-y-4 bg-white px-2 sm:px-3">
        <ErrorDisplay
          error={error || "Administrator not found"}
          title="Unable to Load Administrator Details"
          fallbackMessage="An unexpected error occurred while loading the administrator details. Please try again later."
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
              title="Unable to Load Administrator Details"
              fallbackMessage="An unexpected error occurred while loading the administrator details. Please try again later."
            />
          </div>
        )}
        
        <DetailHeaderWithProfile
          breadcrumbItems={breadcrumbItems}
          currentPageTitle={pageTitle}
          loading={isLoading}
          actionMenuGroups={actionMenuGroups}
          actionButtonAriaLabel="Administrator actions"
          showProfileIcon={true}
          profileIconSize="md"
        />

        {/* Main Content Grid - All cards share the same cached data from Redux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mt-4">
          {/* Left Column */}
          <div className="space-y-3 sm:space-y-4">
            <AdministratorDetailsCard
              details={details}
              onSaveDetails={saveDetails}
              savingDetails={savingDetails}
              isLoading={isLoading}
            />

            {/* Mobile Email and Phone Cards - Only on Mobile */}
            <div className="lg:hidden space-y-3 sm:space-y-4">
              <AdministratorEmailCard
                emails={emails}
                onUpdate={updateEmails}
                loading={isLoading}
                location={location}
                administratorId={administratorId}
                onRefresh={refresh}
              />

              <AdministratorPhoneCard
                phones={phones}
                onUpdate={updatePhones}
                loading={isLoading}
                location={location}
                administratorId={administratorId}
                onRefresh={refresh}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-3 sm:space-y-4">
            {/* Desktop Email and Phone Cards */}
            <div className="hidden lg:block">
              <AdministratorEmailCard
                emails={emails}
                onUpdate={updateEmails}
                loading={isLoading}
                location={location}
                administratorId={administratorId}
                onRefresh={refresh}
              />
            </div>

            <div className="hidden lg:block">
              <AdministratorPhoneCard
                phones={phones}
                onUpdate={updatePhones}
                loading={isLoading}
                location={location}
                administratorId={administratorId}
                onRefresh={refresh}
              />
            </div>

            <AdministratorAddressCard
              addresses={addresses}
              onUpdate={updateAddresses}
              loading={isLoading}
              location={location}
              administratorId={administratorId}
              onRefresh={refresh}
            />
          </div>
        </div>

        {/* Tabs Section */}
        <AdministratorTabsSection location={location} administratorId={administratorId} />
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Are you sure you want to delete this administrator?"
        description="This action cannot be undone. The administrator and all associated data will be permanently deleted."
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </>
  );
}

