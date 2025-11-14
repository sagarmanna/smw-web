"use client";

import * as React from "react";
import { updateTeacherDetails } from "../teachers.api";
import {
  TeacherAddress,
  TeacherBasicDetails,
  TeacherEmail,
  TeacherPhone,
  TeacherQualification,
} from "../types";
import {
  MOCK_DETAILS,
  MOCK_EMAILS,
  MOCK_PHONES,
  MOCK_ADDRESSES,
  MOCK_PRIVATE_QUALIFICATIONS,
  MOCK_GROUP_QUALIFICATIONS,
} from "../mockData/mockData";

type TeacherDetailsHookReturn = {
  loading: boolean;
  error: string | null;
  details: TeacherBasicDetails | null;
  emails: TeacherEmail[];
  phones: TeacherPhone[];
  addresses: TeacherAddress[];
  privateQualifications: TeacherQualification[];
  groupQualifications: TeacherQualification[];
  refresh: () => Promise<void>;
  saveDetails: (next: TeacherBasicDetails) => Promise<boolean>;
  updateEmails: React.Dispatch<React.SetStateAction<TeacherEmail[]>>;
  updatePhones: React.Dispatch<React.SetStateAction<TeacherPhone[]>>;
  updateAddresses: React.Dispatch<React.SetStateAction<TeacherAddress[]>>;
  addPrivateQualifications: (next: TeacherQualification[]) => void;
  addGroupQualifications: (next: TeacherQualification[]) => void;
  updatePassword: (password: string) => Promise<boolean>;
  savingDetails: boolean;
};

const simulateRequest = async <T,>(payload: T, delay = 150): Promise<T> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(payload), delay);
  });

export function useTeacherDetails(
  location: string,
  teacherId: number
): TeacherDetailsHookReturn {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [details, setDetails] = React.useState<TeacherBasicDetails | null>(null);
  const [emails, setEmails] = React.useState<TeacherEmail[]>([]);
  const [phones, setPhones] = React.useState<TeacherPhone[]>([]);
  const [addresses, setAddresses] = React.useState<TeacherAddress[]>([]);
  const [privateQualifications, setPrivateQualifications] = React.useState<
    TeacherQualification[]
  >([]);
  const [groupQualifications, setGroupQualifications] = React.useState<
    TeacherQualification[]
  >([]);
  const [savingDetails, setSavingDetails] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        detailsResponse,
        emailsResponse,
        phonesResponse,
        addressesResponse,
        privateQualificationsResponse,
        groupQualificationsResponse,
      ] = await Promise.all([
        simulateRequest(MOCK_DETAILS),
        simulateRequest(MOCK_EMAILS),
        simulateRequest(MOCK_PHONES),
        simulateRequest(MOCK_ADDRESSES),
        simulateRequest(MOCK_PRIVATE_QUALIFICATIONS),
        simulateRequest(MOCK_GROUP_QUALIFICATIONS),
      ]);

      setDetails(detailsResponse);
      setEmails(emailsResponse);
      setPhones(phonesResponse);
      setAddresses(addressesResponse);
      setPrivateQualifications(privateQualificationsResponse);
      setGroupQualifications(groupQualificationsResponse);
    } catch (err) {
      console.error("Failed to load teacher details:", err);
      setError("Unable to load teacher details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  const saveDetails = React.useCallback(
    async (next: TeacherBasicDetails) => {
      setSavingDetails(true);
      try {
        const response = await updateTeacherDetails(location, teacherId, {
          firstName: next.firstName,
          lastName: next.lastName,
          birthDate: next.birthDate,
        });

        if (!response.status) {
          setError(response.message ?? "Failed to update teacher details.");
          return false;
        }

        setDetails(next);
        return true;
      } catch (err) {
        console.error("Failed to save teacher details:", err);
        setError("Unable to save teacher details. Please try again.");
        return false;
      } finally {
        setSavingDetails(false);
      }
    },
    [location, teacherId]
  );

  const addPrivateQualifications = React.useCallback(
    (next: TeacherQualification[]) => {
      setPrivateQualifications((prev) => [...prev, ...next]);
    },
    []
  );

  const addGroupQualifications = React.useCallback(
    (next: TeacherQualification[]) => {
      setGroupQualifications((prev) => [...prev, ...next]);
    },
    []
  );

  const updatePassword = React.useCallback(async (password: string) => {
    try {
      await simulateRequest(true);
      return true;
    } catch (err) {
      console.error("Failed to update password:", err);
      setError("Unable to update password. Please try again.");
      return false;
    }
  }, []);

  return {
    loading,
    error,
    details,
    emails,
    phones,
    addresses,
    privateQualifications,
    groupQualifications,
    refresh: loadData,
    saveDetails,
    updateEmails: setEmails,
    updatePhones: setPhones,
    updateAddresses: setAddresses,
    addPrivateQualifications,
    addGroupQualifications,
    updatePassword,
    savingDetails,
  };
}

