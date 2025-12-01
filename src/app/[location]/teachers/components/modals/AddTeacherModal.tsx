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
import { createTeacherUser, CreateUserRequest, CreateUserErrorResponse } from "@/lib/api/user.api";

interface AddTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  location: string;
}

export function AddTeacherModal({ isOpen, onClose, onSuccess, location }: AddTeacherModalProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.firstname.trim()) {
      newErrors.firstname = "First Name cannot be blank.";
    } else if (formData.firstname.trim().length < 2) {
      newErrors.firstname = "First name must be at least 2 characters";
    } else if (formData.firstname.trim().length > 255) {
      newErrors.firstname = "First name must not exceed 255 characters";
    }

    if (!formData.lastname.trim()) {
      newErrors.lastname = "Last Name cannot be blank.";
    } else if (formData.lastname.trim().length < 2) {
      newErrors.lastname = "Last name must be at least 2 characters";
    } else if (formData.lastname.trim().length > 255) {
      newErrors.lastname = "Last name must not exceed 255 characters";
    }

    // Email validation (optional but must be valid if provided)
    if (formData.email.trim()) {
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
      // Prepare request payload (only include non-empty optional fields)
      const payload: CreateUserRequest = {
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        ...(formData.email.trim() && { email: formData.email.trim() }),
      };

      const response = await createTeacherUser(location, payload);
      
      toast.success(response.message || "Teacher added successfully!");
      onSuccess?.();
      onClose();
      
      // Reset form
      setFormData({
        firstname: "",
        lastname: "",
        email: "",
      });

      // Redirect to teacher detail page
      router.push(`/${location}/teachers/${response.data.id}`);
    } catch (error: unknown) {
      const apiError = error as CreateUserErrorResponse;
      const errorMessage = apiError.message || "Failed to add teacher";
      
      // Show specific error message
      toast.error(errorMessage);
      
      // If there are field-specific errors, set them
      if (apiError.errorCode === 'BAD_REQUEST') {
        // Backend validation errors might be in the message
        // We can parse them if needed, but for now just show the message
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
      // Don't pass role parameter - check all roles to match create teacher API behavior
      // The create teacher API checks if email exists for ANY role in the location
      const response = await apiClient.get(`/admin/v2/${location}/user/validate-email?email=${encodeURIComponent(email)}`);
      
      if (response.data?.success) {
        const { exists } = response.data.data;
        if (exists) {
          setErrors(prev => ({ ...prev, email: "This email is already registered for a teacher in this location" }));
        } else {
          // Clear email error if it was a duplicate error
          if (errors.email && errors.email.includes("already registered")) {
            setErrors(prev => ({ ...prev, email: "" }));
          }
        }
      }
    } catch (_error) {
      // Don't show error to user for validation failures, just log it
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
    if (field === 'email' && value.trim()) {
      validateEmail(value.trim());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Teacher</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstname">
              First Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="firstname"
              value={formData.firstname}
              onChange={(e) => handleInputChange("firstname", e.target.value)}
              placeholder="Enter first name"
              required
              className={errors.firstname ? "border-red-500" : ""}
            />
            {errors.firstname && (
              <p className="text-sm text-red-500">{errors.firstname}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastname">
              Last Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lastname"
              value={formData.lastname}
              onChange={(e) => handleInputChange("lastname", e.target.value)}
              placeholder="Enter last name"
              required
              className={errors.lastname ? "border-red-500" : ""}
            />
            {errors.lastname && (
              <p className="text-sm text-red-500">{errors.lastname}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email (Work)</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter email address"
                disabled={isLoading}
                className={errors.email ? "border-red-500" : ""}
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
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
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
