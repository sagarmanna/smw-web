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
import { OwnerTabsSection } from "../components/OwnerTabsSection";
import { deleteOwner } from "./owners-details.api";
import { formatFullName } from "../utils/nameUtils";
import { UserDetailsCard } from "@/components/user-details/cards/UserDetailsCard";
import { UserEmailCard } from "@/components/user-details/cards/UserEmailCard";
import { UserPhoneCard } from "@/components/user-details/cards/UserPhoneCard";
import { UserAddressCard } from "@/components/user-details/cards/UserAddressCard";
import { ownerDetailPageConfig } from "./config/detailPageConfig";
import { EditUserDetailsModal } from "@/components/user-details/modals/EditUserDetailsModal";
import { CreateEmailModal } from "@/components/user-details/modals/CreateEmailModal";
import { CreatePhoneModal } from "@/components/user-details/modals/CreatePhoneModal";
import { CreateAddressModal } from "@/components/user-details/modals/CreateAddressModal";
import { EmailList, PhoneList, AddressList } from "../components/sections";
import { useEmailHandlers, usePhoneHandlers, useAddressHandlers } from "../hooks/useOwnerItemHandlers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { EditOwnerLoginModal } from "../components/modals/EditOwnerLoginModal";
import { setUserPassword, type SetPasswordErrorResponse } from "@/lib/api/user.api";

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
  const [isEditLoginModalOpen, setIsEditLoginModalOpen] = React.useState(false);

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

  const handleUpdateLoginCredentials = React.useCallback(async (data: {
    pin?: string;
    canMerge: boolean;
    password?: string;
    confirmPassword?: string;
  }) => {
    try {
      const requestData: {
        password?: string;
        confirmPassword?: string;
        pin?: number;
      } = {};

      // Only include PIN if provided
      if (data.pin && data.pin.trim()) {
        const pinNumber = parseInt(data.pin.trim(), 10);
        if (!isNaN(pinNumber) && pinNumber > 0) {
          requestData.pin = pinNumber;
        }
      }

      // Include password if provided
      if (data.password && data.password.trim()) {
        requestData.password = data.password.trim();
        requestData.confirmPassword = data.confirmPassword?.trim();
      }

      // Note: canMerge is kept in UI but not sent to API for now
      // TODO: Add canMerge support when API endpoint is ready

      // If no data to update, return early
      if (!requestData.pin && !requestData.password) {
        return { success: false, message: "No data to update" };
      }

      const response = await setUserPassword(location, ownerId, requestData);

      if (response.success && response.data?.status) {
        return { success: true, message: response.message };
      } else {
        // Handle error response (shouldn't happen if API is correct, but handle it)
        const errorMessage = Array.isArray(response.message) 
          ? response.message.join(", ") 
          : response.message || "Failed to update login credentials";
        console.error("Failed to update login credentials:", errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (err: unknown) {
      // Extract error message from API error response
      let errorMessage: string = "Failed to update login credentials";
      
      console.error("Error caught in handleUpdateLoginCredentials:", err);
      console.error("Error type:", typeof err);
      console.error("Error is object:", err && typeof err === 'object');
      
      // Check if it's a SetPasswordErrorResponse (thrown by setUserPassword)
      // The API throws axiosError.response.data which is the SetPasswordErrorResponse
      if (err && typeof err === 'object') {
        // Try to access message property directly
        const errorObj = err as Record<string, unknown>;
        
        if (errorObj.message !== undefined && errorObj.message !== null) {
          const message = errorObj.message;
          
          if (Array.isArray(message)) {
            errorMessage = message.join(", ");
          } else if (typeof message === 'string' && message.trim()) {
            errorMessage = message;
          }
        }
      } else if (err instanceof Error) {
        errorMessage = err.message || errorMessage;
      }
      
      console.error("Extracted error message:", errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [location, ownerId]);

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
            <UserDetailsCard
              details={details}
              config={{
                defaultRole: ownerDetailPageConfig.defaultRole,
                roleLabel: ownerDetailPageConfig.roleLabel,
              }}
              onSaveDetails={saveDetails}
              savingDetails={savingDetails}
              isLoading={isLoading}
              EditModal={(props) => (
                <EditUserDetailsModal
                  {...props}
                  title="Edit Owner Details"
                  defaultRole={ownerDetailPageConfig.defaultRole}
                />
              )}
              formatName={(d) => formatFullName(d?.firstName, d?.lastName) || ""}
              customActions={
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      aria-label="More actions"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditLoginModalOpen(true)}>
                      Set Password
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              }
            />

            {/* Mobile Email and Phone Cards - Only on Mobile */}
            <div className="lg:hidden space-y-3 sm:space-y-4">
              <UserEmailCard
                emails={emails}
                onUpdate={updateEmails}
                loading={isLoading}
                location={location}
                entityId={ownerId}
                onRefresh={refresh}
                CreateModal={(props) => (
                  <CreateEmailModal
                    {...props}
                    apiAdapter={ownerDetailPageConfig.apiAdapter}
                    validateEmail={ownerDetailPageConfig.validateEmail}
                  />
                )}
                EmailList={EmailList}
                useEmailHandlers={useEmailHandlers}
              />

              <UserPhoneCard
                phones={phones}
                onUpdate={updatePhones}
                loading={isLoading}
                location={location}
                entityId={ownerId}
                onRefresh={refresh}
                CreateModal={(props) => (
                  <CreatePhoneModal
                    {...props}
                    apiAdapter={ownerDetailPageConfig.apiAdapter}
                  />
                )}
                PhoneList={PhoneList}
                usePhoneHandlers={usePhoneHandlers}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-3 sm:space-y-4">
            {/* Desktop Email and Phone Cards */}
            <div className="hidden lg:block">
              <UserEmailCard
                emails={emails}
                onUpdate={updateEmails}
                loading={isLoading}
                location={location}
                entityId={ownerId}
                onRefresh={refresh}
                CreateModal={(props) => (
                  <CreateEmailModal
                    {...props}
                    apiAdapter={ownerDetailPageConfig.apiAdapter}
                    validateEmail={ownerDetailPageConfig.validateEmail}
                  />
                )}
                EmailList={EmailList}
                useEmailHandlers={useEmailHandlers}
              />
            </div>

            <div className="hidden lg:block">
              <UserPhoneCard
                phones={phones}
                onUpdate={updatePhones}
                loading={isLoading}
                location={location}
                entityId={ownerId}
                onRefresh={refresh}
                CreateModal={(props) => (
                  <CreatePhoneModal
                    {...props}
                    apiAdapter={ownerDetailPageConfig.apiAdapter}
                  />
                )}
                PhoneList={PhoneList}
                usePhoneHandlers={usePhoneHandlers}
              />
            </div>

            <UserAddressCard
              addresses={addresses}
              onUpdate={updateAddresses}
              loading={isLoading}
              location={location}
              entityId={ownerId}
              onRefresh={refresh}
              CreateModal={(props) => (
                <CreateAddressModal
                  {...props}
                  apiAdapter={ownerDetailPageConfig.apiAdapter}
                />
              )}
              AddressList={AddressList}
              useAddressHandlers={useAddressHandlers}
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

      {/* Edit Login Credentials Modal */}
      <EditOwnerLoginModal
        open={isEditLoginModalOpen}
        onClose={() => setIsEditLoginModalOpen(false)}
        onSubmit={handleUpdateLoginCredentials}
      />
    </>
  );
}

