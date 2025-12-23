import * as React from "react";
import { useAppDispatch } from "@/redux/hooks";
import { toast } from "sonner";
import { format } from "date-fns";
import { startOfDay, isBefore } from "date-fns";
import { parseDateString } from "@/utils/dateUtils";
import { PrivateLessonRow } from "../privateLessonsListing.api";
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
import type { EmailFormData } from "@/app/[location]/customers/components/EmailStatementModal/index";
import type { LessonDiscountData } from "../privateLessonsListing.slice";

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
  const dispatch = useAppDispatch();

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

  const handleGenerateInvoiceClick = React.useCallback(() => {
    if (!hasSelectedLessons) {
      return;
    }
    toast.error("Selected lesson's have not been invoiced");
  }, [hasSelectedLessons]);

  const handleRowClick = React.useCallback((row: PrivateLessonRow) => {
    const legacyBaseUrl = process.env.NEXT_PUBLIC_LEGACY_URL || 'https://dev2.studiomanagerweb.com/admin';
    const url = `${legacyBaseUrl}/${location}/lesson/view?id=${row.id}`;
    window.location.href = url;
  }, [location]);

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

  const handleDeleteConfirm = React.useCallback(() => {
    const lessonIds = selectedLessons.map((lesson) => lesson.id);

    dispatch(deleteLessons({ lessonIds }));

    // TODO: Replace with real API call

    clearSelection();
    modalState.setIsDeleteModalOpen(false);

    toast.success(
      `${lessonIds.length} lesson${lessonIds.length !== 1 ? "s" : ""} deleted successfully`
    );
  }, [selectedLessons, dispatch, clearSelection, modalState]);

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

  const handleEditDiscountSave = React.useCallback((data: LessonDiscountData, lessonIds: number[]) => {
    const newPrices = calculateDiscountedPricesForLessons(selectedLessons, data);

    dispatch(updateLessonsPrices({
      lessonIds,
      newPrices,
      discountData: data
    }));

    // TODO: Replace with real API call

    clearSelection();
    modalState.setIsEditDiscountModalOpen(false);

    toast.success(
      `Discounts applied to ${lessonIds.length} lesson${lessonIds.length !== 1 ? "s" : ""}`
    );
  }, [selectedLessons, dispatch, clearSelection, modalState]);

  const handleEditDurationSave = React.useCallback((duration: string, lessonIds: number[]) => {
    dispatch(updateLessonsDuration({ lessonIds, duration }));

    // TODO: Replace with real API call

    clearSelection();
    modalState.setIsEditDurationModalOpen(false);

    toast.success("Lesson Duration Edited Successfully");
  }, [dispatch, clearSelection, modalState]);

  const handleEditClassroomSave = React.useCallback((classroomId: string, classroomName: string, lessonIds: number[]) => {
    dispatch(updateLessonsClassroom({ lessonIds, classroomId, classroomName }));

    // TODO: Replace with real API call

    clearSelection();
    modalState.setIsEditClassroomModalOpen(false);

    toast.success("Lesson Classroom Edited Successfully");
  }, [dispatch, clearSelection, modalState]);

  const handleEditOnlineTypeSave = React.useCallback((onlineStatus: string, lessonIds: number[]) => {
    dispatch(updateLessonsOnlineStatus({ lessonIds, onlineStatus }));

    // TODO: Replace with real API call

    clearSelection();
    modalState.setIsEditOnlineTypeModalOpen(false);

    const toastMessage = onlineStatus === "Yes"
      ? "Private Lesson Edited To Make Online Class Successfully"
      : "Private Lesson Edited To Make In Class Successfully";
    toast.success(toastMessage);
  }, [dispatch, clearSelection, modalState]);

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
  };
}

