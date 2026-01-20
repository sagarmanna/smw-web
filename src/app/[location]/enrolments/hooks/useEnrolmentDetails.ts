"use client";

import * as React from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { 
  fetchEnrolment,
  fetchEnrolmentHistory,
  fetchEnrolmentLessons,
  clearCache,
  updateEnrolment,
  adjustEndDate,
  adjustGroupEndDate,
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
  lessonsPagination: { page: number; limit: number; total: number; totalPages: number } | null;
  lessonsLoading: boolean;
  lessonsError: string | null;
  history: EnrolmentHistory[];
  historyPagination: { page: number; limit: number; total: number; totalPages: number } | null;
  historyLoading: boolean;
  historyError: string | null;
  refresh: () => Promise<void>;
  forceRefresh: () => Promise<void>;
  fetchHistory: (page?: number) => Promise<void>;
  fetchLessons: (page?: number, limit?: number) => Promise<void>;
  saveDetails: (details: Partial<EnrolmentDetails>) => Promise<boolean>;
  savingDetails: boolean;
  adjustScheduleEndDate: (endDate: string, enrolmentType?: "private" | "group") => Promise<boolean>;
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
  
  // Get history data from Redux store (separate from enrolmentInfo)
  const historyData = useAppSelector((state) => state.enrolment?.historyData || []);
  const historyPagination = useAppSelector((state) => state.enrolment?.historyPagination);
  const historyLoading = useAppSelector((state) => state.enrolment?.historyLoading || false);
  const historyError = useAppSelector((state) => state.enrolment?.historyError);
  
  // Get lessons data from Redux store (separate from enrolmentInfo, only for group enrolments)
  const lessonsData = useAppSelector((state) => state.enrolment?.lessonsData || []);
  const lessonsPagination = useAppSelector((state) => state.enrolment?.lessonsPagination);
  const lessonsLoading = useAppSelector((state) => state.enrolment?.lessonsLoading || false);
  const lessonsError = useAppSelector((state) => state.enrolment?.lessonsError);

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

  // Determine enrolment type to decide which lessons data to use
  const enrolmentType = React.useMemo(() => {
    return enrolmentInfo?.details?.type || null;
  }, [enrolmentInfo]);

  // Use paginated lessons data for group enrolments, enrolmentInfo lessons for private enrolments
  const lessons: EnrolmentLesson[] = React.useMemo(() => {
    // For group enrolments, use paginated lessons data
    if (enrolmentType === 'group' && lessonsData.length > 0) {
      return lessonsData;
    }
    // For private enrolments, always use lessons from enrolmentInfo (all lessons from main fetch)
    if (enrolmentType === 'private') {
      return enrolmentInfo?.lessons || [];
    }
    // Fallback: if type is unknown, prefer enrolmentInfo lessons (for initial load or edge cases)
    return enrolmentInfo?.lessons || [];
  }, [lessonsData, enrolmentInfo, enrolmentType]);

  const history: EnrolmentHistory[] = React.useMemo(() => {
    return historyData;
  }, [historyData]);

  const refresh = React.useCallback(async () => {
    dispatch(fetchEnrolment({ location, enrolmentId }));
  }, [dispatch, location, enrolmentId]);

  // Force refresh by clearing cache first
  const forceRefresh = React.useCallback(async () => {
    dispatch(clearCache());
    await dispatch(fetchEnrolment({ location, enrolmentId })).unwrap();
  }, [dispatch, location, enrolmentId]);

  // Fetch history with pagination
  const fetchHistory = React.useCallback(
    async (page: number = 1): Promise<void> => {
      try {
        await dispatch(
          fetchEnrolmentHistory({
            location,
            enrolmentId,
            page,
          })
        ).unwrap();
      } catch (error) {
        console.error("Failed to fetch history:", error);
        // Error is already handled in Redux state
      }
    },
    [dispatch, location, enrolmentId]
  );

  // Fetch lessons with pagination (only for group enrolments)
  const fetchLessons = React.useCallback(
    async (page: number = 1, limit: number = 10): Promise<void> => {
      try {
        await dispatch(
          fetchEnrolmentLessons({
            location,
            enrolmentId,
            page,
            limit,
          })
        ).unwrap();
      } catch (error) {
        console.error("Failed to fetch lessons:", error);
        // Error is already handled in Redux state
      }
    },
    [dispatch, location, enrolmentId]
  );

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
        
        // Force refresh enrolment data to get updated rates and other details from server
        // This clears cache and fetches fresh data
        await forceRefresh();
        
        toast.success("Enrolment details updated successfully");
        return true;
      } catch (error) {
        console.error("Failed to save enrolment details:", error);
        toast.error(error instanceof Error ? error.message : "Failed to update enrolment details. Please try again.");
        return false;
      }
    },
    [dispatch, location, enrolmentId, forceRefresh]
  );

  const adjustScheduleEndDate = React.useCallback(
    async (endDate: string, enrolmentType?: "private" | "group"): Promise<boolean> => {
      try {
        // Use appropriate thunk based on enrolment type
        if (enrolmentType === "group") {
          await dispatch(
            adjustGroupEndDate({
              location,
              enrolmentId,
              endDate,
            })
          ).unwrap();
        } else {
          await dispatch(
            adjustEndDate({
              location,
              enrolmentId,
              endDate,
            })
          ).unwrap();
        }
        
        // Force refresh enrolment data to show all updated data (schedule, lessons, etc.)
        // This clears cache and fetches fresh data
        await forceRefresh();
        
        // For group enrolments, also refresh the lessons list separately
        if (enrolmentType === "group") {
          await fetchLessons(1, 10);
        }
        
        toast.success("End date adjusted successfully");
        return true;
      } catch (error) {
        console.error("Failed to adjust end date:", error);
        toast.error(error instanceof Error ? error.message : "Failed to adjust end date. Please try again.");
        return false;
      }
    },
    [dispatch, location, enrolmentId, forceRefresh, fetchLessons]
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
        // Get enrolment type to determine which API endpoint to use
        const currentEnrolmentType = enrolmentInfo?.details?.type || 'private';
        
        await dispatch(
          updateDiscounts({
            location,
            enrolmentId,
            data: discounts,
            enrolmentType: currentEnrolmentType as 'private' | 'group',
          })
        ).unwrap();
        
        // Force refresh enrolment data to get updated lesson prices after discount changes
        // This clears cache and fetches fresh data including lessons with updated prices
        await forceRefresh();
        
        // For group enrolments, also refresh the lessons list separately
        if (currentEnrolmentType === "group") {
          await fetchLessons(1, 10);
        }
        
        toast.success("Discounts updated successfully");
        return true;
      } catch (error) {
        console.error("Failed to save discounts:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to update discounts. Please try again.";
        toast.error(errorMessage);
        return false;
      }
    },
    [dispatch, location, enrolmentId, forceRefresh, fetchLessons, enrolmentInfo]
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
        
        // Force refresh enrolment data to get updated lessons with new due dates
        // This clears cache and fetches fresh data including lessons
        await forceRefresh();
        
        toast.success("Payment frequency updated successfully");
        return true;
      } catch (error) {
        console.error("Failed to save payment frequency:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to update payment frequency. Please try again.";
        toast.error(errorMessage);
        return false;
      }
    },
    [dispatch, location, enrolmentId, forceRefresh]
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
    lessonsPagination,
    lessonsLoading,
    lessonsError,
    history,
    historyPagination,
    historyLoading,
    historyError,
    refresh,
    forceRefresh,
    fetchHistory,
    fetchLessons,
    saveDetails,
    savingDetails,
    adjustScheduleEndDate,
    changeSchedulePermanently,
    saveDiscounts,
    savePaymentFrequency,
  };
}

