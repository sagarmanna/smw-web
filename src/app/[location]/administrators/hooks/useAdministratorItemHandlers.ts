"use client";

import * as React from "react";
import { AdministratorEmail, AdministratorPhone, AdministratorAddress } from "../types";
import { toast } from "sonner";
import {
  deleteAdministratorEmail,
  deleteAdministratorPhone,
  deleteAdministratorAddress,
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
  onRefresh,
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
  }, [emailToDelete, location, entityId, updateEmails, onRefresh]);

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
  onRefresh,
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
  onRefresh,
}: UseAddressHandlersProps) {
  const [editingAddress, setEditingAddress] = React.useState<AdministratorAddress | null>(null);
  const [addressToDelete, setAddressToDelete] = React.useState<AdministratorAddress | null>(null);
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
    (id: string) => {
      const address = addresses.find((a) => a.id === id);
      if (!address) return;
      setAddressToDelete(address);
    },
    [addresses]
  );

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
    }
  }, [addressToDelete, location, entityId, updateAddresses]);

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
  };
}

