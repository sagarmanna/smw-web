"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReusableModal } from "@/components/TablesModals";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useRouter } from "next/navigation";

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  location: string;
}

interface ReferralSource {
  id: number;
  name: string;
}

export function AddCustomerModal({ isOpen, onClose, onSuccess, location }: AddCustomerModalProps) {
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    firstname: "",
    lastname: "",
    email: "",
    referralSourceId: "",
    description: "",
  });
  const [referralSources, setReferralSources] = React.useState<ReferralSource[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Load referral sources when modal opens
  React.useEffect(() => {
    if (isOpen) {
      loadReferralSources();
    }
  }, [isOpen]);

  const loadReferralSources = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/admin/v2/referral-sources`);
      if (response.data?.success) {
        setReferralSources(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to load referral sources:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstname.trim()) {
      newErrors.firstname = "First name is required";
    }

    if (!formData.lastname.trim()) {
      newErrors.lastname = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await apiClient.post(`/admin/v2/${location}/customers`, {
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        email: formData.email.trim(),
        referralSourceId: formData.referralSourceId ? parseInt(formData.referralSourceId) : null,
        description: formData.description.trim(),
      });

      if (response.data?.success) {
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          firstname: "",
          lastname: "",
          email: "",
          referralSourceId: "",
          description: "",
        });
        setErrors({});
        
        // Redirect to the customer detail page
        const customerId = response.data.data?.id;
        if (customerId) {
          router.push(`customers/${customerId}`);
        }
      } else {
        setErrors({ submit: response.data?.message || "Failed to create customer" });
      }
    } catch (error: unknown) {
      console.error("Failed to create customer:", error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { errors?: Record<string, string>; message?: string } } };
        if (axiosError.response?.data?.errors) {
          setErrors(axiosError.response.data.errors);
        } else {
          setErrors({ submit: axiosError.response?.data?.message || "Failed to create customer" });
        }
      } else {
        setErrors({ submit: "Failed to create customer" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      // Reset form when closing
      setFormData({
        firstname: "",
        lastname: "",
        email: "",
        referralSourceId: "",
        description: "",
      });
      setErrors({});
    }
  };

  const handleModalSubmit = () => {
    // Create a synthetic event for the form submission
    const syntheticEvent = {
      preventDefault: () => {},
      stopPropagation: () => {}
    } as React.FormEvent;
    handleSubmit(syntheticEvent);
  };

  const modalActions = [
    {
      label: "Cancel",
      onClick: handleClose,
      variant: "outline" as const,
      disabled: isSubmitting
    },
    {
      label: isSubmitting ? "Creating..." : "Create Customer",
      onClick: handleModalSubmit,
      variant: "default" as const,
      disabled: isSubmitting,
      className: "bg-primary hover:bg-primary/90"
    }
  ];

  return (
    <ReusableModal
      open={isOpen}
      onOpenChange={handleClose}
      title="Add Customer"
      size="md"
      actions={modalActions}
      showFooter={true}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstname">First Name *</Label>
            <Input
              id="firstname"
              value={formData.firstname}
              onChange={(e) => handleInputChange("firstname", e.target.value)}
              placeholder="Enter first name"
              disabled={isSubmitting}
              className={errors.firstname ? "border-red-600 dark:border-red-400" : ""}
            />
            {errors.firstname && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.firstname}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastname">Last Name *</Label>
            <Input
              id="lastname"
              value={formData.lastname}
              onChange={(e) => handleInputChange("lastname", e.target.value)}
              placeholder="Enter last name"
              disabled={isSubmitting}
              className={errors.lastname ? "border-red-600 dark:border-red-400" : ""}
            />
            {errors.lastname && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.lastname}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="Enter email address"
            disabled={isSubmitting}
            className={errors.email ? "border-red-600 dark:border-red-400" : ""}
          />
          {errors.email && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="referralSource">How did you find us?</Label>
          <Select
            value={formData.referralSourceId}
            onValueChange={(value) => handleInputChange("referralSourceId", value)}
            disabled={isSubmitting || isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select referral source" />
            </SelectTrigger>
            <SelectContent>
              {referralSources.map((source) => (
                <SelectItem key={source.id} value={source.id.toString()}>
                  {source.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isLoading && (
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading referral sources...</p>
          )}
        </div>

        {formData.referralSourceId && (() => {
          const selectedSource = referralSources.find(source => source.id.toString() === formData.referralSourceId);
          const isOther = selectedSource?.name?.toLowerCase().includes('other');
          
          return isOther ? (
            <div className="space-y-2">
              <Label htmlFor="description">Additional Details</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter additional details (optional)"
                disabled={isSubmitting}
              />
            </div>
          ) : null;
        })()}

        {errors.submit && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
          </div>
        )}

        {isSubmitting && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </form>
    </ReusableModal>
  );
}
