import * as React from "react";
import { PrivateLessonRow } from "../../privateLessonsListing.api";
import { LessonDiscountData } from "../../privateLessonsListing.slice";
import { SubstituteTeacherModal } from "../SubstituteTeacherModal";
import { EditDiscountModal } from "../EditDiscountModal";
import { EditDurationModal } from "../EditDurationModal";
import { EditClassroomModal } from "../EditClassroomModal";
import { EditOnlineTypeModal } from "../EditOnlineTypeModal";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { UnscheduleReasonModal } from "../UnscheduleReasonModal";
import { BulkRescheduleModal } from "../BulkRescheduleModal";
import { EmailModal, type EmailFormData } from "@/components/EmailModal";

interface PrivateLessonsModalsProps {
  location: string;
  selectedLessons: PrivateLessonRow[];
  previousDiscountData?: LessonDiscountData;
  modalState: {
    isSubstituteModalOpen: boolean;
    setIsSubstituteModalOpen: (open: boolean) => void;
    isEditDiscountModalOpen: boolean;
    setIsEditDiscountModalOpen: (open: boolean) => void;
    isEditDurationModalOpen: boolean;
    setIsEditDurationModalOpen: (open: boolean) => void;
    isEditClassroomModalOpen: boolean;
    setIsEditClassroomModalOpen: (open: boolean) => void;
    isEditOnlineTypeModalOpen: boolean;
    setIsEditOnlineTypeModalOpen: (open: boolean) => void;
    isDeleteModalOpen: boolean;
    setIsDeleteModalOpen: (open: boolean) => void;
    isEmailModalOpen: boolean;
    setIsEmailModalOpen: (open: boolean) => void;
    isUnscheduleConfirmModalOpen: boolean;
    setIsUnscheduleConfirmModalOpen: (open: boolean) => void;
    isUnscheduleReasonModalOpen: boolean;
    setIsUnscheduleReasonModalOpen: (open: boolean) => void;
    isBulkRescheduleModalOpen: boolean;
    setIsBulkRescheduleModalOpen: (open: boolean) => void;
  };
  saveHandlers: {
    handleSubstituteSave: (teacherId: string, teacherName: string, lessonIds: number[]) => void;
    handleEditDiscountSave: (data: LessonDiscountData, lessonIds: number[]) => Promise<boolean>;
    handleEditDurationSave: (duration: string, lessonIds: number[]) => Promise<boolean>;
    handleEditClassroomSave: (classroomId: string, classroomName: string, lessonIds: number[]) => Promise<boolean>;
    handleEditOnlineTypeSave: (onlineStatus: string, lessonIds: number[]) => Promise<boolean>;
    handleDeleteConfirm: () => void;
    handleSendEmail: (emailData: EmailFormData) => void;
    handleUnscheduleConfirm: () => void;
    handleUnscheduleReasonSave: (reason: string) => void;
    handleBulkRescheduleSave: (selectedDate: Date) => void;
  };
  isDeleteInProgress?: boolean;
}

export function PrivateLessonsModals({
  location,
  selectedLessons,
  previousDiscountData,
  modalState,
  saveHandlers,
  isDeleteInProgress = false,
}: PrivateLessonsModalsProps) {
  return (
    <>
      <SubstituteTeacherModal
        open={modalState.isSubstituteModalOpen}
        onOpenChange={modalState.setIsSubstituteModalOpen}
        location={location}
        selectedLessons={selectedLessons}
        onSave={saveHandlers.handleSubstituteSave}
      />

      <EditDiscountModal
        open={modalState.isEditDiscountModalOpen}
        onOpenChange={modalState.setIsEditDiscountModalOpen}
        location={location}
        selectedLessons={selectedLessons}
        initialDiscountData={previousDiscountData || undefined}
        onSave={saveHandlers.handleEditDiscountSave}
      />

      <EditDurationModal
        open={modalState.isEditDurationModalOpen}
        onOpenChange={modalState.setIsEditDurationModalOpen}
        selectedLessons={selectedLessons}
        onSave={saveHandlers.handleEditDurationSave}
      />

      <EditClassroomModal
        open={modalState.isEditClassroomModalOpen}
        onOpenChange={modalState.setIsEditClassroomModalOpen}
        location={location}
        selectedLessons={selectedLessons}
        onSave={saveHandlers.handleEditClassroomSave}
      />

      <EditOnlineTypeModal
        open={modalState.isEditOnlineTypeModalOpen}
        onOpenChange={modalState.setIsEditOnlineTypeModalOpen}
        selectedLessons={selectedLessons}
        onSave={saveHandlers.handleEditOnlineTypeSave}
      />

      <DeleteConfirmationModal
        open={modalState.isDeleteModalOpen}
        onOpenChange={modalState.setIsDeleteModalOpen}
        title={
          selectedLessons.length === 1
            ? "Are you sure you want to delete this lesson?"
            : `Are you sure you want to delete ${selectedLessons.length} lessons?`
        }
        onConfirm={saveHandlers.handleDeleteConfirm}
        confirmLabel="OK"
        cancelLabel="Cancel"
        isDeleting={isDeleteInProgress}
      />

      <EmailModal
        open={modalState.isEmailModalOpen}
        onOpenChange={modalState.setIsEmailModalOpen}
        onSend={saveHandlers.handleSendEmail}
        recipientEmails={[]}
        locationName={location}
        initialSubject="Message from Arcadia Academy of Music"
        initialContent="<div></div>"
        privateLessonDueData={[]}
        groupLessonDueData={[]}
        invoiceData={[]}
        creditData={[]}
        totalBalance="$0.00"
        showDeleteButton={false}
      />

      <DeleteConfirmationModal
        open={modalState.isUnscheduleConfirmModalOpen}
        onOpenChange={modalState.setIsUnscheduleConfirmModalOpen}
        title="Are you sure you want to unschedule?"
        onConfirm={saveHandlers.handleUnscheduleConfirm}
        confirmLabel="OK"
        cancelLabel="Cancel"
      />

      <UnscheduleReasonModal
        open={modalState.isUnscheduleReasonModalOpen}
        onOpenChange={modalState.setIsUnscheduleReasonModalOpen}
        onSave={saveHandlers.handleUnscheduleReasonSave}
      />

      <BulkRescheduleModal
        open={modalState.isBulkRescheduleModalOpen}
        onOpenChange={modalState.setIsBulkRescheduleModalOpen}
        onSave={saveHandlers.handleBulkRescheduleSave}
      />
    </>
  );
}

