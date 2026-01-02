"use client";

import * as React from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { 
  updateOwnerDetailsThunk, 
  updateEmails, 
  updatePhones, 
  updateAddresses,
  fetchOwner,
  clearCache,
  updateDetails,
} from "../[id]/owners-details.slice";
import { toast } from "sonner";
import { setOwnerPassword } from "../[id]/owners-details.api";
import {
  OwnerAddress,
  OwnerBasicDetails,
  OwnerEmail,
  OwnerPhone,
} from "../types";

type OwnerDetailsHookReturn = {
  loading: boolean;
  error: string | null;
  details: OwnerBasicDetails | null;
  emails: OwnerEmail[];
  phones: OwnerPhone[];
  addresses: OwnerAddress[];
  refresh: () => Promise<void>;
  forceRefresh: () => Promise<void>;
  saveDetails: (next: OwnerBasicDetails) => Promise<boolean>;
  updatePassword: (password: string, confirmPassword: string) => Promise<boolean>;
  updateEmails: React.Dispatch<React.SetStateAction<OwnerEmail[]>>;
  updatePhones: React.Dispatch<React.SetStateAction<OwnerPhone[]>>;
  updateAddresses: React.Dispatch<React.SetStateAction<OwnerAddress[]>>;
  savingDetails: boolean;
};

export function useOwnerDetails(
  location: string,
  ownerId: number
): OwnerDetailsHookReturn {
  const dispatch = useAppDispatch();
  
  // Get owner data from Redux store
  const ownerInfo = useAppSelector((state) => state.ownerDetails.ownerInfo);
  const loading = useAppSelector((state) => state.ownerDetails.isLoading);
  const error = useAppSelector((state) => state.ownerDetails.error);
  const savingDetails = useAppSelector((state) => state.ownerDetails.isSaving);

  // Transform Redux state to hook return format
  const details: OwnerBasicDetails | null = React.useMemo(() => {
    if (!ownerInfo?.profile) return null;
    const [firstName, ...lastNameParts] = ownerInfo.profile.name.split(' ');
    return {
      firstName,
      lastName: lastNameParts.join(' ') || '',
      role: ownerInfo.profile.role,
      picture: ownerInfo.profile.picture,
    };
  }, [ownerInfo]);

  // Memoize arrays to prevent unnecessary re-renders
  const emails = React.useMemo(() => ownerInfo?.email || [], [ownerInfo?.email]);
  const phones = React.useMemo(() => ownerInfo?.phone || [], [ownerInfo?.phone]);
  const addresses = React.useMemo(() => ownerInfo?.addresses || [], [ownerInfo?.addresses]);

  const refresh = React.useCallback(async () => {
    dispatch(fetchOwner({ location, ownerId }));
  }, [dispatch, location, ownerId]);

  // Force refresh by clearing cache first
  const forceRefresh = React.useCallback(async () => {
    dispatch(clearCache());
    dispatch(fetchOwner({ location, ownerId }));
  }, [dispatch, location, ownerId]);

  const saveDetails = React.useCallback(
    async (next: OwnerBasicDetails) => {
      try {
        // Optimistic update
        dispatch(updateDetails(next));
        
        await dispatch(
          updateOwnerDetailsThunk({
            location,
            ownerId,
            data: {
              firstName: next.firstName,
              lastName: next.lastName,
            },
          })
        ).unwrap();
        
        toast.success("Owner details updated successfully");
        
        // Refresh data from server to ensure consistency
        await refresh();
        
        return true;
      } catch (error) {
        console.error("Failed to save owner details:", error);
        toast.error(error instanceof Error ? error.message : "Failed to update owner details. Please try again.");
        return false;
      }
    },
    [dispatch, location, ownerId, refresh]
  );

  const handleUpdateEmails = React.useCallback(
    (emails: OwnerEmail[] | ((prev: OwnerEmail[]) => OwnerEmail[])) => {
      const newEmails = typeof emails === 'function' 
        ? emails(ownerInfo?.email || [])
        : emails;
      dispatch(updateEmails(newEmails));
    },
    [dispatch, ownerInfo]
  );

  const handleUpdatePhones = React.useCallback(
    (phones: OwnerPhone[] | ((prev: OwnerPhone[]) => OwnerPhone[])) => {
      const newPhones = typeof phones === 'function'
        ? phones(ownerInfo?.phone || [])
        : phones;
      dispatch(updatePhones(newPhones));
    },
    [dispatch, ownerInfo]
  );

  const handleUpdateAddresses = React.useCallback(
    (addresses: OwnerAddress[] | ((prev: OwnerAddress[]) => OwnerAddress[])) => {
      const newAddresses = typeof addresses === 'function'
        ? addresses(ownerInfo?.addresses || [])
        : addresses;
      dispatch(updateAddresses(newAddresses));
    },
    [dispatch, ownerInfo]
  );

  const updatePassword = React.useCallback(
    async (password: string, confirmPassword: string): Promise<boolean> => {
      try {
        const response = await setOwnerPassword(location, ownerId, {
          password,
          confirmPassword,
        });

        if (response.success) {
          toast.success("Password updated successfully");
          return true;
        } else {
          toast.error(response.message || "Failed to update password");
          return false;
        }
      } catch (error: unknown) {
        const errorResponse = error as { message?: string; errorCode?: string };
        const errorMessage = errorResponse.message || "Failed to update password";
        toast.error(errorMessage);
        return false;
      }
    },
    [location, ownerId]
  );

  return {
    loading,
    error,
    details,
    emails,
    phones,
    addresses,
    refresh,
    forceRefresh,
    saveDetails,
    updatePassword,
    updateEmails: handleUpdateEmails,
    updatePhones: handleUpdatePhones,
    updateAddresses: handleUpdateAddresses,
    savingDetails,
  };
}

