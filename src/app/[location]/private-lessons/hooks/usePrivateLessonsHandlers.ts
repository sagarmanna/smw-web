import * as React from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { toast } from "sonner";
import { format } from "date-fns";
import { startOfDay, isBefore } from "date-fns";
import { parseDateString } from "@/utils/dateUtils";
import { PrivateLessonRow } from "../privateLessonsListing.api";
import { editClassroom } from "../actionApi/editClassroom.api";
import { editDuration } from "../actionApi/editDuration.api";
import { deleteLessonsApi } from "../actionApi/deleteLessons.api";
import { applyDiscount } from "../actionApi/discount.api";
import { editOnlineType } from "../actionApi/editOnlineType.api";
import { generateInvoice } from "../actionApi/generateInvoice.api";
import {
  substituteTeacherForLessons,
  updateLessonsPrices,
  updateLessonsDuration,
  updateLessonsClassroom,
  updateLessonsOnlineStatus,
  deleteLessons,
  updateLessonsStatus,
} from "../privateLessonsListing.slice";
import { calculateDiscountedPricesForLessons } from "../utils/discountCalculations";
import type { EmailFormData } from "@/components/EmailModal";
import type { LessonDiscountData } from "../privateLessonsListing.slice";
import { isDev } from "@/utils/env";
import { extractErrorMessage } from "@/utils/api/createCrudApi";

interface UsePrivateLessonsHandlersProps {
  location: string;
  selectedLessons: PrivateLessonRow[];
  hasSelectedLessons: boolean;
  clearSelection: () => void;
  modalState: ReturnType<typeof import("./usePrivateLessonsModals").usePrivateLessonsModals>;
}

export function usePrivateLessonsHandlers({
  location,
  selectedLessons,
  hasSelectedLessons,
  clearSelection,
  modalState,
}: UsePrivateLessonsHandlersProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isDeleteInProgress, setIsDeleteInProgress] = React.useState(false);

  // Click Handlers
  const handleSubstituteTeacherClick = React.useCallback(() => {
    if (!hasSelectedLessons) {
      return;
    }

    const uniqueTeachers = new Set(selectedLessons.map((lesson) => lesson.teacher));

    if (uniqueTeachers.size > 1) {
      toast.error("Choose lessons with same teacher");
      return;
    }

    modalState.setIsSubstituteModalOpen(true);
  }, [hasSelectedLessons, selectedLessons, modalState]);

  const handleEditDiscountClick = React.useCallback(() => {
    if (!hasSelectedLessons) {
      return;
    }
    modalState.setIsEditDiscountModalOpen(true);
  }, [hasSelectedLessons, modalState]);

  const handleEditDurationClick = React.useCallback(() => {
    if (!hasSelectedLessons) {
      return;
    }
    modalState.setIsEditDurationModalOpen(true);
  }, [hasSelectedLessons, modalState]);

  const handleEditClassroomClick = React.useCallback(() => {
    if (!hasSelectedLessons) {
      return;
    }

    const today = startOfDay(new Date());

    const hasInvalidDate = selectedLessons.some((lesson) => {
      const datePart = lesson.date.split(" @ ")[0].trim();
      const lessonDate = parseDateString(datePart);

      if (!lessonDate) {
        return false;
      }

      const lessonDateStart = startOfDay(lessonDate);
      return isBefore(lessonDateStart, today);
    });

    if (hasInvalidDate) {
      toast.error("One of the selected lessons is invoiced. Invoiced lessons can't be edited.");
      return;
    }

    modalState.setIsEditClassroomModalOpen(true);
  }, [hasSelectedLessons, selectedLessons, modalState]);

  const handleEditOnlineTypeClick = React.useCallback(() => {
    if (!hasSelectedLessons) {
      return;
    }
    modalState.setIsEditOnlineTypeModalOpen(true);
  }, [hasSelectedLessons, modalState]);

  const handleDeleteClick = React.useCallback(() => {
    if (!hasSelectedLessons) {
      return;
    }
    modalState.setIsDeleteModalOpen(true);
  }, [hasSelectedLessons, modalState]);

  const handleEmailSelectedClick = React.useCallback(() => {
    if (!hasSelectedLessons) {
      return;
    }
    modalState.setIsEmailModalOpen(true);
  }, [hasSelectedLessons, modalState]);

  const handleUnscheduleClick = React.useCallback(() => {
    if (!hasSelectedLessons) {
      return;
    }
    modalState.setIsUnscheduleConfirmModalOpen(true);
  }, [hasSelectedLessons, modalState]);

  const handleBulkRescheduleClick = React.useCallback(() => {
    if (!hasSelectedLessons) {
      return;
    }
    modalState.setIsBulkRescheduleModalOpen(true);
  }, [hasSelectedLessons, modalState]);

  const handleGenerateInvoiceClick = React.useCallback(async () => {
    if (!hasSelectedLessons) {
      return;
    }
    const lessonIds = selectedLessons.map((lesson) => lesson.id);
    try {
      const response = await generateInvoice(location, { lessonIds });
      toast.success(
        typeof response.message === "string" && response.message.trim() !== ""
          ? response.message
          : "Invoice generated successfully"
      );
      clearSelection();
    } catch (error) {
      const message = extractErrorMessage(error, "Failed to generate invoice");
      toast.error(message);
    }
  }, [location, hasSelectedLessons, selectedLessons, clearSelection]);

  const handleRowClick = React.useCallback((row: PrivateLessonRow) => {
    if (!isDev()){
      router.push(`${process.env.NEXT_PUBLIC_LEGACY_URL}/${location}/lesson/view?id=${row.id}`);
    }else{
      router.push(`/${location}/private-lessons/${row.id}`);
    }
  }, [location, router]);

  // Save Handlers
  const handleSendEmail = React.useCallback((emailData: EmailFormData) => {
    // TODO: Replace with real API call

    modalState.setIsEmailModalOpen(false);
    clearSelection();

    toast.success("Mail has been sent successfully");
  }, [clearSelection, modalState]);

  const handleUnscheduleConfirm = React.useCallback(() => {
    modalState.setIsUnscheduleConfirmModalOpen(false);
    modalState.setIsUnscheduleReasonModalOpen(true);
  }, [modalState]);

  const handleUnscheduleReasonSave = React.useCallback((reason: string) => {
    const lessonIds = selectedLessons.map((lesson) => lesson.id);

    dispatch(updateLessonsStatus({ lessonIds, status: "Unscheduled" }));

    // TODO: Replace with real API call

    clearSelection();
    modalState.setIsUnscheduleReasonModalOpen(false);

    toast.success(
      `${lessonIds.length} lesson${lessonIds.length !== 1 ? "s" : ""} unscheduled successfully`
    );
  }, [selectedLessons, dispatch, clearSelection, modalState]);

  const handleBulkRescheduleSave = React.useCallback((selectedDate: Date) => {
    const lessonIds = selectedLessons.map((lesson) => lesson.id);

    const formattedNewDate = format(selectedDate, "MMM dd, yyyy");

    const dateMap = new Map<number, string>();
    selectedLessons.forEach((lesson) => {
      const timePart = lesson.date.includes(" @ ")
        ? lesson.date.split(" @ ")[1]
        : "";

      const newDateString = timePart
        ? `${formattedNewDate} @ ${timePart}`
        : formattedNewDate;

      dateMap.set(lesson.id, newDateString);
    });

    dispatch(updateLessonsStatus({
      lessonIds,
      status: "Rescheduled",
      dateMap
    }));

    // TODO: Replace with real API call

    clearSelection();
    modalState.setIsBulkRescheduleModalOpen(false);

    toast.success(
      `${lessonIds.length} lesson${lessonIds.length !== 1 ? "s" : ""} rescheduled successfully`
    );
  }, [selectedLessons, dispatch, clearSelection, modalState]);

  const handleDeleteConfirm = React.useCallback(async () => {
    const lessonIds = selectedLessons.map((lesson) => lesson.id);
    if (lessonIds.length === 0) return;

    setIsDeleteInProgress(true);
    try {
      const response = await deleteLessonsApi(location, { lessonIds });

      dispatch(deleteLessons({ lessonIds }));
      clearSelection();
      modalState.setIsDeleteModalOpen(false);
      toast.success(
        typeof response.message === "string" && response.message.trim() !== ""
          ? response.message
          : "Lesson has been deleted successfully!"
      );
    } catch (error) {
      const message = extractErrorMessage(error, "Failed to delete lessons");
      toast.error(message);
    } finally {
      setIsDeleteInProgress(false);
    }
  }, [location, selectedLessons, dispatch, clearSelection, modalState]);

  const handleSubstituteSave = React.useCallback(
    (teacherId: string, teacherName: string, lessonIds: number[]) => {
      dispatch(substituteTeacherForLessons({ lessonIds, teacher: teacherName }));

      // TODO: Replace with real API call using teacherId + lessonIds

      clearSelection();
      modalState.setIsSubstituteModalOpen(false);

      toast.success("Lessons are substituted to the selected teachers");
    },
    [dispatch, clearSelection, modalState]
  );

  const handleEditDiscountSave = React.useCallback(
    async (data: LessonDiscountData, lessonIds: number[]) => {
      try {
        const payload = {
          lessonIds,
          customerDiscount: Number(data.customerDiscountPercent) || 0,
          paymentFrequencyDiscount: Number(data.paymentFrequencyDiscountPercent) || 0,
          multiEnrolmentDiscount: Number(data.multipleEnrollmentDiscountAmount) || 0,
          lineItemDiscount: Number(data.lineItemDiscountValue) || 0,
          lineItemDiscountValueType: data.lineItemDiscountType === "percentage" ? 1 : 0,
        };
        const response = await applyDiscount(location, payload);

        const updatedLessonIds = response.data?.lessonIds ?? [];
        if (updatedLessonIds.length > 0) {
          const lessonsUpdated = selectedLessons.filter((l) =>
            updatedLessonIds.includes(l.id)
          );
          const newPrices = calculateDiscountedPricesForLessons(lessonsUpdated, data);
          dispatch(
            updateLessonsPrices({
              lessonIds: updatedLessonIds,
              newPrices,
              discountData: data,
            })
          );
        }

        clearSelection();
        modalState.setIsEditDiscountModalOpen(false);
        toast.success(
          typeof response.message === "string" && response.message.trim() !== ""
            ? response.message
            : "Discount updated successfully"
        );
        return true;
      } catch (error) {
        const message = extractErrorMessage(error, "Failed to update discount");
        toast.error(message);
        return false;
      }
    },
    [location, selectedLessons, dispatch, clearSelection, modalState]
  );

  /** Converts UI duration (HH:mm) to API format (HH:MM:SS) */
  const toApiDuration = React.useCallback((duration: string) => {
    const trimmed = duration.trim();
    const parts = trimmed.split(":");
    if (parts.length === 2) return `${trimmed}:00`;
    return trimmed;
  }, []);

  const handleEditDurationSave = React.useCallback(
    async (duration: string, lessonIds: number[]) => {
      try {
        const apiDuration = toApiDuration(duration);
        const response = await editDuration(location, {
          lessonIds,
          duration: apiDuration,
        });

        const updatedLessonIds = response.data?.updatedLessonIds ?? [];
        if (updatedLessonIds.length > 0) {
          dispatch(
            updateLessonsDuration({
              lessonIds: updatedLessonIds,
              duration,
            })
          );
        }

        clearSelection();
        modalState.setIsEditDurationModalOpen(false);
        toast.success(
          typeof response.message === "string" && response.message.trim() !== ""
            ? response.message
            : "Lesson duration edited successfully"
        );
        return true;
      } catch (error) {
        const message = extractErrorMessage(error, "Failed to edit duration");
        toast.error(message);
        return false;
      }
    },
    [location, toApiDuration, dispatch, clearSelection, modalState]
  );

  const handleEditClassroomSave = React.useCallback(
    async (classroomId: string, classroomName: string, lessonIds: number[]) => {
      try {
        const response = await editClassroom(location, {
          lessonIds,
          classroomId: Number(classroomId),
        });

        const updatedLessonIds = response.data?.updatedLessonIds ?? [];
        if (updatedLessonIds.length > 0) {
          dispatch(
            updateLessonsClassroom({
              lessonIds: updatedLessonIds,
              classroomId,
              classroomName,
            })
          );
        }

        clearSelection();
        modalState.setIsEditClassroomModalOpen(false);
        toast.success(
          typeof response.message === "string" && response.message.trim() !== ""
            ? response.message
            : "Lesson classroom edited successfully"
        );
        return true;
      } catch (error) {
        const message = extractErrorMessage(error, "Failed to edit classroom");
        toast.error(message);
        return false;
      }
    },
    [location, dispatch, clearSelection, modalState]
  );

  const handleEditOnlineTypeSave = React.useCallback(
    async (onlineStatus: string, lessonIds: number[]) => {
      try {
        const online: 0 | 1 = onlineStatus === "Yes" ? 1 : 0;
        const response = await editOnlineType(location, { lessonIds, online });

        const updatedLessonIds = response.data?.lessonIds ?? [];
        if (updatedLessonIds.length > 0) {
          dispatch(
            updateLessonsOnlineStatus({
              lessonIds: updatedLessonIds,
              onlineStatus,
            })
          );
        }

        clearSelection();
        modalState.setIsEditOnlineTypeModalOpen(false);
        toast.success(
          typeof response.message === "string" && response.message.trim() !== ""
            ? response.message
            : onlineStatus === "Yes"
              ? "Private Lesson Edited To Make Online Class Successfully"
              : "Private Lesson Edited To Make In Class Successfully"
        );
        return true;
      } catch (error) {
        const message = extractErrorMessage(error, "Failed to edit online type");
        toast.error(message);
        return false;
      }
    },
    [location, dispatch, clearSelection, modalState]
  );

  return {
    handleSubstituteTeacherClick,
    handleEditDiscountClick,
    handleEditDurationClick,
    handleEditClassroomClick,
    handleEditOnlineTypeClick,
    handleDeleteClick,
    handleEmailSelectedClick,
    handleUnscheduleClick,
    handleBulkRescheduleClick,
    handleGenerateInvoiceClick,
    handleRowClick,
    handleSubstituteSave,
    handleEditDiscountSave,
    handleEditDurationSave,
    handleEditClassroomSave,
    handleEditOnlineTypeSave,
    handleDeleteConfirm,
    handleSendEmail,
    handleUnscheduleConfirm,
    handleUnscheduleReasonSave,
    handleBulkRescheduleSave,
    isDeleteInProgress,
  };
}

