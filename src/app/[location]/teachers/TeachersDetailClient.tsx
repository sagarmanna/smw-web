"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DetailHeaderWithProfile } from "@/app/[location]/customers/components/DetailHeaderWithProfile";
import { ActionMenuGroup } from "@/components/DetailHeader";
import { SectionCard } from "@/components/SectionCard";
import { SectionCardDataRow } from "@/components/SectionCard/types";
import { Button } from "@/components/ui/button";
import { useTeacherDetails } from "./hooks/useTeacherDetails";
import {
  TeacherAddress,
  TeacherEmail,
  TeacherPhone,
  TeacherQualification,
} from "./types";
import { EditTeacherDetailsModal } from "./components/modals/EditTeacherDetailsModal";
import { CreateEmailModal } from "./components/modals/CreateEmailModal";
import { CreatePhoneModal } from "./components/modals/CreatePhoneModal";
import { CreateAddressModal } from "./components/modals/CreateAddressModal";
import {
  AddQualificationModal,
  PRIVATE_PROGRAMS,
  GROUP_PROGRAMS,
} from "./components/modals/AddQualificationModal";
import { SetTeacherPasswordModal } from "./components/modals/SetTeacherPasswordModal";
import {
  AddressList,
  EmailList,
  PhoneList,
  QualificationsList,
} from "./components/sections";

interface TeachersDetailClientProps {
  location: string;
  id: string;
}

const formatDisplayDate = (value?: string) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function TeachersDetailClient({ location, id }: TeachersDetailClientProps) {
  const router = useRouter();
  const teacherId = Number(id);

  const {
    loading,
    error,
    details,
    emails,
    phones,
    addresses,
    privateQualifications,
    groupQualifications,
    refresh,
    saveDetails,
    updateEmails,
    updatePhones,
    updateAddresses,
    addPrivateQualifications,
    addGroupQualifications,
    updatePassword,
    savingDetails,
  } = useTeacherDetails(location, teacherId);

  const [isEditDetailsOpen, setIsEditDetailsOpen] = React.useState(false);
  const [showPrivateModal, setShowPrivateModal] = React.useState(false);
  const [showGroupModal, setShowGroupModal] = React.useState(false);
  const [isPrivateExpanded, setIsPrivateExpanded] = React.useState(false);
  const [isGroupExpanded, setIsGroupExpanded] = React.useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);

  const dropdownOptions = React.useMemo(
    () => [
      {
        title: "Set Password",
        onClick: () => setIsPasswordModalOpen(true),
      },
    ],
    []
  );

  const detailRows = React.useMemo<SectionCardDataRow[]>(() => {
    const fullName = details
      ? [details.firstName, details.lastName].filter(Boolean).join(" ")
      : "";

    return [
      {
        label: "Name",
        value: fullName || "N/A",
      },
      {
        label: "Role",
        value: details?.role || "Teacher",
      },
      {
        label: "Birth Date",
        value: formatDisplayDate(details?.birthDate),
      },
    ];
  }, [details]);

  const handleEmailCreate = React.useCallback(
    (newEmail: TeacherEmail) => {
      updateEmails((prev) => {
        const base = newEmail.isPrimary
          ? prev.map((email) => ({ ...email, isPrimary: false }))
          : prev;
        return [...base, newEmail];
      });
    },
    [updateEmails]
  );

  const handlePhoneCreate = React.useCallback(
    (newPhone: TeacherPhone) => {
      updatePhones((prev) => [...prev, newPhone]);
    },
    [updatePhones]
  );

  const handleAddressCreate = React.useCallback(
    (newAddress: TeacherAddress) => {
      updateAddresses((prev) => [...prev, newAddress]);
    },
    [updateAddresses]
  );

  const handlePrivateQualificationsAdd = React.useCallback(
    (items: Array<{ program: string; rate: number }>) => {
      const nextId =
        privateQualifications.length > 0
          ? Math.max(...privateQualifications.map((item) => item.id)) + 1
          : 1;

      const mapped: TeacherQualification[] = items.map((item, index) => {
        const program = PRIVATE_PROGRAMS.find(
          (option) => option.value === item.program
        );
        return {
          id: nextId + index,
          name: program?.label ?? item.program,
          rate: item.rate,
        };
      });

      addPrivateQualifications(mapped);
    },
    [addPrivateQualifications, privateQualifications]
  );

  const handleGroupQualificationsAdd = React.useCallback(
    (items: Array<{ program: string; rate: number }>) => {
      const nextId =
        groupQualifications.length > 0
          ? Math.max(...groupQualifications.map((item) => item.id)) + 1
          : 1;

      const mapped: TeacherQualification[] = items.map((item, index) => {
        const program = GROUP_PROGRAMS.find(
          (option) => option.value === item.program
        );
        return {
          id: nextId + index,
          name: program?.label ?? item.program,
          rate: item.rate,
        };
      });

      addGroupQualifications(mapped);
    },
    [addGroupQualifications, groupQualifications]
  );

  const handlePasswordSave = React.useCallback(
    async (password: string) => updatePassword(password),
    [updatePassword]
  );

  const pageTitle = React.useMemo(() => {
    const fullName = details
      ? [details.firstName, details.lastName].filter(Boolean).join(" ")
      : "";
    return fullName || `Teacher #${id}`;
  }, [details, id]);

  const breadcrumbItems = React.useMemo(
    () => [
      {
        label: "Teachers",
        onClick: () => router.push(`/${location}/teachers`),
      },
    ],
    [location, router]
  );

  const actionMenuGroups = React.useMemo<ActionMenuGroup[]>(
    () => [
      {
        label: "Actions",
        items: [
          {
            label: "Delete",
            onClick: () => {
              // TODO: implement delete behaviour
            },
            variant: "destructive",
          },
        ],
      },
    ],
    []
  );

  return (
    <div className="bg-white dark:bg-black">
      <DetailHeaderWithProfile
        breadcrumbItems={breadcrumbItems}
        currentPageTitle={pageTitle}
        loading={loading}
        actionMenuGroups={actionMenuGroups}
        actionButtonAriaLabel="Teacher actions"
        showProfileIcon={true}
        profileIconSize="md"
      />

      <div className="px-0">
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <SectionCard
              title="Details"
              data={detailRows}
              showEdit
              onEditClick={() => setIsEditDetailsOpen(true)}
              showDropDown
              dropdownOptions={dropdownOptions}
            />

            <SectionCard
              title="Private Qualifications"
              data={
                isPrivateExpanded && privateQualifications.length > 0
                  ? <QualificationsList items={privateQualifications} />
                  : undefined
              }
              showView
              viewIsActive={isPrivateExpanded}
              onViewClick={() => setIsPrivateExpanded((prev) => !prev)}
              showAddButton
              onAddClick={() => setShowPrivateModal(true)}
              emptyState={
                isPrivateExpanded ? "No private qualifications yet." : undefined
              }
            />

            <SectionCard
              title="Group Qualifications"
              data={
                isGroupExpanded && groupQualifications.length > 0
                  ? <QualificationsList items={groupQualifications} />
                  : undefined
              }
              showView
              viewIsActive={isGroupExpanded}
              onViewClick={() => setIsGroupExpanded((prev) => !prev)}
              showAddButton
              onAddClick={() => setShowGroupModal(true)}
              emptyState={
                isGroupExpanded ? "No group qualifications yet." : undefined
              }
            />
          </div>

          <div className="space-y-4">
            <SectionCard
              title="Email"
              data={
                emails.length > 0 ? <EmailList emails={emails} /> : undefined
              }
              emptyState="No email addresses added yet."
              showCreateModal
              renderCreateModal={({ isOpen, close }) => (
                <CreateEmailModal
                  open={isOpen}
                  onClose={close}
                  onSubmit={handleEmailCreate}
                />
              )}
            />

            <SectionCard
              title="Phone"
              data={
                phones.length > 0 ? <PhoneList phones={phones} /> : undefined
              }
              emptyState="No phone numbers added yet."
              showCreateModal
              renderCreateModal={({ isOpen, close }) => (
                <CreatePhoneModal
                  open={isOpen}
                  onClose={close}
                  onSubmit={handlePhoneCreate}
                />
              )}
            />

            <SectionCard
              title="Addresses"
              data={
                addresses.length > 0 ? (
                  <AddressList addresses={addresses} />
                ) : undefined
              }
              emptyState="No addresses added yet."
              showCreateModal
              renderCreateModal={({ isOpen, close }) => (
                <CreateAddressModal
                  open={isOpen}
                  onClose={close}
                  onSubmit={handleAddressCreate}
                />
              )}
            />
          </div>
        </div>
      </div>

      <EditTeacherDetailsModal
        open={isEditDetailsOpen}
        onClose={() => setIsEditDetailsOpen(false)}
        details={
          details ?? {
            firstName: "",
            lastName: "",
            role: "Teacher",
          }
        }
        onSubmit={saveDetails}
        saving={savingDetails}
      />

      <AddQualificationModal
        open={showPrivateModal}
        onOpenChange={setShowPrivateModal}
        title="Add Private Qualifications"
        onAdd={handlePrivateQualificationsAdd}
        availablePrograms={PRIVATE_PROGRAMS}
      />

      <AddQualificationModal
        open={showGroupModal}
        onOpenChange={setShowGroupModal}
        title="Add Group Qualifications"
        onAdd={handleGroupQualificationsAdd}
        availablePrograms={GROUP_PROGRAMS}
      />

      <SetTeacherPasswordModal
        open={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handlePasswordSave}
      />
    </div>
  );
}
