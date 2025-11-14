"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DetailHeaderWithProfile } from "@/app/[location]/customers/components/DetailHeaderWithProfile";
import { ActionMenuGroup } from "@/components/DetailHeader";
import { SectionCard } from "@/components/SectionCard";
import { SectionCardDataRow } from "@/components/SectionCard/types";
import { useTeacherDetails } from "../hooks/useTeacherDetails";
import { TeacherQualification } from "../types";
import { EditTeacherDetailsModal } from "../components/modals/EditTeacherDetailsModal";
import { CreateEmailModal } from "../components/modals/CreateEmailModal";
import { CreatePhoneModal } from "../components/modals/CreatePhoneModal";
import { CreateAddressModal } from "../components/modals/CreateAddressModal";
import {
  AddQualificationModal,
  PRIVATE_PROGRAMS,
  GROUP_PROGRAMS,
} from "../components/modals/AddQualificationModal";
import { SetTeacherPasswordModal } from "../components/modals/SetTeacherPasswordModal";
import {
  AddressList,
  EmailList,
  PhoneList,
  QualificationsList,
} from "../components/sections";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import {
  useEmailHandlers,
  usePhoneHandlers,
  useAddressHandlers,
} from "../hooks/useTeacherItemHandlers";

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
    details,
    emails,
    phones,
    addresses,
    privateQualifications,
    groupQualifications,
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
  const [privateQualificationsPage, setPrivateQualificationsPage] = React.useState(1);
  const [groupQualificationsPage, setGroupQualificationsPage] = React.useState(1);

  const emailHandlers = useEmailHandlers({ emails, updateEmails });
  const phoneHandlers = usePhoneHandlers({ phones, updatePhones });
  const addressHandlers = useAddressHandlers({ addresses, updateAddresses });

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
    <>
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
                  ? (
                      <QualificationsList 
                        items={privateQualifications} 
                        page={privateQualificationsPage}
                        onPageChange={setPrivateQualificationsPage}
                        itemsPerPage={10}
                      />
                    )
                  : isPrivateExpanded && privateQualifications.length === 0
                  ? null
                  : undefined
              }
              showView
              viewIsActive={isPrivateExpanded}
              onViewClick={() => {
                setIsPrivateExpanded((prev) => !prev);
                // Reset to page 1 when collapsing/expanding
                if (!isPrivateExpanded) {
                  setPrivateQualificationsPage(1);
                }
              }}
              showAddButton
              onAddClick={() => setShowPrivateModal(true)}
              emptyState={
                isPrivateExpanded && privateQualifications.length === 0
                  ? "No private qualifications yet."
                  : undefined
              }
            >
              {!isPrivateExpanded ? <div className="hidden" /> : undefined}
            </SectionCard>

            <SectionCard
              title="Group Qualifications"
              data={
                isGroupExpanded && groupQualifications.length > 0
                  ? (
                      <QualificationsList 
                        items={groupQualifications} 
                        page={groupQualificationsPage}
                        onPageChange={setGroupQualificationsPage}
                        itemsPerPage={10}
                      />
                    )
                  : isGroupExpanded && groupQualifications.length === 0
                  ? null
                  : undefined
              }
              showView
              viewIsActive={isGroupExpanded}
              onViewClick={() => {
                setIsGroupExpanded((prev) => !prev);
                // Reset to page 1 when collapsing/expanding
                if (!isGroupExpanded) {
                  setGroupQualificationsPage(1);
                }
              }}
              showAddButton
              onAddClick={() => setShowGroupModal(true)}
              emptyState={
                isGroupExpanded && groupQualifications.length === 0
                  ? "No group qualifications yet."
                  : undefined
              }
            >
              {!isGroupExpanded ? <div className="hidden" /> : undefined}
            </SectionCard>
        </div>

          <div className="space-y-4">
            <SectionCard
              title="Email"
              data={
                emails.length > 0 ? (
                  <EmailList
              emails={emails}
                        onEdit={emailHandlers.handleEdit}
                        onDelete={emailHandlers.handleDelete}
                  />
                ) : undefined
              }
              emptyState="No email addresses added yet."
              showCreateModal
                  renderCreateModal={({ isOpen, close }) => (
                    <CreateEmailModal
                      open={isOpen}
                      onClose={close}
                      onSubmit={emailHandlers.handleCreate}
                    />
                  )}
            />

            <SectionCard
              title="Phone"
              data={
                phones.length > 0 ? (
                  <PhoneList
              phones={phones}
                        onEdit={phoneHandlers.handleEdit}
                        onDelete={phoneHandlers.handleDelete}
                  />
                ) : undefined
              }
              emptyState="No phone numbers added yet."
              showCreateModal
                  renderCreateModal={({ isOpen, close }) => (
                    <CreatePhoneModal
                      open={isOpen}
                      onClose={close}
                      onSubmit={phoneHandlers.handleCreate}
                    />
                  )}
            />

            <SectionCard
              title="Addresses"
              data={
                addresses.length > 0 ? (
                  <AddressList
                    addresses={addresses}
                        onEdit={addressHandlers.handleEdit}
                        onDelete={addressHandlers.handleDelete}
                  />
                ) : undefined
              }
              emptyState="No addresses added yet."
              showCreateModal
                  renderCreateModal={({ isOpen, close }) => (
                    <CreateAddressModal
                      open={isOpen}
                      onClose={close}
                      onSubmit={addressHandlers.handleCreate}
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

      {/* Edit modals - rendered separately when editing */}
      {emailHandlers.editingEmail && (
        <CreateEmailModal
          open={true}
          onClose={() => emailHandlers.setEditingEmail(null)}
          onSubmit={emailHandlers.handleCreate}
          editingEmail={emailHandlers.editingEmail}
        />
      )}

      {phoneHandlers.editingPhone && (
        <CreatePhoneModal
          open={true}
          onClose={() => phoneHandlers.setEditingPhone(null)}
          onSubmit={phoneHandlers.handleCreate}
          editingPhone={phoneHandlers.editingPhone}
        />
      )}

      {addressHandlers.editingAddress && (
        <CreateAddressModal
          open={true}
          onClose={() => addressHandlers.setEditingAddress(null)}
          onSubmit={addressHandlers.handleCreate}
          editingAddress={addressHandlers.editingAddress}
        />
      )}

      {/* Delete Confirmation Modals */}
      <DeleteConfirmationModal
        open={!!emailHandlers.emailToDelete}
        onOpenChange={(open) => !open && emailHandlers.setEmailToDelete(null)}
        title="Are you sure you want to delete this email?"
        itemLabel={
          emailHandlers.emailToDelete
            ? `${emailHandlers.emailToDelete.label}: ${emailHandlers.emailToDelete.email}`
            : undefined
        }
        onConfirm={emailHandlers.handleDeleteConfirm}
      />

      <DeleteConfirmationModal
        open={!!phoneHandlers.phoneToDelete}
        onOpenChange={(open) => !open && phoneHandlers.setPhoneToDelete(null)}
        title="Are you sure you want to delete this phone number?"
        itemLabel={
          phoneHandlers.phoneToDelete
            ? `${phoneHandlers.phoneToDelete.label}: ${phoneHandlers.phoneToDelete.number}${
                phoneHandlers.phoneToDelete.extension
                  ? ` Ext: ${phoneHandlers.phoneToDelete.extension}`
                  : ""
              }`
            : undefined
        }
        onConfirm={phoneHandlers.handleDeleteConfirm}
      />

      <DeleteConfirmationModal
        open={!!addressHandlers.addressToDelete}
        onOpenChange={(open) => !open && addressHandlers.setAddressToDelete(null)}
        title="Are you sure you want to delete this address?"
        itemLabel={
          addressHandlers.addressToDelete
            ? `${addressHandlers.addressToDelete.label}: ${addressHandlers.addressToDelete.address}${
                addressHandlers.addressToDelete.city
                  ? `, ${addressHandlers.addressToDelete.city}`
                  : ""
              }${
                addressHandlers.addressToDelete.province
                  ? `, ${addressHandlers.addressToDelete.province}`
                  : ""
              }`
            : undefined
        }
        onConfirm={addressHandlers.handleDeleteConfirm}
      />
    </>
  );
}




