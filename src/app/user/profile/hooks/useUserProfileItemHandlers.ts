"use client";

import * as React from "react";
import { toast } from "sonner";
import type { GenericAddress, GenericEmail, GenericPhone } from "@/components/user-details/types/common";

export function useEmailHandlers(props: {
  emails: GenericEmail[];
  updateEmails: React.Dispatch<React.SetStateAction<GenericEmail[]>>;
}) {
  const { emails, updateEmails } = props;
  const [editingEmail, setEditingEmail] = React.useState<GenericEmail | null>(null);
  const [emailToDelete, setEmailToDelete] = React.useState<GenericEmail | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleCreate = React.useCallback(
    (newEmail: GenericEmail) => {
      updateEmails((prev) => {
        const base = newEmail.isPrimary ? prev.map((e) => ({ ...e, isPrimary: false })) : prev;
        if (editingEmail) {
          return base.map((e) => (e.id === editingEmail.id ? newEmail : e));
        }
        return [...base, newEmail];
      });
      setEditingEmail(null);
    },
    [updateEmails, editingEmail]
  );

  const handleEdit = React.useCallback((email: GenericEmail) => setEditingEmail(email), []);

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
    if (!emailToDelete) return;
    setIsDeleting(true);
    try {
      updateEmails((prev) => prev.filter((e) => e.id !== emailToDelete.id));
      toast.success("Email deleted");
    } finally {
      setIsDeleting(false);
      setEmailToDelete(null);
    }
  }, [emailToDelete, updateEmails]);

  return {
    editingEmail,
    setEditingEmail,
    handleCreate,
    handleEdit,
    requestDelete,
    emailToDelete,
    setEmailToDelete,
    handleDeleteConfirm,
    isDeleting,
  };
}

export function usePhoneHandlers(props: {
  phones: GenericPhone[];
  updatePhones: React.Dispatch<React.SetStateAction<GenericPhone[]>>;
}) {
  const { phones, updatePhones } = props;
  const [editingPhone, setEditingPhone] = React.useState<GenericPhone | null>(null);
  const [phoneToDelete, setPhoneToDelete] = React.useState<GenericPhone | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleCreate = React.useCallback(
    (newPhone: GenericPhone) => {
      updatePhones((prev) => {
        if (editingPhone) {
          return prev.map((p) => (p.id === editingPhone.id ? newPhone : p));
        }
        return [...prev, newPhone];
      });
      setEditingPhone(null);
    },
    [updatePhones, editingPhone]
  );

  const handleEdit = React.useCallback((phone: GenericPhone) => setEditingPhone(phone), []);

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
    setIsDeleting(true);
    try {
      updatePhones((prev) => prev.filter((p) => p.id !== phoneToDelete.id));
      toast.success("Phone deleted");
    } finally {
      setIsDeleting(false);
      setPhoneToDelete(null);
    }
  }, [phoneToDelete, updatePhones]);

  return {
    editingPhone,
    setEditingPhone,
    handleCreate,
    handleEdit,
    requestDelete,
    phoneToDelete,
    setPhoneToDelete,
    handleDeleteConfirm,
    isDeleting,
  };
}

export function useAddressHandlers(props: {
  addresses: GenericAddress[];
  updateAddresses: React.Dispatch<React.SetStateAction<GenericAddress[]>>;
}) {
  const { addresses, updateAddresses } = props;
  const [editingAddress, setEditingAddress] = React.useState<GenericAddress | null>(null);
  const [addressToDelete, setAddressToDelete] = React.useState<GenericAddress | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleCreate = React.useCallback(
    (newAddress: GenericAddress) => {
      updateAddresses((prev) => {
        const base = newAddress.isPrimary ? prev.map((a) => ({ ...a, isPrimary: false })) : prev;
        if (editingAddress) {
          return base.map((a) => (a.id === editingAddress.id ? newAddress : a));
        }
        return [...base, newAddress];
      });
      setEditingAddress(null);
    },
    [updateAddresses, editingAddress]
  );

  const handleEdit = React.useCallback((address: GenericAddress) => setEditingAddress(address), []);

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
    setIsDeleting(true);
    try {
      updateAddresses((prev) => prev.filter((a) => a.id !== addressToDelete.id));
      toast.success("Address deleted");
    } finally {
      setIsDeleting(false);
      setAddressToDelete(null);
    }
  }, [addressToDelete, updateAddresses]);

  return {
    editingAddress,
    setEditingAddress,
    handleCreate,
    handleEdit,
    requestDelete,
    addressToDelete,
    setAddressToDelete,
    handleDeleteConfirm,
    isDeleting,
  };
}

