"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { createUserByRole, CreateUserRequest, CreateUserErrorResponse } from "@/lib/api/user.api";

interface AddAdministratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  location: string;
}

export function AddAdministratorModal({ isOpen, onClose, onSuccess, location }: AddAdministratorModalProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);

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

    // Don't override existing email errors (like duplicate email)
    if (!errors.email) {
      setErrors(newErrors);
    } else {
      setErrors(prev => ({ ...prev, ...newErrors }));
    }
    
    // Check if there are any errors (including existing ones)
    const allErrors = { ...errors, ...newErrors };
    return Object.keys(allErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Prepare request payload
      const payload: CreateUserRequest = {
        firstname: formData.firstName.trim(),
        lastname: formData.lastName.trim(),
        email: formData.email.trim(),
      };

      const response = await createUserByRole(location, 'administrator', payload);
      
      toast.success(response.message || "Administrator created successfully!");
      onSuccess?.();
      onClose();
      
      // Reset form
      resetForm();

      // Redirect to administrator detail page
      router.push(`/${location}/administrators/${response.data.id}`);
    } catch (error: unknown) {
      const apiError = error as CreateUserErrorResponse;
      const errorMessage = apiError.message || "Failed to add administrator";
      
      // Show specific error message
      toast.error(errorMessage);
      
      // If there are field-specific errors, set them
      if (apiError.errorCode === 'BAD_REQUEST') {
        console.error('Validation error:', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = async (email: string) => {
    // Basic email format validation first
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return; // Don't validate format, let the form validation handle it
    }

    try {
      setIsValidatingEmail(true);
      // Check if email exists for any role in the location
      const response = await apiClient.get(`/admin/v2/${location}/user/validate-email?email=${encodeURIComponent(email)}`);
      
      if (response.data?.success) {
        const { exists } = response.data.data;
        if (exists) {
          setErrors(prev => ({ ...prev, email: "This email is already registered in this location" }));
        } else {
          // Clear email error if it was a duplicate error
          if (errors.email && errors.email.includes("already registered")) {
            setErrors(prev => ({ ...prev, email: "" }));
          }
        }
      }
    } catch {
      // Don't show error to user for validation failures
    } finally {
      setIsValidatingEmail(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Validate email in real-time when user types
    if (field === 'email') {
      const trimmedEmail = value.trim();
      if (trimmedEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
          // Show format error while typing
          setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }));
        } else {
          // Clear format error and validate with API
          setErrors(prev => {
            const newErrors = { ...prev };
            // Only clear if it was a format error, not a duplicate error
            if (newErrors.email === "Please enter a valid email address") {
              delete newErrors.email;
            }
            return newErrors;
          });
          validateEmail(trimmedEmail);
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
          <DialogTitle>Administrators / Add</DialogTitle>
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
              Email (Work) <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter email address"
                className={errors.email ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {isValidatingEmail && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || isValidatingEmail}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

