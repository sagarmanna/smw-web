"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createUserByRole, CreateUserRequest, CreateUserErrorResponse } from "@/lib/api/user.api";

interface AddStaffMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  location: string;
}

export function AddStaffMemberModal({ isOpen, onClose, onSuccess, location }: AddStaffMemberModalProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields - same validation as admin module
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First Name cannot be blank.";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    } else if (formData.firstName.trim().length > 255) {
      newErrors.firstName = "First name must not exceed 255 characters";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last Name cannot be blank.";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    } else if (formData.lastName.trim().length > 255) {
      newErrors.lastName = "Last name must not exceed 255 characters";
    }

    // Email is optional; only validate format and length when provided
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address";
      } else if (formData.email.trim().length > 255) {
        newErrors.email = "Email must not exceed 255 characters";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const payload: CreateUserRequest = {
        firstname: formData.firstName.trim(),
        lastname: formData.lastName.trim(),
        email: formData.email.trim(),
      };

      const response = await createUserByRole(location, "staffmember", payload);

      toast.success(response.message || "Staff member created successfully!");
      onSuccess?.();
      onClose();

      resetForm();

      router.push(`/${location}/staff-members/${response.data.id}`);
    } catch (error: unknown) {
      const apiError = error as CreateUserErrorResponse;
      const errorMessage = apiError.message || "Failed to add staff member";

      toast.error(errorMessage);

      if (apiError.errorCode === "BAD_REQUEST") {
        console.error("Validation error:", errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    if (field === "email") {
      const trimmedEmail = value.trim();
      if (trimmedEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
          setErrors((prev) => ({ ...prev, email: "Please enter a valid email address" }));
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            if (newErrors.email === "Please enter a valid email address" || newErrors.email === "Email must not exceed 255 characters") {
              delete newErrors.email;
            }
            return newErrors;
          });
        }
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.email;
          return newErrors;
        });
      }
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Staff Members / Add</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">
              First Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              placeholder="Enter first name"
              className={errors.firstName ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {errors.firstName && (
              <p className="text-sm text-red-500">{errors.firstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">
              Last Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              placeholder="Enter last name"
              className={errors.lastName ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {errors.lastName && (
              <p className="text-sm text-red-500">{errors.lastName}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">
              Email (Work)
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter email address"
              className={errors.email ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

