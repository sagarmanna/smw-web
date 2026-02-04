"use client";

import * as React from "react";
import { OwnerEmail, OwnerPhone, OwnerAddress } from "../types";
import {
  deleteOwnerEmail,
  deleteOwnerPhone,
  deleteOwnerAddress,
  updateOwnerEmail,
  updateOwnerPhone,
  updateOwnerAddress,
} from "../[id]/owners-details.api";
import { toast } from "sonner";

interface UseEmailHandlersProps {
  emails: OwnerEmail[];
  updateEmails: React.Dispatch<React.SetStateAction<OwnerEmail[]>>;
  location: string;
  ownerId?: number;
  entityId?: number;
  onRefresh?: () => Promise<void>;
}

export function useEmailHandlers({
  emails,
  updateEmails,
  location,
  ownerId,
  entityId,
  onRefresh,
}: UseEmailHandlersProps) {
  const effectiveOwnerId = ownerId ?? entityId ?? 0;
  const [editingEmail, setEditingEmail] = React.useState<OwnerEmail | null>(null);
  const [emailToDelete, setEmailToDelete] = React.useState<OwnerEmail | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleCreate = React.useCallback(
    (newEmail: OwnerEmail) => {
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

  const handleEdit = React.useCallback((email: OwnerEmail) => {
    setEditingEmail(email);
  }, []);

  const requestDelete = React.useCallback(
    (id: string) => {
      const email = emails.find((e) => e.id === id);
      if (!email) return;

      // Business rule: primary email cannot be deleted.
      // Safety: if there's only ONE email, always treat it as primary,
      // even if isPrimary flag is missing/false from API.
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
    if (!emailToDelete) return;

    const id = emailToDelete.id;
    setIsDeleting(true);

    try {
      const result = await deleteOwnerEmail(location, effectiveOwnerId, id);

      if (result?.success) {
        toast.success(result.message || "Email deleted successfully");
        updateEmails((prev) => prev.filter((email) => email.id !== id));
        if (onRefresh) await onRefresh();
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
  }, [emailToDelete, location, effectiveOwnerId, updateEmails, onRefresh]);

  const handleReorder = React.useCallback(
    async (reorderedEmails: OwnerEmail[]) => {
      const newPrimary = reorderedEmails.find((e) => e.isPrimary);
      const oldPrimary = emails.find((e) => e.isPrimary && e.id !== newPrimary?.id);
      updateEmails(reorderedEmails);
      if (newPrimary && newPrimary.id !== oldPrimary?.id && effectiveOwnerId) {
        try {
          const newPrimaryId = Number(newPrimary.id);
          const newPrimaryResult = await updateOwnerEmail(
            location,
            effectiveOwnerId,
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
                return updateOwnerEmail(location, effectiveOwnerId, emailId, {
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
    [emails, location, effectiveOwnerId, updateEmails]
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
  phones: OwnerPhone[];
  updatePhones: React.Dispatch<React.SetStateAction<OwnerPhone[]>>;
  location: string;
  ownerId?: number;
  entityId?: number;
  onRefresh?: () => Promise<void>;
}

export function usePhoneHandlers({
  phones,
  updatePhones,
  location,
  ownerId,
  entityId,
  onRefresh,
}: UsePhoneHandlersProps) {
  const effectiveOwnerId = ownerId ?? entityId ?? 0;
  const [editingPhone, setEditingPhone] = React.useState<OwnerPhone | null>(null);
  const [phoneToDelete, setPhoneToDelete] = React.useState<OwnerPhone | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleCreate = React.useCallback(
    (newPhone: OwnerPhone) => {
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

  const handleEdit = React.useCallback((phone: OwnerPhone) => {
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
    if (!phoneToDelete) return;

    const id = phoneToDelete.id;
    setIsDeleting(true);

    try {
      const result = await deleteOwnerPhone(location, effectiveOwnerId, id);

      if (result?.success) {
        toast.success(result.message || "Phone deleted successfully");
        updatePhones((prev) => prev.filter((phoneItem) => phoneItem.id !== id));
        if (onRefresh) await onRefresh();
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
  }, [phoneToDelete, location, effectiveOwnerId, updatePhones, onRefresh]);

  const handleReorder = React.useCallback(
    async (reorderedPhones: OwnerPhone[]) => {
      const newPrimary = reorderedPhones.find((p) => p.isPrimary);
      const oldPrimary = phones.find((p) => p.isPrimary && p.id !== newPrimary?.id);
      updatePhones(reorderedPhones);
      if (newPrimary && newPrimary.id !== oldPrimary?.id && effectiveOwnerId) {
        try {
          const newPrimaryId = Number(newPrimary.id);
          const newPrimaryResult = await updateOwnerPhone(
            location,
            effectiveOwnerId,
            newPrimaryId,
            {
              number: newPrimary.number,
              extension: newPrimary.extension,
              note: newPrimary.note || "",
              label: newPrimary.label,
              isPrimary: true,
            }
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
                return updateOwnerPhone(location, effectiveOwnerId, phoneId, {
                  number: phone.number,
                  extension: phone.extension,
                  note: phone.note || "",
                  label: phone.label,
                  isPrimary: false,
                });
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
    [phones, location, effectiveOwnerId, updatePhones]
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
  addresses: OwnerAddress[];
  updateAddresses: React.Dispatch<React.SetStateAction<OwnerAddress[]>>;
  location: string;
  ownerId?: number;
  entityId?: number;
  onRefresh?: () => Promise<void>;
}

export function useAddressHandlers({
  addresses,
  updateAddresses,
  location,
  ownerId,
  entityId,
  onRefresh,
}: UseAddressHandlersProps) {
  const effectiveOwnerId = ownerId ?? entityId ?? 0;
  const [editingAddress, setEditingAddress] = React.useState<OwnerAddress | null>(null);
  const [addressToDelete, setAddressToDelete] = React.useState<OwnerAddress | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleCreate = React.useCallback(
    (newAddress: OwnerAddress) => {
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

  const handleEdit = React.useCallback((address: OwnerAddress) => {
    setEditingAddress(address);
  }, []);

  const requestDelete = React.useCallback(
    (id: string) => {
      const address = addresses.find((a) => a.id === id);
      if (!address) return;
      setAddressToDelete(address);
    },
    [addresses]
  );

  const handleDeleteConfirm = React.useCallback(async () => {
    if (!addressToDelete) return;

    const id = addressToDelete.id;
    setIsDeleting(true);

    try {
      const result = await deleteOwnerAddress(location, effectiveOwnerId, id);

      if (result?.success) {
        toast.success(result.message || "Address deleted successfully");
        updateAddresses((prev) => prev.filter((address) => address.id !== id));
        if (onRefresh) await onRefresh();
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
    }
  }, [addressToDelete, location, effectiveOwnerId, updateAddresses, onRefresh]);

  const handleReorder = React.useCallback(
    async (reorderedAddresses: OwnerAddress[]) => {
      const newPrimary = reorderedAddresses.find((a) => a.isPrimary);
      const oldPrimary = addresses.find((a) => a.isPrimary && a.id !== newPrimary?.id);
      updateAddresses(reorderedAddresses);
      if (newPrimary && newPrimary.id !== oldPrimary?.id && effectiveOwnerId) {
        try {
          const newPrimaryId = Number(newPrimary.id);
          const newPrimaryResult = await updateOwnerAddress(
            location,
            effectiveOwnerId,
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
                return updateOwnerAddress(location, effectiveOwnerId, addressId, {
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
    [addresses, location, effectiveOwnerId, updateAddresses]
  );

  return {
    editingAddress,
    addressToDelete,
    setEditingAddress,
    setAddressToDelete,
    handleCreate,
    handleEdit,
    handleDeleteConfirm,
    requestDelete,
    isDeleting,
    handleReorder,
  };
}

