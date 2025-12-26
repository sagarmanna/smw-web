"use client";

import * as React from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { 
  fetchEnrolment,
  clearCache,
  updateEnrolment,
  adjustEndDate,
  changeSchedulePermanently as changeSchedulePermanentlyThunk,
  updateDiscounts,
  updatePaymentFrequency as updatePaymentFrequencyThunk,
} from "../[id]/enrolment-details.slice";
import { toast } from "sonner";
import {
  EnrolmentDetails,
  EnrolmentDiscounts,
  EnrolmentPaymentFrequency,
  EnrolmentSchedule,
  EnrolmentScheduleHistory,
  EnrolmentLesson,
  EnrolmentHistory,
} from "../types";

type EnrolmentDetailsHookReturn = {
  loading: boolean;
  error: string | null;
  details: EnrolmentDetails | null;
  discounts: EnrolmentDiscounts | null;
  paymentFrequency: EnrolmentPaymentFrequency | null;
  schedule: EnrolmentSchedule | null;
  scheduleHistory: EnrolmentScheduleHistory[];
  lessons: EnrolmentLesson[];
  history: EnrolmentHistory[];
  refresh: () => Promise<void>;
  forceRefresh: () => Promise<void>;
  saveDetails: (details: Partial<EnrolmentDetails>) => Promise<boolean>;
  savingDetails: boolean;
  adjustScheduleEndDate: (endDate: string) => Promise<boolean>;
  changeSchedulePermanently: (startingDate: string) => Promise<boolean>;
  saveDiscounts: (discounts: Partial<EnrolmentDiscounts>) => Promise<boolean>;
  savePaymentFrequency: (data: { paymentFrequency: string; effectiveDate: string }) => Promise<boolean>;
};

export function useEnrolmentDetails(
  location: string,
  enrolmentId: string
): EnrolmentDetailsHookReturn {
  const dispatch = useAppDispatch();
  
  // Get enrolment data from Redux store
  const enrolmentInfo = useAppSelector((state) => state.enrolment?.enrolmentInfo);
  const loading = useAppSelector((state) => state.enrolment?.isLoading || false);
  const error = useAppSelector((state) => state.enrolment?.error);
  const savingDetails = useAppSelector((state) => state.enrolment?.isSaving || false);

  // Transform Redux state to hook return format
  const details: EnrolmentDetails | null = React.useMemo(() => {
    if (!enrolmentInfo?.details) return null;
    return enrolmentInfo.details;
  }, [enrolmentInfo]);

  const discounts: EnrolmentDiscounts | null = React.useMemo(() => {
    if (!enrolmentInfo?.discounts) return null;
    return enrolmentInfo.discounts;
  }, [enrolmentInfo]);

  const paymentFrequency: EnrolmentPaymentFrequency | null = React.useMemo(() => {
    if (!enrolmentInfo?.paymentFrequency) return null;
    return enrolmentInfo.paymentFrequency;
  }, [enrolmentInfo]);

  const schedule: EnrolmentSchedule | null = React.useMemo(() => {
    if (!enrolmentInfo?.schedule) return null;
    return enrolmentInfo.schedule;
  }, [enrolmentInfo]);

  const scheduleHistory: EnrolmentScheduleHistory[] = React.useMemo(() => {
    return enrolmentInfo?.scheduleHistory || [];
  }, [enrolmentInfo]);

  const lessons: EnrolmentLesson[] = React.useMemo(() => {
    return enrolmentInfo?.lessons || [];
  }, [enrolmentInfo]);

  const history: EnrolmentHistory[] = React.useMemo(() => {
    return enrolmentInfo?.history || [];
  }, [enrolmentInfo]);

  const refresh = React.useCallback(async () => {
    dispatch(fetchEnrolment({ location, enrolmentId }));
  }, [dispatch, location, enrolmentId]);

  // Force refresh by clearing cache first
  const forceRefresh = React.useCallback(async () => {
    dispatch(clearCache());
    dispatch(fetchEnrolment({ location, enrolmentId }));
  }, [dispatch, location, enrolmentId]);

  const saveDetails = React.useCallback(
    async (details: Partial<EnrolmentDetails>): Promise<boolean> => {
      try {
        await dispatch(
          updateEnrolment({
            location,
            enrolmentId,
            data: details,
          })
        ).unwrap();
        
        toast.success("Enrolment details updated successfully");
        return true;
      } catch (error) {
        console.error("Failed to save enrolment details:", error);
        toast.error(error instanceof Error ? error.message : "Failed to update enrolment details. Please try again.");
        return false;
      }
    },
    [dispatch, location, enrolmentId]
  );

  const adjustScheduleEndDate = React.useCallback(
    async (endDate: string): Promise<boolean> => {
      try {
        await dispatch(
          adjustEndDate({
            location,
            enrolmentId,
            endDate,
          })
        ).unwrap();
        
        toast.success("End date adjusted successfully");
        return true;
      } catch (error) {
        console.error("Failed to adjust end date:", error);
        toast.error(error instanceof Error ? error.message : "Failed to adjust end date. Please try again.");
        return false;
      }
    },
    [dispatch, location, enrolmentId]
  );

  const changeSchedulePermanently = React.useCallback(
    async (startingDate: string): Promise<boolean> => {
      try {
        await dispatch(
          changeSchedulePermanentlyThunk({
            location,
            enrolmentId,
            startingDate,
          })
        ).unwrap();
        
        toast.success("Schedule changed successfully");
        return true;
      } catch (error) {
        console.error("Failed to change schedule:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to change schedule. Please try again.";
        toast.error(errorMessage);
        return false;
      }
    },
    [dispatch, location, enrolmentId]
  );

  const saveDiscounts = React.useCallback(
    async (discounts: Partial<EnrolmentDiscounts>): Promise<boolean> => {
      try {
        await dispatch(
          updateDiscounts({
            location,
            enrolmentId,
            data: discounts,
          })
        ).unwrap();
        
        toast.success("Discounts updated successfully");
        return true;
      } catch (error) {
        console.error("Failed to save discounts:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to update discounts. Please try again.";
        toast.error(errorMessage);
        return false;
      }
    },
    [dispatch, location, enrolmentId]
  );

  const savePaymentFrequency = React.useCallback(
    async (data: { paymentFrequency: string; effectiveDate: string }): Promise<boolean> => {
      try {
        await dispatch(
          updatePaymentFrequencyThunk({
            location,
            enrolmentId,
            data,
          })
        ).unwrap();
        
        toast.success("Payment frequency updated successfully");
        return true;
      } catch (error) {
        console.error("Failed to save payment frequency:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to update payment frequency. Please try again.";
        toast.error(errorMessage);
        return false;
      }
    },
    [dispatch, location, enrolmentId]
  );

  return {
    loading,
    error,
    details,
    discounts,
    paymentFrequency,
    schedule,
    scheduleHistory,
    lessons,
    history,
    refresh,
    forceRefresh,
    saveDetails,
    savingDetails,
    adjustScheduleEndDate,
    changeSchedulePermanently,
    saveDiscounts,
    savePaymentFrequency,
  };
}

