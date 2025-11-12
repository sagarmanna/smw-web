"use client";

import * as React from "react";
import { updateTeacherDetails } from "../components/TeacherDetailsCard/teacher-details-card.api";
import {
  TeacherAddress,
  TeacherBasicDetails,
  TeacherEmail,
  TeacherPhone,
  TeacherQualification,
} from "../types";

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

const MOCK_DETAILS: TeacherBasicDetails = {
  firstName: "tes123",
  lastName: "12345",
  role: "Teacher",
  birthDate: "1992-01-17",
};

const MOCK_EMAILS: TeacherEmail[] = [
  {
    id: "1",
    label: "Work",
    email: "1@example.com",
    note: "",
    isPrimary: true,
  },
  {
    id: "2",
    label: "Home",
    email: "123@example.com",
    note: "test note",
    isPrimary: false,
  },
];

const MOCK_PHONES: TeacherPhone[] = [
  {
    id: "1",
    label: "Home",
    number: "(553) 900-0000",
    extension: "7544",
    note: "test",
  },
];

const MOCK_ADDRESSES: TeacherAddress[] = [];

const MOCK_PRIVATE_QUALIFICATIONS: TeacherQualification[] = [
  { id: 1, name: "Test65", rate: 10.0 },
  { id: 2, name: "test72.5", rate: 10.0 },
  { id: 3, name: "Instrument", rate: 20.0 },
  { id: 4, name: "xClarinet", rate: 36.0 },
  { id: 5, name: "xPiano Contemporary", rate: 10.0 },
  { id: 6, name: "xGuitar Core", rate: 10.0 },
  { id: 7, name: "xGuitar Contemporary", rate: 10.0 },
  { id: 8, name: "xGuitar Hybrid", rate: 10.0 },
  { id: 9, name: "xPiano Hybrid" },
  { id: 10, name: "40th Anniversary Vocal", rate: 25.0 },
  { id: 11, name: "Rami Test Program", rate: 30.0 },
];

const MOCK_GROUP_QUALIFICATIONS: TeacherQualification[] = [
  { id: 12, name: "Rami Group Program", rate: 20.0 },
];

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

