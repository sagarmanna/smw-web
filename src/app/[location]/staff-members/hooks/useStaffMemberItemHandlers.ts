"use client";

import * as React from "react";
import { StaffMemberEmail, StaffMemberPhone, StaffMemberAddress } from "../types";
import { toast } from "sonner";
import {
  deleteStaffMemberEmail,
  deleteStaffMemberPhone,
  deleteStaffMemberAddress,
  updateStaffMemberEmail,
  updateStaffMemberPhone,
  updateStaffMemberAddress,
} from "../[id]/staff-members-details.api";

interface UseEmailHandlersProps {
  emails: StaffMemberEmail[];
  updateEmails: React.Dispatch<React.SetStateAction<StaffMemberEmail[]>>;
  location: string;
  staffMemberId?: number;
  entityId?: number;
  onRefresh?: () => Promise<void>;
}

export function useEmailHandlers({
  emails,
  updateEmails,
  location,
  entityId,
}: UseEmailHandlersProps) {
  const [editingEmail, setEditingEmail] = React.useState<StaffMemberEmail | null>(null);
  const [emailToDelete, setEmailToDelete] = React.useState<StaffMemberEmail | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleCreate = React.useCallback(
    (newEmail: StaffMemberEmail) => {
      updateEmails((prev) => {
        if (editingEmail) {
          const base = newEmail.isPrimary
            ? prev.map((email) => ({ ...email, isPrimary: false }))
            : prev;
          return base.map((email) =>
            email.id === editingEmail.id ? newEmail : email
          );
        } else {
          const base = newEmail.isPrimary
            ? prev.map((email) => ({ ...email, isPrimary: false }))
            : prev;
          return [...base, newEmail];
        }
      });
      setEditingEmail(null);
    },
    [updateEmails, editingEmail]
  );

  const handleEdit = React.useCallback((email: StaffMemberEmail) => {
    setEditingEmail(email);
  }, []);

  const requestDelete = React.useCallback(
    (id: string) => {
      const email = emails.find((e) => e.id === id);
      if (!email) return;

      const isOnlyEmail = emails.length === 1;
      const isPrimary = email.isPrimary === true;

      if (isPrimary || isOnlyEmail) {
        toast.error("Primary email cannot be deleted");
        return;
      }

      setEmailToDelete(email);
    },
    [emails]
  );

  const handleDeleteConfirm = React.useCallback(async () => {
    if (!emailToDelete || !entityId) return;

    const id = emailToDelete.id;
    setIsDeleting(true);

    try {
      const result = await deleteStaffMemberEmail(location, entityId, id);

      if (result?.success) {
        toast.success(result.message || "Email deleted successfully");
        updateEmails((prev) => prev.filter((email) => email.id !== id));
      } else {
        toast.error(result?.message || "Failed to delete email");
      }
    } catch (error) {
      console.error("Error deleting email:", error);
      const errorMessage = (error as { message?: string })?.message || "Failed to delete email";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setEmailToDelete(null);
    }
  }, [emailToDelete, location, entityId, updateEmails]);

  const handleReorder = React.useCallback(
    async (reorderedEmails: StaffMemberEmail[]) => {
      const newPrimary = reorderedEmails.find((e) => e.isPrimary);
      const oldPrimary = emails.find((e) => e.isPrimary && e.id !== newPrimary?.id);

      updateEmails(reorderedEmails);

      if (newPrimary && newPrimary.id !== oldPrimary?.id && entityId) {
        try {
          const newPrimaryId = Number(newPrimary.id);
          const newPrimaryResult = await updateStaffMemberEmail(
            location,
            entityId,
            newPrimaryId,
            {
              email: newPrimary.email,
              note: newPrimary.note || "",
              label: newPrimary.label,
              isPrimary: true,
            }
          );

          if (!newPrimaryResult?.success) {
            toast.error(newPrimaryResult?.message || "Failed to update primary email");
            updateEmails(emails);
            return;
          }

          const otherEmails = emails.filter((e) => e.id !== newPrimary.id);
          if (otherEmails.length > 0) {
            await Promise.all(
              otherEmails.map((email) => {
                const emailId = Number(email.id);
                return updateStaffMemberEmail(location, entityId, emailId, {
                  email: email.email,
                  note: email.note || "",
                  label: email.label,
                  isPrimary: false,
                });
              })
            );
          }

          toast.success(newPrimaryResult.message || "Primary email updated successfully");
        } catch (error) {
          console.error("Error updating primary email:", error);
          toast.error("Failed to update primary email");
          updateEmails(emails);
        }
      }
    },
    [emails, location, entityId, updateEmails]
  );

  return {
    editingEmail,
    emailToDelete,
    setEditingEmail,
    setEmailToDelete,
    handleCreate,
    handleEdit,
    handleDeleteConfirm,
    requestDelete,
    isDeleting,
    handleReorder,
  };
}

interface UsePhoneHandlersProps {
  phones: StaffMemberPhone[];
  updatePhones: React.Dispatch<React.SetStateAction<StaffMemberPhone[]>>;
  location: string;
  staffMemberId?: number;
  entityId?: number;
  onRefresh?: () => Promise<void>;
}

export function usePhoneHandlers({
  phones,
  updatePhones,
  location,
  entityId,
}: UsePhoneHandlersProps) {
  const [editingPhone, setEditingPhone] = React.useState<StaffMemberPhone | null>(null);
  const [phoneToDelete, setPhoneToDelete] = React.useState<StaffMemberPhone | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleCreate = React.useCallback(
    (newPhone: StaffMemberPhone) => {
      updatePhones((prev) => {
        if (editingPhone) {
          return prev.map((phone) =>
            phone.id === editingPhone.id ? newPhone : phone
          );
        } else {
          return [...prev, newPhone];
        }
      });
      setEditingPhone(null);
    },
    [updatePhones, editingPhone]
  );

  const handleEdit = React.useCallback((phone: StaffMemberPhone) => {
    setEditingPhone(phone);
  }, []);

  const requestDelete = React.useCallback(
    (id: string) => {
      const phone = phones.find((p) => p.id === id);
      if (!phone) return;
      setPhoneToDelete(phone);
    },
    [phones]
  );

  const handleDeleteConfirm = React.useCallback(async () => {
    if (!phoneToDelete || !entityId) return;

    const id = phoneToDelete.id;
    setIsDeleting(true);

    try {
      const result = await deleteStaffMemberPhone(location, entityId, id);

      if (result?.success) {
        toast.success(result.message || "Phone deleted successfully");
        updatePhones((prev) => prev.filter((phone) => phone.id !== id));
      } else {
        toast.error(result?.message || "Failed to delete phone");
      }
    } catch (error) {
      console.error("Error deleting phone:", error);
      const errorMessage = (error as { message?: string })?.message || "Failed to delete phone";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setPhoneToDelete(null);
    }
  }, [phoneToDelete, location, entityId, updatePhones]);

  const buildPhonePayload = React.useCallback(
    (phone: StaffMemberPhone) => {
      const ext = phone.extension != null ? String(phone.extension).trim() : "";
      const extensionAsNumber =
        ext && /^\d+$/.test(ext) ? parseInt(ext, 10) : undefined;
      const payload: {
        number: string;
        note: string;
        label: string;
        isPrimary: boolean;
        extension?: number;
      } = {
        number: phone.number || "",
        note: phone.note || "",
        label: phone.label || "",
        isPrimary: phone.isPrimary ?? false,
      };
      if (extensionAsNumber !== undefined) {
        payload.extension = extensionAsNumber;
      }
      return payload;
    },
    []
  );

  const handleReorder = React.useCallback(
    async (reorderedPhones: StaffMemberPhone[]) => {
      const newPrimary = reorderedPhones.find((p) => p.isPrimary);
      const oldPrimary = phones.find((p) => p.isPrimary && p.id !== newPrimary?.id);

      updatePhones(reorderedPhones);

      if (newPrimary && newPrimary.id !== oldPrimary?.id && entityId) {
        try {
          const newPrimaryId = Number(newPrimary.id);
          const newPrimaryPayload = buildPhonePayload({
            ...newPrimary,
            isPrimary: true,
          });
          const newPrimaryResult = await updateStaffMemberPhone(
            location,
            entityId,
            newPrimaryId,
            newPrimaryPayload
          );

          if (!newPrimaryResult?.success) {
            toast.error(newPrimaryResult?.message || "Failed to update primary phone");
            updatePhones(phones);
            return;
          }

          const otherPhones = phones.filter((p) => p.id !== newPrimary.id);
          if (otherPhones.length > 0) {
            await Promise.all(
              otherPhones.map((phone) => {
                const phoneId = Number(phone.id);
                const payload = buildPhonePayload({ ...phone, isPrimary: false });
                return updateStaffMemberPhone(location, entityId, phoneId, payload);
              })
            );
          }

          toast.success(newPrimaryResult.message || "Primary phone updated successfully");
        } catch (error) {
          console.error("Error updating primary phone:", error);
          toast.error("Failed to update primary phone");
          updatePhones(phones);
        }
      }
    },
    [phones, location, entityId, updatePhones, buildPhonePayload]
  );

  return {
    editingPhone,
    phoneToDelete,
    setEditingPhone,
    setPhoneToDelete,
    handleCreate,
    handleEdit,
    handleDeleteConfirm,
    requestDelete,
    isDeleting,
    handleReorder,
  };
}

interface UseAddressHandlersProps {
  addresses: StaffMemberAddress[];
  updateAddresses: React.Dispatch<React.SetStateAction<StaffMemberAddress[]>>;
  location: string;
  staffMemberId?: number;
  entityId?: number;
  onRefresh?: () => Promise<void>;
}

export function useAddressHandlers({
  addresses,
  updateAddresses,
  location,
  entityId,
}: UseAddressHandlersProps) {
  const [editingAddress, setEditingAddress] = React.useState<StaffMemberAddress | null>(null);
  const [addressToDelete, setAddressToDelete] = React.useState<StaffMemberAddress | null>(null);
  const [addressToDeleteDisplayLabel, setAddressToDeleteDisplayLabel] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleCreate = React.useCallback(
    (newAddress: StaffMemberAddress) => {
      updateAddresses((prev) => {
        if (editingAddress) {
          return prev.map((address) =>
            address.id === editingAddress.id ? newAddress : address
          );
        } else {
          return [...prev, newAddress];
        }
      });
      setEditingAddress(null);
    },
    [updateAddresses, editingAddress]
  );

  const handleEdit = React.useCallback((address: StaffMemberAddress) => {
    setEditingAddress(address);
  }, []);

  const requestDelete = React.useCallback(
    (id: string, displayLabel?: string) => {
      const address = addresses.find((a) => a.id === id);
      if (!address) return;
      setAddressToDelete(address);
      setAddressToDeleteDisplayLabel(displayLabel ?? null);
    },
    [addresses]
  );

  const clearAddressToDelete = React.useCallback(() => {
    setAddressToDelete(null);
    setAddressToDeleteDisplayLabel(null);
  }, []);

  const handleDeleteConfirm = React.useCallback(async () => {
    if (!addressToDelete || !entityId) return;

    const id = addressToDelete.id;
    setIsDeleting(true);

    try {
      const result = await deleteStaffMemberAddress(location, entityId, id);

      if (result?.success) {
        toast.success(result.message || "Address deleted successfully");
        updateAddresses((prev) => prev.filter((address) => address.id !== id));
      } else {
        toast.error(result?.message || "Failed to delete address");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      const errorMessage = (error as { message?: string })?.message || "Failed to delete address";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setAddressToDelete(null);
      setAddressToDeleteDisplayLabel(null);
    }
  }, [addressToDelete, location, entityId, updateAddresses]);

  const handleReorder = React.useCallback(
    async (reorderedAddresses: StaffMemberAddress[]) => {
      const newPrimary = reorderedAddresses.find((a) => a.isPrimary);
      const oldPrimary = addresses.find((a) => a.isPrimary && a.id !== newPrimary?.id);

      updateAddresses(reorderedAddresses);

      if (newPrimary && newPrimary.id !== oldPrimary?.id && entityId) {
        try {
          const newPrimaryId = Number(newPrimary.id);
          const newPrimaryResult = await updateStaffMemberAddress(
            location,
            entityId,
            newPrimaryId,
            {
              address: newPrimary.address,
              postalCode: newPrimary.postalCode,
              city: newPrimary.city,
              cityId: newPrimary.cityId,
              provinceId: newPrimary.provinceId,
              countryId: newPrimary.countryId,
              label: newPrimary.label,
              isPrimary: true,
            }
          );

          if (!newPrimaryResult?.success) {
            toast.error(newPrimaryResult?.message || "Failed to update primary address");
            updateAddresses(addresses);
            return;
          }

          const otherAddresses = addresses.filter((a) => a.id !== newPrimary.id);
          if (otherAddresses.length > 0) {
            await Promise.all(
              otherAddresses.map((address) => {
                const addressId = Number(address.id);
                return updateStaffMemberAddress(location, entityId, addressId, {
                  address: address.address,
                  postalCode: address.postalCode,
                  city: address.city,
                  cityId: address.cityId,
                  provinceId: address.provinceId,
                  countryId: address.countryId,
                  label: address.label,
                  isPrimary: false,
                });
              })
            );
          }

          toast.success(newPrimaryResult.message || "Primary address updated successfully");
        } catch (error) {
          console.error("Error updating primary address:", error);
          toast.error("Failed to update primary address");
          updateAddresses(addresses);
        }
      }
    },
    [addresses, location, entityId, updateAddresses]
  );

  return {
    editingAddress,
    addressToDelete,
    setEditingAddress,
    setAddressToDelete,
    addressToDeleteDisplayLabel,
    clearAddressToDelete,
    handleCreate,
    handleEdit,
    handleDeleteConfirm,
    requestDelete,
    isDeleting,
    handleReorder,
  };
}

