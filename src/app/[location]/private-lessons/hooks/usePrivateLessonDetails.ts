"use client";
import * as React from "react";
import { SortingState } from "@tanstack/react-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchPrivateLesson,
  fetchPrivateLessonHistory,
  fetchPrivateLessonPayments,
  setPaymentsSorting,
  clearCache,
  updatePrivateLesson,
  updateAttendanceThunk,
  updateCostThunk,
  updateDueDateThunk,
  updateDiscountThunk,
  updateTaxThunk,
  updatePriceThunk,
  updateGroupLessonStudentDiscountThunk,
} from "../[id]/private-lesson-details.slice";
import { toast } from "sonner";
import {
  PrivateLessonDetails,
  PrivateLessonPayment,
  PrivateLessonHistory,
  PrivateLessonComment,
} from "../types";

type PrivateLessonDetailsHookReturn = {
  loading: boolean;
  error: string | null;
  details: PrivateLessonDetails | null;
  payments: PrivateLessonPayment[];
  paymentsLoading: boolean;
  paymentsError: string | null;
  paymentsSorting: SortingState;
  setPaymentsSortingHandler: (sorting: SortingState) => void;
  comments: PrivateLessonComment[];
  history: PrivateLessonHistory[];
  historyPagination: { page: number; limit: number; total: number; totalPages: number } | null;
  historyLoading: boolean;
  historyError: string | null;
  refresh: () => Promise<void>;
  forceRefresh: () => Promise<void>;
  fetchHistory: (page?: number) => Promise<void>;
  saveDetails: (details: Partial<PrivateLessonDetails>) => Promise<boolean>;
  savingDetails: boolean;
  saveAttendance: (present: boolean) => Promise<boolean>;
  saveCost: (data: { costPerHour?: string; cost?: string; price?: string }) => Promise<boolean>;
  saveDueDate: (dueDate: string) => Promise<boolean>;
  saveDiscount: (discountFields: {
    customerDiscount: number;
    paymentFrequencyDiscount: number;
    multiEnrolmentDiscount: number;
    lineItemDiscount: number;
    lineItemDiscountValueType: number;
  }) => Promise<boolean>;
  saveTax: (tax: string) => Promise<boolean>;
  savePrice: (lessonRatePerHour: string) => Promise<boolean>;
  saveGroupStudentDiscount: (studentId: number, discount: string) => Promise<boolean>;
};

export function usePrivateLessonDetails(
  location: string,
  privateLessonId: string
): PrivateLessonDetailsHookReturn {
  const dispatch = useAppDispatch();

  // Get private lesson data from Redux store
  const privateLessonInfo = useAppSelector((state) => state.privateLesson?.privateLessonInfo);
  const loading = useAppSelector((state) => state.privateLesson?.isLoading || false);
  const error = useAppSelector((state) => state.privateLesson?.error);
  const savingDetails = useAppSelector((state) => state.privateLesson?.isSaving || false);

  // Get history data from Redux store (separate from privateLessonInfo)
  const historyData = useAppSelector((state) => state.privateLesson?.historyData || []);
  const historyPagination = useAppSelector((state) => state.privateLesson?.historyPagination);
  const historyLoading = useAppSelector((state) => state.privateLesson?.historyLoading || false);
  const historyError = useAppSelector((state) => state.privateLesson?.historyError);

  // Get payments data from Redux store (separate from privateLessonInfo)
  const paymentsData = useAppSelector((state) => state.privateLesson?.paymentsData || []);
  const paymentsLoading = useAppSelector((state) => state.privateLesson?.paymentsLoading || false);
  const paymentsError = useAppSelector((state) => state.privateLesson?.paymentsError);
  const paymentsSortDir = useAppSelector((state) => state.privateLesson?.paymentsSortDir || "desc");

  // Fetch payments on mount — keyed to prevent StrictMode double-dispatch
  const paymentsFetchKeyRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!location || !privateLessonId) return;
    const key = `${location}-${privateLessonId}`;
    if (paymentsFetchKeyRef.current === key) return;
    paymentsFetchKeyRef.current = key;
    dispatch(fetchPrivateLessonPayments({ location, privateLessonId }));
  }, [location, privateLessonId, dispatch]);

  // Derive TanStack SortingState from Redux sort direction
  const paymentsSorting: SortingState = React.useMemo(
    () => [{ id: "amount", desc: paymentsSortDir === "desc" }],
    [paymentsSortDir]
  );

  // Transform Redux state to hook return format
  const details: PrivateLessonDetails | null = React.useMemo(() => {
    if (!privateLessonInfo?.details) return null;
    return privateLessonInfo.details;
  }, [privateLessonInfo]);

  const payments: PrivateLessonPayment[] = React.useMemo(() => {
    return paymentsData;
  }, [paymentsData]);

  const history: PrivateLessonHistory[] = React.useMemo(() => {
    return historyData;
  }, [historyData]);

  // Get comments from Redux store
  const comments: PrivateLessonComment[] = React.useMemo(() => {
    return privateLessonInfo?.comments || [];
  }, [privateLessonInfo]);

  // Sort change handler
  const setPaymentsSortingHandler = React.useCallback(
    (newSorting: SortingState) => {
      const desc = newSorting[0]?.desc ?? true;
      const sortDir = desc ? "desc" : "asc";
      dispatch(setPaymentsSorting({ sortDir }));
      dispatch(fetchPrivateLessonPayments({ location, privateLessonId, sortDir }));
    },
    [dispatch, location, privateLessonId]
  );

  const refresh = React.useCallback(async () => {
    dispatch(fetchPrivateLesson({ location, privateLessonId }));
  }, [dispatch, location, privateLessonId]);

  // Force refresh by clearing cache first
  const forceRefresh = React.useCallback(async () => {
    dispatch(clearCache());
    dispatch(fetchPrivateLesson({ location, privateLessonId }));
  }, [dispatch, location, privateLessonId]);

  // Fetch history with pagination
  const fetchHistory = React.useCallback(
    async (page: number = 1): Promise<void> => {
      try {
        await dispatch(
          fetchPrivateLessonHistory({
            location,
            privateLessonId,
            page,
          })
        ).unwrap();
      } catch (error) {
        console.error("Failed to fetch history:", error);
      }
    },
    [dispatch, location, privateLessonId]
  );

  // Save general lesson details
  const saveDetails = React.useCallback(
    async (detailsToSave: Partial<PrivateLessonDetails>): Promise<boolean> => {
      try {
        await dispatch(
          updatePrivateLesson({
            location,
            privateLessonId,
            data: detailsToSave,
          })
        ).unwrap();
        toast.success("Details updated successfully");
        return true;
      } catch (error) {
        console.error("Failed to save details:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to update details. Please try again."
        );
        return false;
      }
    },
    [dispatch, location, privateLessonId]
  );

  const saveAttendance = React.useCallback(
    async (present: boolean): Promise<boolean> => {
      try {
        await dispatch(
          updateAttendanceThunk({
            location,
            privateLessonId,
            present,
          })
        ).unwrap();
        toast.success("Attendance updated successfully");
        return true;
      } catch (error) {
        console.error("Failed to save attendance:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to update attendance. Please try again."
        );
        return false;
      }
    },
    [dispatch, location, privateLessonId]
  );

  const saveCost = React.useCallback(
    async (data: { costPerHour?: string; cost?: string; price?: string }): Promise<boolean> => {
      try {
        await dispatch(
          updateCostThunk({
            location,
            privateLessonId,
            data,
          })
        ).unwrap();
        toast.success("Cost updated successfully");
        return true;
      } catch (error) {
        console.error("Failed to save cost:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to update cost. Please try again."
        );
        return false;
      }
    },
    [dispatch, location, privateLessonId]
  );

  const saveDueDate = React.useCallback(
    async (dueDate: string): Promise<boolean> => {
      try {
        await dispatch(
          updateDueDateThunk({
            location,
            privateLessonId,
            dueDate,
          })
        ).unwrap();
        toast.success("Due date updated successfully");
        return true;
      } catch (error) {
        console.error("Failed to save due date:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to update due date. Please try again."
        );
        return false;
      }
    },
    [dispatch, location, privateLessonId]
  );

  const saveDiscount = React.useCallback(
    async (discountFields: {
      customerDiscount: number;
      paymentFrequencyDiscount: number;
      multiEnrolmentDiscount: number;
      lineItemDiscount: number;
      lineItemDiscountValueType: number;
    }): Promise<boolean> => {
      try {
        const lessonIdNum = Number(privateLessonId);
        if (!lessonIdNum || isNaN(lessonIdNum)) {
          toast.error("Invalid lesson ID");
          return false;
        }

        const payload = {
          lessonIds: [lessonIdNum],
          ...discountFields,
        };

        await dispatch(
          updateDiscountThunk({
            location,
            payload,
          })
        ).unwrap();
        // Refetch lesson details to get updated totals and avoid NaN
        await dispatch(fetchPrivateLesson({ location, privateLessonId }));
        toast.success("Discount updated successfully");
        return true;
      } catch (error) {
        console.error("Failed to save discount:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to update discount. Please try again."
        );
        return false;
      }
    },
    [dispatch, location, privateLessonId]
  );

  const saveGroupStudentDiscount = React.useCallback(
    async (studentId: number, discount: string): Promise<boolean> => {
      try {
        await dispatch(
          updateGroupLessonStudentDiscountThunk({
            location,
            lessonId: privateLessonId,
            studentId,
            discount,
          })
        ).unwrap();
        toast.success("Student discount updated successfully");
        return true;
      } catch (error) {
        console.error("Failed to save student discount:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to update student discount. Please try again."
        );
        return false;
      }
    },
    [dispatch, location, privateLessonId]
  );

  const savePrice = React.useCallback(
    async (lessonRatePerHour: string): Promise<boolean> => {
      try {
        const result = await dispatch(
          updatePriceThunk({
            location,
            privateLessonId,
            lessonRatePerHour,
          })
        ).unwrap();
        toast.success(
          typeof result.message === "string" && result.message.trim() !== ""
            ? result.message
            : "Price updated successfully"
        );
        return true;
      } catch (error) {
        console.error("Failed to save price:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to update price. Please try again."
        );
        return false;
      }
    },
    [dispatch, location, privateLessonId]
  );

  const saveTax = React.useCallback(
    async (tax: string): Promise<boolean> => {
      try {
        await dispatch(
          updateTaxThunk({
            location,
            privateLessonId,
            tax,
          })
        ).unwrap();
        toast.success("Tax updated successfully");
        return true;
      } catch (error) {
        console.error("Failed to save tax:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to update tax. Please try again."
        );
        return false;
      }
    },
    [dispatch, location, privateLessonId]
  );

  return {
    loading,
    error,
    details,
    payments,
    paymentsLoading,
    paymentsError,
    paymentsSorting,
    setPaymentsSortingHandler,
    comments,
    history,
    historyPagination,
    historyLoading,
    historyError,
    refresh,
    forceRefresh,
    fetchHistory,
    saveDetails,
    savingDetails,
    saveAttendance,
    saveCost,
    saveDueDate,
    saveDiscount,
    saveTax,
    savePrice,
    saveGroupStudentDiscount,
  };
}