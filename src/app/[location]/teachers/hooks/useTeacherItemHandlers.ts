"use client";

import * as React from "react";
import { TeacherEmail, TeacherPhone, TeacherAddress, TeacherQualification } from "../types";
import { deleteTeacherEmail, deleteTeacherPhone, deleteTeacherAddress } from "../[id]/teachers-details.api";
import { toast } from "sonner";

interface UseEmailHandlersProps {
  emails: TeacherEmail[];
  updateEmails: React.Dispatch<React.SetStateAction<TeacherEmail[]>>;
  location: string;
  teacherId: number;
  onRefresh?: () => Promise<void>;
}

export function useEmailHandlers({
  emails,
  updateEmails,
  location,
  teacherId,
  onRefresh,
}: UseEmailHandlersProps) {
  const [editingEmail, setEditingEmail] = React.useState<TeacherEmail | null>(null);
  const [emailToDelete, setEmailToDelete] = React.useState<TeacherEmail | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

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
    async (id: string) => {
      const email = emails.find((e) => e.id === id);
      if (!email) return;

      setIsDeleting(true);
      
      try {
        const result = await deleteTeacherEmail(location, teacherId, id);
        
        if (result?.success) {
          toast.success("Email deleted successfully");
          
          // Update local state
          updateEmails((prev) => prev.filter((email) => email.id !== id));
          
          // Refresh from server to get latest data
          if (onRefresh) {
            await onRefresh();
          }
        } else {
          toast.error(result?.message || "Failed to delete email");
        }
      } catch (error) {
        console.error("Error deleting email:", error);
        toast.error("Failed to delete email");
      } finally {
        setIsDeleting(false);
        setEmailToDelete(null);
      }
    },
    [emails, location, teacherId, updateEmails, onRefresh]
  );

  const handleDeleteConfirm = React.useCallback(() => {
    if (emailToDelete) {
      handleDelete(emailToDelete.id);
    }
  }, [emailToDelete, handleDelete]);

  return {
    editingEmail,
    emailToDelete,
    setEditingEmail,
    setEmailToDelete,
    handleCreate,
    handleEdit,
    handleDelete,
    handleDeleteConfirm,
    isDeleting,
  };
}

interface UsePhoneHandlersProps {
  phones: TeacherPhone[];
  updatePhones: React.Dispatch<React.SetStateAction<TeacherPhone[]>>;
  location: string;
  teacherId: number;
  onRefresh?: () => Promise<void>;
}

export function usePhoneHandlers({
  phones,
  updatePhones,
  location,
  teacherId,
  onRefresh,
}: UsePhoneHandlersProps) {
  const [editingPhone, setEditingPhone] = React.useState<TeacherPhone | null>(null);
  const [phoneToDelete, setPhoneToDelete] = React.useState<TeacherPhone | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

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
    async (id: string) => {
      const phone = phones.find((p) => p.id === id);
      if (!phone) return;

      setIsDeleting(true);

      try {
        const result = await deleteTeacherPhone(location, teacherId, id);

        if (result?.success) {
          toast.success("Phone deleted successfully");

          // Update local state
          updatePhones((prev) => prev.filter((phoneItem) => phoneItem.id !== id));

          // Refresh from server to get latest data
          if (onRefresh) {
            await onRefresh();
          }
        } else {
          toast.error(result?.message || "Failed to delete phone");
        }
      } catch (error) {
        console.error("Error deleting phone:", error);
        toast.error("Failed to delete phone");
      } finally {
        setIsDeleting(false);
        setPhoneToDelete(null);
      }
    },
    [phones, location, teacherId, updatePhones, onRefresh]
  );

  const handleDeleteConfirm = React.useCallback(() => {
    if (phoneToDelete) {
      handleDelete(phoneToDelete.id);
    }
  }, [phoneToDelete, handleDelete]);

  return {
    editingPhone,
    phoneToDelete,
    setEditingPhone,
    setPhoneToDelete,
    handleCreate,
    handleEdit,
    handleDelete,
    handleDeleteConfirm,
    isDeleting,
  };
}

interface UseAddressHandlersProps {
  addresses: TeacherAddress[];
  updateAddresses: React.Dispatch<React.SetStateAction<TeacherAddress[]>>;
  location: string;
  teacherId: number;
  onRefresh?: () => Promise<void>;
}

export function useAddressHandlers({
  addresses,
  updateAddresses,
  location,
  teacherId,
  onRefresh,
}: UseAddressHandlersProps) {
  const [editingAddress, setEditingAddress] = React.useState<TeacherAddress | null>(null);
  const [addressToDelete, setAddressToDelete] = React.useState<TeacherAddress | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

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
    async (id: string) => {
      const address = addresses.find((a) => a.id === id);
      if (!address) return;

      setIsDeleting(true);
      
      try {
        const result = await deleteTeacherAddress(location, teacherId, id);
        
        if (result?.success) {
          toast.success("Address deleted successfully");
          
          // Update local state
          updateAddresses((prev) => prev.filter((address) => address.id !== id));
          
          // Refresh from server to get latest data
          if (onRefresh) {
            await onRefresh();
          }
        } else {
          toast.error(result?.message || "Failed to delete address");
        }
      } catch (error) {
        console.error("Error deleting address:", error);
        toast.error("Failed to delete address");
      } finally {
        setIsDeleting(false);
        setAddressToDelete(null);
      }
    },
    [addresses, location, teacherId, updateAddresses, onRefresh]
  );

  const handleDeleteConfirm = React.useCallback(() => {
    if (addressToDelete) {
      handleDelete(addressToDelete.id);
    }
  }, [addressToDelete, handleDelete]);

  return {
    editingAddress,
    addressToDelete,
    setEditingAddress,
    setAddressToDelete,
    handleCreate,
    handleEdit,
    handleDelete,
    handleDeleteConfirm,
    isDeleting,
  };
}

interface UseQualificationHandlersProps {
  qualifications: TeacherQualification[];
  updateQualifications: React.Dispatch<React.SetStateAction<TeacherQualification[]>>;
}

export function useQualificationHandlers({
  qualifications,
  updateQualifications,
}: UseQualificationHandlersProps) {
  const [editingQualification, setEditingQualification] = React.useState<TeacherQualification | null>(null);
  const [qualificationToDelete, setQualificationToDelete] = React.useState<TeacherQualification | null>(null);

  const handleCreate = React.useCallback(
    (newQualification: TeacherQualification) => {
      updateQualifications((prev) => {
        if (editingQualification) {
          return prev.map((qualification) =>
            qualification.id === editingQualification.id ? newQualification : qualification
          );
        } else {
          return [...prev, newQualification];
        }
      });
      setEditingQualification(null);
    },
    [updateQualifications, editingQualification]
  );

  const handleEdit = React.useCallback((qualification: TeacherQualification) => {
    setEditingQualification(qualification);
  }, []);

  const handleDelete = React.useCallback(
    (id: string) => {
      const qualification = qualifications.find((q) => q.id === id);
      if (qualification) {
        setQualificationToDelete(qualification);
      }
    },
    [qualifications]
  );

  const handleDeleteConfirm = React.useCallback(() => {
    if (qualificationToDelete) {
      updateQualifications((prev) => prev.filter((qualification) => qualification.id !== qualificationToDelete.id));
      setQualificationToDelete(null);
    }
  }, [qualificationToDelete, updateQualifications]);

  return {
    editingQualification,
    qualificationToDelete,
    setEditingQualification,
    setQualificationToDelete,
    handleCreate,
    handleEdit,
    handleDelete,
    handleDeleteConfirm,
  };
}

