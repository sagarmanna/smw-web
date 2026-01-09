"use client";

import * as React from "react";
import { StaffMemberEmail, StaffMemberPhone, StaffMemberAddress } from "../types";
import { toast } from "sonner";

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
  // location, staffMemberId, entityId, onRefresh - Reserved for future API integration
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

    // Local state update only - DELETE API not ready yet
    updateEmails((prev) => prev.filter((email) => email.id !== id));
    toast.success("Email deleted locally");
    
    setIsDeleting(false);
    setEmailToDelete(null);
  }, [emailToDelete, updateEmails]);

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
  // location, staffMemberId, entityId, onRefresh - Reserved for future API integration
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
    if (!phoneToDelete) return;

    const id = phoneToDelete.id;
    setIsDeleting(true);

    // Local state update only - DELETE API not ready yet
    updatePhones((prev) => prev.filter((phoneItem) => phoneItem.id !== id));
    toast.success("Phone deleted locally");
    
    setIsDeleting(false);
    setPhoneToDelete(null);
  }, [phoneToDelete, updatePhones]);

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
  // location, staffMemberId, entityId, onRefresh - Reserved for future API integration
}: UseAddressHandlersProps) {
  const [editingAddress, setEditingAddress] = React.useState<StaffMemberAddress | null>(null);
  const [addressToDelete, setAddressToDelete] = React.useState<StaffMemberAddress | null>(null);
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

    // Local state update only - DELETE API not ready yet
    updateAddresses((prev) => prev.filter((address) => address.id !== id));
    toast.success("Address deleted locally");
    
    setIsDeleting(false);
    setAddressToDelete(null);
  }, [addressToDelete, updateAddresses]);

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

