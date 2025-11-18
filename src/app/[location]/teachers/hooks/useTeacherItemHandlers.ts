"use client";

import * as React from "react";
import { TeacherEmail, TeacherPhone, TeacherAddress } from "../types";

interface UseEmailHandlersProps {
  emails: TeacherEmail[];
  updateEmails: React.Dispatch<React.SetStateAction<TeacherEmail[]>>;
}

export function useEmailHandlers({
  emails,
  updateEmails,
}: UseEmailHandlersProps) {
  const [editingEmail, setEditingEmail] = React.useState<TeacherEmail | null>(null);
  const [emailToDelete, setEmailToDelete] = React.useState<TeacherEmail | null>(null);

  const handleCreate = React.useCallback(
    (newEmail: TeacherEmail) => {
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

  const handleEdit = React.useCallback((email: TeacherEmail) => {
    setEditingEmail(email);
  }, []);

  const handleDelete = React.useCallback(
    (id: string) => {
      const email = emails.find((e) => e.id === id);
      if (email) {
        setEmailToDelete(email);
      }
    },
    [emails]
  );

  const handleDeleteConfirm = React.useCallback(() => {
    if (emailToDelete) {
      updateEmails((prev) => prev.filter((email) => email.id !== emailToDelete.id));
      setEmailToDelete(null);
    }
  }, [emailToDelete, updateEmails]);

  return {
    editingEmail,
    emailToDelete,
    setEditingEmail,
    setEmailToDelete,
    handleCreate,
    handleEdit,
    handleDelete,
    handleDeleteConfirm,
  };
}

interface UsePhoneHandlersProps {
  phones: TeacherPhone[];
  updatePhones: React.Dispatch<React.SetStateAction<TeacherPhone[]>>;
}

export function usePhoneHandlers({
  phones,
  updatePhones,
}: UsePhoneHandlersProps) {
  const [editingPhone, setEditingPhone] = React.useState<TeacherPhone | null>(null);
  const [phoneToDelete, setPhoneToDelete] = React.useState<TeacherPhone | null>(null);

  const handleCreate = React.useCallback(
    (newPhone: TeacherPhone) => {
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

  const handleEdit = React.useCallback((phone: TeacherPhone) => {
    setEditingPhone(phone);
  }, []);

  const handleDelete = React.useCallback(
    (id: string) => {
      const phone = phones.find((p) => p.id === id);
      if (phone) {
        setPhoneToDelete(phone);
      }
    },
    [phones]
  );

  const handleDeleteConfirm = React.useCallback(() => {
    if (phoneToDelete) {
      updatePhones((prev) => prev.filter((phone) => phone.id !== phoneToDelete.id));
      setPhoneToDelete(null);
    }
  }, [phoneToDelete, updatePhones]);

  return {
    editingPhone,
    phoneToDelete,
    setEditingPhone,
    setPhoneToDelete,
    handleCreate,
    handleEdit,
    handleDelete,
    handleDeleteConfirm,
  };
}

interface UseAddressHandlersProps {
  addresses: TeacherAddress[];
  updateAddresses: React.Dispatch<React.SetStateAction<TeacherAddress[]>>;
}

export function useAddressHandlers({
  addresses,
  updateAddresses,
}: UseAddressHandlersProps) {
  const [editingAddress, setEditingAddress] = React.useState<TeacherAddress | null>(null);
  const [addressToDelete, setAddressToDelete] = React.useState<TeacherAddress | null>(null);

  const handleCreate = React.useCallback(
    (newAddress: TeacherAddress) => {
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

  const handleEdit = React.useCallback((address: TeacherAddress) => {
    setEditingAddress(address);
  }, []);

  const handleDelete = React.useCallback(
    (id: string) => {
      const address = addresses.find((a) => a.id === id);
      if (address) {
        setAddressToDelete(address);
      }
    },
    [addresses]
  );

  const handleDeleteConfirm = React.useCallback(() => {
    if (addressToDelete) {
      updateAddresses((prev) => prev.filter((address) => address.id !== addressToDelete.id));
      setAddressToDelete(null);
    }
  }, [addressToDelete, updateAddresses]);

  return {
    editingAddress,
    addressToDelete,
    setEditingAddress,
    setAddressToDelete,
    handleCreate,
    handleEdit,
    handleDelete,
    handleDeleteConfirm,
  };
}

