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
import { unscheduleLessons } from "../actionApi/unschedule.api";
import { bulkReschedule } from "../actionApi/bulkReschedule.api";
import {
  substituteLesson,
  confirmTeacherSubstitute,
  type SubstituteLessonItem,
  type SubstituteLessonResponse,
} from "../actionApi/teacherSubstitute.api";
import {
  updateLessonsPrices,
  updateLessonsDuration,
  updateLessonsClassroom,
  updateLessonsOnlineStatus,
  deleteLessons,
  updateLessonsStatus,
  bulkRescheduleLessons,
  applyTeacherSubstituteResult,
} from "../privateLessonsListing.slice";
import type { EmailFormData } from "@/components/EmailModal";
import type { LessonDiscountData } from "../privateLessonsListing.slice";
import { extractErrorMessage } from "@/utils/api/createCrudApi";
import {
  getEmailMultiCustomer,
  sendEmailMultiCustomer,
} from "../actionApi/emailMultiCustomer.api";

function mapSubstituteLessonsToRows(lessons: SubstituteLessonItem[]): PrivateLessonRow[] {
  const statusMap: Record<number, string> = {
    0: "Unscheduled",
    1: "Scheduled",
    2: "Scheduled",
    3: "Completed",
    4: "Cancelled",
    5: "Rescheduled",
  };
  return lessons.map((l) => ({
    id: l.id,
    date: l.date,
    student: l.studentName ?? "",
    program: l.programName ?? "",
    teacher: l.teacherName ?? "",
    duration: l.duration ?? "",
    online: "",
    status: statusMap[l.status] ?? "Scheduled",
    payment: "",
    price: "",
    classroom: undefined,
  }));
}

interface UsePrivateLessonsHandlersProps {
  location: string;
  selectedLessons: PrivateLessonRow[];
  hasSelectedLessons: boolean;
  clearSelection: () => void;
  modalState: ReturnType<typeof import("./usePrivateLessonsModals").usePrivateLessonsModals>;
  refetchList?: () => Promise<void> | void;
}

export function usePrivateLessonsHandlers({
  location,
  selectedLessons,
  hasSelectedLessons,
  clearSelection,
  modalState,
  refetchList,
}: UsePrivateLessonsHandlersProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isDeleteInProgress, setIsDeleteInProgress] = React.useState(false);

  const refetchAfterMutation = React.useCallback(async () => {
    if (!refetchList) return;
    try {
      await refetchList();
    } catch (error) {
      console.error("Failed to refetch private lessons list:", error);
    }
  }, [refetchList]);

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

  const handleEmailSelectedClick = React.useCallback(async () => {
    if (!hasSelectedLessons || selectedLessons.length === 0) return;
    const lessonIds = selectedLessons.map((l) => l.id);
    try {
      const response = await getEmailMultiCustomer(location, lessonIds);
      const emails = response.data?.body?.emails ?? [];
      const subject = response.data?.body?.subject ?? "Message from Arcadia Academy of Music";
      modalState.setEmailModalInitialData({ emails, subject });
      modalState.setIsEmailModalOpen(true);
    } catch (error) {
      const message = extractErrorMessage(error, "Failed to load email recipients");
      toast.error(message);
    }
  }, [hasSelectedLessons, selectedLessons, location, modalState]);

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
      await refetchAfterMutation();
    } catch (error) {
      const message = extractErrorMessage(error, "Failed to generate invoice");
      toast.error(message);
    }
  }, [location, hasSelectedLessons, selectedLessons, clearSelection, refetchAfterMutation]);

  const handleRowClick = React.useCallback((row: PrivateLessonRow) => {
      router.push(`/${location}/private-lessons/${row.id}`);
  }, [location, router]);

  // Save Handlers
  const handleSendEmail = React.useCallback(async (emailData: EmailFormData) => {
    const lessonIds = selectedLessons.map((lesson) => lesson.id);
    if (lessonIds.length === 0) {
      toast.error("No lessons selected");
      return;
    }

    try {
      const response = await sendEmailMultiCustomer(location, {
        lessonIds,
        to: emailData.recipients,
        subject: emailData.subject,
        content: emailData.content,
      });

      clearSelection();
      modalState.setIsEmailModalOpen(false);
      toast.success(
        typeof response.message === "string" && response.message.trim() !== ""
          ? response.message
          : "Mail has been sent successfully"
      );
    } catch (error) {
      const message = extractErrorMessage(error, "Failed to send email");
      toast.error(message);
    }
  }, [selectedLessons, location, clearSelection, modalState]);

  const handleUnscheduleConfirm = React.useCallback(() => {
    modalState.setIsUnscheduleConfirmModalOpen(false);
    modalState.setIsUnscheduleReasonModalOpen(true);
  }, [modalState]);

  const handleUnscheduleReasonSave = React.useCallback(
    async (reason: string) => {
      const lessonIds = selectedLessons.map((lesson) => lesson.id);
      if (lessonIds.length === 0) return false;

      try {
        const response = await unscheduleLessons(location, { lessonIds, reason });

        const updatedLessonIds = response.data?.lessonIds ?? [];
        if (updatedLessonIds.length > 0) {
          dispatch(
            updateLessonsStatus({
              lessonIds: updatedLessonIds,
              status: "Unscheduled",
            })
          );
        }

        clearSelection();
        modalState.setIsUnscheduleReasonModalOpen(false);
        await refetchAfterMutation();
        toast.success(
          typeof response.message === "string" && response.message.trim() !== ""
            ? response.message
            : "Lessons unscheduled successfully"
        );
        return true;
      } catch (error) {
        const message = extractErrorMessage(error, "Failed to unschedule lessons");
        toast.error(message);
        return false;
      }
    },
    [location, selectedLessons, dispatch, clearSelection, modalState, refetchAfterMutation]
  );

  const handleBulkRescheduleSave = React.useCallback(
    async (selectedDate: Date) => {
      const lessonIds = selectedLessons.map((lesson) => lesson.id);
      if (lessonIds.length === 0) return false;

      const newDateYyyyMmDd = format(selectedDate, "yyyy-MM-dd");
      const formattedNewDate = format(selectedDate, "MMM dd, yyyy");

      try {
        const response = await bulkReschedule(location, {
          lessonIds,
          newDate: newDateYyyyMmDd,
        });

        const rescheduledLessons = response.data?.rescheduledLessons ?? [];
        const dateByOldLessonId: Record<number, string> = {};
        selectedLessons.forEach((lesson) => {
          const timePart = lesson.date.includes(" @ ")
            ? lesson.date.split(" @ ")[1]
            : "";
          dateByOldLessonId[lesson.id] = timePart
            ? `${formattedNewDate} @ ${timePart}`
            : formattedNewDate;
        });

        if (rescheduledLessons.length > 0) {
          dispatch(
            bulkRescheduleLessons({
              rescheduledLessons,
              dateByOldLessonId,
            })
          );
        } else {
          dispatch(
            updateLessonsStatus({
              lessonIds,
              status: "Rescheduled",
              dateMap: new Map(
                lessonIds.map((id) => [id, dateByOldLessonId[id] ?? formattedNewDate])
              ),
            })
          );
        }

        clearSelection();
        modalState.setIsBulkRescheduleModalOpen(false);
        await refetchAfterMutation();
        toast.success(
          typeof response.message === "string" && response.message.trim() !== ""
            ? response.message
            : "Lesson has been rescheduled successfully."
        );
        return true;
      } catch (error) {
        const message = extractErrorMessage(error, "Failed to reschedule lessons");
        toast.error(message);
        return false;
      }
    },
    [location, selectedLessons, dispatch, clearSelection, modalState, refetchAfterMutation]
  );

  const handleDeleteConfirm = React.useCallback(async () => {
    const lessonIds = selectedLessons.map((lesson) => lesson.id);
    if (lessonIds.length === 0) return;

    setIsDeleteInProgress(true);
    try {
      const response = await deleteLessonsApi(location, { lessonIds });

      dispatch(deleteLessons({ lessonIds }));
      clearSelection();
      modalState.setIsDeleteModalOpen(false);
      await refetchAfterMutation();
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
  }, [location, selectedLessons, dispatch, clearSelection, modalState, refetchAfterMutation]);

  const handleSubstituteSave = React.useCallback(
    async (
      teacherId: string,
      _teacherName: string,
      lessonIds: number[],
      substituteResponseFromModal?: SubstituteLessonResponse
    ) => {
      if (lessonIds.length === 0) return false;

      try {
        const substituteResponse =
          substituteResponseFromModal ??
          (await substituteLesson(location, {
            ids: lessonIds,
            teacherId: Number(teacherId),
          }));

        const newLessonIds = substituteResponse.data?.newLessonIds ?? [];
        if (newLessonIds.length === 0) {
          toast.success(
            typeof substituteResponse.message === "string" && substituteResponse.message.trim() !== ""
              ? substituteResponse.message
              : "Lesson substitution processed"
          );
          clearSelection();
          modalState.setIsSubstituteModalOpen(false);
          await refetchAfterMutation();
          return true;
        }

        const confirmResponse = await confirmTeacherSubstitute(location, {
          ids: lessonIds,
          newLessonIds,
        });

        const lessons = substituteResponse.data?.lessons ?? [];
        const newRows = mapSubstituteLessonsToRows(lessons);
        dispatch(
          applyTeacherSubstituteResult({
            oldLessonIds: lessonIds,
            newRows,
          })
        );

        clearSelection();
        modalState.setIsSubstituteModalOpen(false);
        await refetchAfterMutation();
        toast.success(
          typeof confirmResponse.message === "string" && confirmResponse.message.trim() !== ""
            ? confirmResponse.message
            : typeof substituteResponse.message === "string" && substituteResponse.message.trim() !== ""
              ? substituteResponse.message
              : "Lesson substitution processed"
        );

        // Redirect disabled for now; stay on current page.
        return true;
      } catch (error) {
        const message = extractErrorMessage(error, "Failed to substitute teacher");
        toast.error(message);
        return false;
      }
    },
      [location, dispatch, clearSelection, modalState, refetchAfterMutation]
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
          // Keep existing listing prices until fresh server data arrives.
          // This avoids wrong optimistic calculations (e.g. showing $0.00 incorrectly).
          const newPrices = new Map<number, string>(
            lessonsUpdated.map((lesson) => [lesson.id, lesson.price])
          );
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
        await refetchAfterMutation();
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
    [location, selectedLessons, dispatch, clearSelection, modalState, refetchAfterMutation]
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
        await refetchAfterMutation();
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
    [location, toApiDuration, dispatch, clearSelection, modalState, refetchAfterMutation]
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
        await refetchAfterMutation();
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
    [location, dispatch, clearSelection, modalState, refetchAfterMutation]
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
        await refetchAfterMutation();
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
    [location, dispatch, clearSelection, modalState, refetchAfterMutation]
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

