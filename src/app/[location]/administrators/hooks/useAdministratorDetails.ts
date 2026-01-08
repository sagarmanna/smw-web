"use client";

import * as React from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { 
  updateEmails, 
  updatePhones, 
  updateAddresses,
  updateDetails,
} from "../[id]/administrators-details.slice";
import { toast } from "sonner";
import {
  AdministratorAddress,
  AdministratorBasicDetails,
  AdministratorEmail,
  AdministratorPhone,
} from "../types";

type AdministratorDetailsHookReturn = {
  loading: boolean;
  error: string | null;
  details: AdministratorBasicDetails | null;
  emails: AdministratorEmail[];
  phones: AdministratorPhone[];
  addresses: AdministratorAddress[];
  saveDetails: (next: AdministratorBasicDetails) => Promise<boolean>;
  updateEmails: React.Dispatch<React.SetStateAction<AdministratorEmail[]>>;
  updatePhones: React.Dispatch<React.SetStateAction<AdministratorPhone[]>>;
  updateAddresses: React.Dispatch<React.SetStateAction<AdministratorAddress[]>>;
  savingDetails: boolean;
};

export function useAdministratorDetails(
  // location, administratorId - Reserved for future API integration
  location: string,
  administratorId: number
): AdministratorDetailsHookReturn {
  const dispatch = useAppDispatch();
  
  // Get administrator data from Redux store
  const administratorInfo = useAppSelector((state) => state.administrator.administratorInfo);
  const loading = useAppSelector((state) => state.administrator.isLoading);
  const error = useAppSelector((state) => state.administrator.error);
  const savingDetails = useAppSelector((state) => state.administrator.isSaving);

  // Transform Redux state to hook return format
  const details: AdministratorBasicDetails | null = React.useMemo(() => {
    if (!administratorInfo?.profile) return null;
    const [firstName, ...lastNameParts] = administratorInfo.profile.name.split(' ');
    return {
      firstName,
      lastName: lastNameParts.join(' ') || '',
      role: administratorInfo.profile.role,
      picture: administratorInfo.profile.picture,
    };
  }, [administratorInfo]);

  // Memoize arrays to prevent unnecessary re-renders
  const emails = React.useMemo(() => administratorInfo?.email || [], [administratorInfo?.email]);
  const phones = React.useMemo(() => administratorInfo?.phone || [], [administratorInfo?.phone]);
  const addresses = React.useMemo(() => administratorInfo?.addresses || [], [administratorInfo?.addresses]);

  const saveDetails = React.useCallback(
    async (next: AdministratorBasicDetails) => {
      // Optimistic update only - API not ready yet
      dispatch(updateDetails(next));
      toast.success("Administrator details updated locally");
      return true;
    },
    [dispatch]
  );

  const handleUpdateEmails = React.useCallback(
    (emails: AdministratorEmail[] | ((prev: AdministratorEmail[]) => AdministratorEmail[])) => {
      const newEmails = typeof emails === 'function' 
        ? emails(administratorInfo?.email || [])
        : emails;
      dispatch(updateEmails(newEmails));
    },
    [dispatch, administratorInfo]
  );

  const handleUpdatePhones = React.useCallback(
    (phones: AdministratorPhone[] | ((prev: AdministratorPhone[]) => AdministratorPhone[])) => {
      const newPhones = typeof phones === 'function'
        ? phones(administratorInfo?.phone || [])
        : phones;
      dispatch(updatePhones(newPhones));
    },
    [dispatch, administratorInfo]
  );

  const handleUpdateAddresses = React.useCallback(
    (addresses: AdministratorAddress[] | ((prev: AdministratorAddress[]) => AdministratorAddress[])) => {
      const newAddresses = typeof addresses === 'function'
        ? addresses(administratorInfo?.addresses || [])
        : addresses;
      dispatch(updateAddresses(newAddresses));
    },
    [dispatch, administratorInfo]
  );

  return {
    loading,
    error,
    details,
    emails,
    phones,
    addresses,
    saveDetails,
    updateEmails: handleUpdateEmails,
    updatePhones: handleUpdatePhones,
    updateAddresses: handleUpdateAddresses,
    savingDetails,
  };
}

