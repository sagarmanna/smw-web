import * as React from "react";

export function usePrivateLessonsModals() {
  const [isSubstituteModalOpen, setIsSubstituteModalOpen] = React.useState(false);
  const [isEditDiscountModalOpen, setIsEditDiscountModalOpen] = React.useState(false);
  const [isEditDurationModalOpen, setIsEditDurationModalOpen] = React.useState(false);
  const [isEditClassroomModalOpen, setIsEditClassroomModalOpen] = React.useState(false);
  const [isEditOnlineTypeModalOpen, setIsEditOnlineTypeModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = React.useState(false);
  const [isUnscheduleConfirmModalOpen, setIsUnscheduleConfirmModalOpen] = React.useState(false);
  const [isUnscheduleReasonModalOpen, setIsUnscheduleReasonModalOpen] = React.useState(false);
  const [isBulkRescheduleModalOpen, setIsBulkRescheduleModalOpen] = React.useState(false);

  return {
    isSubstituteModalOpen,
    setIsSubstituteModalOpen,
    isEditDiscountModalOpen,
    setIsEditDiscountModalOpen,
    isEditDurationModalOpen,
    setIsEditDurationModalOpen,
    isEditClassroomModalOpen,
    setIsEditClassroomModalOpen,
    isEditOnlineTypeModalOpen,
    setIsEditOnlineTypeModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isEmailModalOpen,
    setIsEmailModalOpen,
    isUnscheduleConfirmModalOpen,
    setIsUnscheduleConfirmModalOpen,
    isUnscheduleReasonModalOpen,
    setIsUnscheduleReasonModalOpen,
    isBulkRescheduleModalOpen,
    setIsBulkRescheduleModalOpen,
  };
}

