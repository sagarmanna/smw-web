"use client";

import * as React from "react";
import { AdministratorEmail, AdministratorPhone, AdministratorAddress } from "../types";
import { toast } from "sonner";
import {
  deleteAdministratorEmail,
  deleteAdministratorPhone,
  deleteAdministratorAddress,
  updateAdministratorEmail,
  updateAdministratorPhone,
  updateAdministratorAddress,
} from "../[id]/administrators-details.api";

interface UseEmailHandlersProps {
  emails: AdministratorEmail[];
  updateEmails: React.Dispatch<React.SetStateAction<AdministratorEmail[]>>;
  location: string;
  administratorId?: number;
  entityId?: number;
  onRefresh?: () => Promise<void>;
}

export function useEmailHandlers({
  emails,
  updateEmails,
  location,
  entityId,
}: UseEmailHandlersProps) {
  const [editingEmail, setEditingEmail] = React.useState<AdministratorEmail | null>(null);
  const [emailToDelete, setEmailToDelete] = React.useState<AdministratorEmail | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleCreate = React.useCallback(
    (newEmail: AdministratorEmail) => {
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

  const handleEdit = React.useCallback((email: AdministratorEmail) => {
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
    if (!emailToDelete || !entityId) return;

    const id = emailToDelete.id;
    setIsDeleting(true);

    try {
      const result = await deleteAdministratorEmail(location, entityId, id);

      if (result?.success) {
        // Use API response message for toast
        toast.success(result.message || "Email deleted successfully");

        // DELETE API returns confirmation, not the full list
        // So we filter out the deleted email from current state
        // No GET call needed - Redux state is updated directly per caching rules
        updateEmails((prev) => prev.filter((email) => email.id !== id));
      } else {
        // Use API response message for error toast
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
    async (reorderedEmails: AdministratorEmail[]) => {
      // Check if primary status changed
      const newPrimary = reorderedEmails.find((e) => e.isPrimary);
      const oldPrimary = emails.find((e) => e.isPrimary && e.id !== newPrimary?.id);

      // Update local state first for immediate UI feedback
      updateEmails(reorderedEmails);

      // If primary status changed, persist to API
      if (newPrimary && newPrimary.id !== oldPrimary?.id && entityId) {
        try {
          // First, update the new primary email
          const newPrimaryId = Number(newPrimary.id);
          const newPrimaryResult = await updateAdministratorEmail(
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

          // Then update all other emails to non-primary
          const otherEmails = emails.filter((e) => e.id !== newPrimary.id);
          if (otherEmails.length > 0) {
            await Promise.all(
              otherEmails.map((email) => {
                const emailId = Number(email.id);
                return updateAdministratorEmail(
                  location,
                  entityId,
                  emailId,
                  {
                    email: email.email,
                    note: email.note || "",
                    label: email.label,
                    isPrimary: false,
                  }
                );
              })
            );
          }

          // API returns single object, not array - keep the reordered state as is
          // The local state is already correct from the optimistic update
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
  phones: AdministratorPhone[];
  updatePhones: React.Dispatch<React.SetStateAction<AdministratorPhone[]>>;
  location: string;
  administratorId?: number;
  entityId?: number;
  onRefresh?: () => Promise<void>;
}

export function usePhoneHandlers({
  phones,
  updatePhones,
  location,
  entityId,
}: UsePhoneHandlersProps) {
  const [editingPhone, setEditingPhone] = React.useState<AdministratorPhone | null>(null);
  const [phoneToDelete, setPhoneToDelete] = React.useState<AdministratorPhone | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleCreate = React.useCallback(
    (newPhone: AdministratorPhone) => {
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

  const handleEdit = React.useCallback((phone: AdministratorPhone) => {
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
      const result = await deleteAdministratorPhone(location, entityId, id);

      if (result?.success) {
        // Use API response message for toast
        toast.success(result.message || "Phone deleted successfully");

        // DELETE API returns confirmation, not the full list
        // So we filter out the deleted phone from current state
        // No GET call needed - Redux state is updated directly per caching rules
        updatePhones((prev) => prev.filter((phone) => phone.id !== id));
      } else {
        // Use API response message for error toast
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

  const handleReorder = React.useCallback(
    async (reorderedPhones: AdministratorPhone[]) => {
      // Check if primary status changed
      const newPrimary = reorderedPhones.find((p) => p.isPrimary);
      const oldPrimary = phones.find((p) => p.isPrimary && p.id !== newPrimary?.id);

      // Update local state first for immediate UI feedback
      updatePhones(reorderedPhones);

      // If primary status changed, persist to API
      if (newPrimary && newPrimary.id !== oldPrimary?.id && entityId) {
        try {
          // First, update the new primary phone
          const newPrimaryId = Number(newPrimary.id);
          const newPrimaryResult = await updateAdministratorPhone(
            location,
            entityId,
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

          // Then update all other phones to non-primary
          const otherPhones = phones.filter((p) => p.id !== newPrimary.id);
          if (otherPhones.length > 0) {
            await Promise.all(
              otherPhones.map((phone) => {
                const phoneId = Number(phone.id);
                return updateAdministratorPhone(
                  location,
                  entityId,
                  phoneId,
                  {
                    number: phone.number,
                    extension: phone.extension,
                    note: phone.note || "",
                    label: phone.label,
                    isPrimary: false,
                  }
                );
              })
            );
          }

          // API returns single object, not array - keep the reordered state as is
          // The local state is already correct from the optimistic update
          toast.success(newPrimaryResult.message || "Primary phone updated successfully");
        } catch (error) {
          console.error("Error updating primary phone:", error);
          toast.error("Failed to update primary phone");
          updatePhones(phones);
        }
      }
    },
    [phones, location, entityId, updatePhones]
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
  addresses: AdministratorAddress[];
  updateAddresses: React.Dispatch<React.SetStateAction<AdministratorAddress[]>>;
  location: string;
  administratorId?: number;
  entityId?: number;
  onRefresh?: () => Promise<void>;
}

export function useAddressHandlers({
  addresses,
  updateAddresses,
  location,
  entityId,
}: UseAddressHandlersProps) {
  const [editingAddress, setEditingAddress] = React.useState<AdministratorAddress | null>(null);
  const [addressToDelete, setAddressToDelete] = React.useState<AdministratorAddress | null>(null);
  const [addressToDeleteDisplayLabel, setAddressToDeleteDisplayLabel] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleCreate = React.useCallback(
    (newAddress: AdministratorAddress) => {
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

  const handleEdit = React.useCallback((address: AdministratorAddress) => {
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
      const result = await deleteAdministratorAddress(location, entityId, id);

      if (result?.success) {
        // Use API response message for toast
        toast.success(result.message || "Address deleted successfully");

        // DELETE API returns confirmation, not the full list
        // So we filter out the deleted address from current state
        // No GET call needed - Redux state is updated directly per caching rules
        updateAddresses((prev) => prev.filter((address) => address.id !== id));
      } else {
        // Use API response message for error toast
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
    async (reorderedAddresses: AdministratorAddress[]) => {
      // Check if primary status changed
      const newPrimary = reorderedAddresses.find((a) => a.isPrimary);
      const oldPrimary = addresses.find((a) => a.isPrimary && a.id !== newPrimary?.id);

      // Update local state first for immediate UI feedback
      updateAddresses(reorderedAddresses);

      // If primary status changed, persist to API
      if (newPrimary && newPrimary.id !== oldPrimary?.id && entityId) {
        try {
          // First, update the new primary address
          const newPrimaryId = Number(newPrimary.id);
          const newPrimaryResult = await updateAdministratorAddress(
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

          // Then update all other addresses to non-primary
          const otherAddresses = addresses.filter((a) => a.id !== newPrimary.id);
          if (otherAddresses.length > 0) {
            await Promise.all(
              otherAddresses.map((address) => {
                const addressId = Number(address.id);
                return updateAdministratorAddress(
                  location,
                  entityId,
                  addressId,
                  {
                    address: address.address,
                    postalCode: address.postalCode,
                    city: address.city,
                    cityId: address.cityId,
                    provinceId: address.provinceId,
                    countryId: address.countryId,
                    label: address.label,
                    isPrimary: false,
                  }
                );
              })
            );
          }

          // API returns single object, not array - keep the reordered state as is
          // The local state is already correct from the optimistic update
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

