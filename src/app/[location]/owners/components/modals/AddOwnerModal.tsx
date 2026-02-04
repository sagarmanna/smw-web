"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUserByRole, CreateUserRequest, CreateUserErrorResponse } from "@/lib/api/user.api";

interface AddOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  location: string;
}

export function AddOwnerModal({ isOpen, onClose, onSuccess, location }: AddOwnerModalProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({ firstName: "", lastName: "", email: "" });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
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

    if (!formData.email.trim()) {
      newErrors.email = "Email cannot be blank.";
    } else {
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

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const payload: CreateUserRequest = {
        firstname: formData.firstName.trim(),
        lastname: formData.lastName.trim(),
        email: formData.email.trim(),
      };

      const response = await createUserByRole(location, "owner", payload);

      toast.success(response.message || "Owner created successfully!");
      onSuccess?.();
      onClose();
      resetForm();

      router.push(`/${location}/owners/${response.data.id}`);
    } catch (error: unknown) {
      const apiError = error as CreateUserErrorResponse;
      const errorMessage = apiError.message || "Failed to add owner";

      toast.error(errorMessage);

      if (apiError.errorCode === "BAD_REQUEST") {
        console.error("Validation error:", errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
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
            const next = { ...prev };
            if (next.email === "Please enter a valid email address") {
              delete next.email;
            }
            return next;
          });
        }
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
          <DialogTitle>Owners / Add</DialogTitle>
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
            {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
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
            {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email (Work) <span className="text-red-500">*</span>
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
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
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