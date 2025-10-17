"use client";

import * as React from "react";
import { ReusableModal } from "@/components/TablesModals";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StudentData } from "../../tabConfigs";
import { format } from "date-fns";

interface AddStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (studentData: StudentData) => void;
  customerName?: string;
}

interface StudentFormData {
  firstName: string;
  lastName: string;
  customerName: string; 
  birthDate: string;
  gender: "not-specified" | "male" | "female";
}

export default function AddStudentModal({ open, onOpenChange, onSave, customerName }: AddStudentModalProps) {
  const [formData, setFormData] = React.useState<StudentFormData>({
    firstName: "",
    lastName: "",
    customerName: customerName || "",
    birthDate: "",
    gender: "not-specified",
  });

  const [errors, setErrors] = React.useState<Partial<StudentFormData>>({});

  // Format date to "Feb 14, 2020" style
  const formatBirthDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM d, yyyy");
    } catch (error) {
      return dateString; // Return original if formatting fails
    }
  };

  const handleInputChange = (field: keyof StudentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<StudentFormData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.birthDate) {
      newErrors.birthDate = "Birth date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      const studentData: StudentData = {
        id: Date.now(), // Temporary ID for new students
        fullName: `${formData.firstName} ${formData.lastName}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        birthDate: formatBirthDate(formData.birthDate),
        customerName: formData.customerName,
        gender: formData.gender,
        status: 1 // 1 = Active
      };
      
      onSave(studentData);
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        customerName: customerName || "",
        birthDate: "",
        gender: "not-specified",
      });
      setErrors({});
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      customerName: customerName || "",
      birthDate: "",
      gender: "not-specified",
    });
    setErrors({});
    onOpenChange(false);
  };

  const modalActions = [
    {
      label: "Cancel",
      onClick: handleCancel,
      variant: "outline" as const,
    },
    {
      label: "Save",
      onClick: handleSave,
      variant: "default" as const,
    },
  ];

  return (
    <ReusableModal
      open={open}
      onOpenChange={onOpenChange}
      title="Add Student"
      size="md"
      actions={modalActions}
    >
      <div className="space-y-4">
        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            className={errors.firstName ? "border-red-500" : ""}
            placeholder="Enter first name"
          />
          {errors.firstName && (
            <p className="text-sm text-red-500">{errors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            placeholder="Enter last name"
          />
        </div>

        {/* Customer Name */}
        <div className="space-y-2">
          <Label htmlFor="customerName">Customer Name</Label>
          <Input
            id="customerName"
            value={formData.customerName}
            onChange={(e) => handleInputChange("customerName", e.target.value)}
            placeholder="Enter customer name"
          />
        </div>

        {/* Birth Date */}
        <div className="space-y-2">
          <Label htmlFor="birthDate">Birth Date</Label>
          <Input
            id="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={(e) => handleInputChange("birthDate", e.target.value)}
            className={errors.birthDate ? "border-red-500" : ""}
          />
          {errors.birthDate && (
            <p className="text-sm text-red-500">{errors.birthDate}</p>
          )}
        </div>

        {/* Gender */}
        <div className="space-y-3">
          <Label>Gender</Label>
          <RadioGroup
            value={formData.gender}
            onValueChange={(value) => handleInputChange("gender", value)}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="not-specified" id="not-specified" />
              <Label htmlFor="not-specified">Not Specified</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female">Female</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </ReusableModal>
  );
}
