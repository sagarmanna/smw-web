"use client";

import * as React from "react";
import { ReusableModal } from "@/components/TablesModals";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { formatDateToISO } from "@/utils/dateUtils";
import { StudentData } from "../../tabConfigs";

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
  const normalize = (v?: string) => (typeof v === "string" ? v : "");
  const sanitizeName = (name?: string) => normalize(name).replace(/undefined/gi, "").replace(/\s+/g, " ").trim();
  const [formData, setFormData] = React.useState<StudentFormData>({
    firstName: "",
    lastName: "",
    customerName: sanitizeName(customerName),
    birthDate: "",
    gender: "not-specified",
  });

  const [errors, setErrors] = React.useState<Partial<StudentFormData>>({});
  const [birthdayDate, setBirthdayDate] = React.useState<Date | undefined>(undefined);

  // Keep customerName in sync when the prop changes (e.g., after data loads)
  React.useEffect(() => {
    const name = sanitizeName(customerName);
    setFormData((prev) => ({ ...prev, customerName: name }));
  }, [customerName, open]);

  // Sync birthdayDate with formData.birthDate when formData changes
  React.useEffect(() => {
    if (formData.birthDate) {
      try {
        // Parse ISO date string (YYYY-MM-DD) to Date object
        if (/^\d{4}-\d{2}-\d{2}$/.test(formData.birthDate)) {
          const [year, month, day] = formData.birthDate.split('-').map(Number);
          const dateObj = new Date(year, month - 1, day);
          if (!isNaN(dateObj.getTime())) {
            setBirthdayDate(dateObj);
            return;
          }
        }
        // Fallback: try parsing as regular date string
        const dateObj = new Date(formData.birthDate);
        if (!isNaN(dateObj.getTime())) {
          setBirthdayDate(dateObj);
        } else {
          setBirthdayDate(undefined);
        }
      } catch {
        setBirthdayDate(undefined);
      }
    } else {
      setBirthdayDate(undefined);
    }
  }, [formData.birthDate]);

  // Reset date picker when modal closes
  React.useEffect(() => {
    if (!open) {
      setBirthdayDate(undefined);
    }
  }, [open]);


  // Format date to "Feb 14, 2020" style for display
  const formatBirthDate = (dateString: string): string => {
    if (!dateString) return "";
    try {
      // If it's already in ISO format (YYYY-MM-DD), parse it
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return format(date, "MMM d, yyyy");
      }
      // Otherwise try to parse as is
      const date = new Date(dateString);
      return format(date, "MMM d, yyyy");
    } catch (error) {
      return dateString; // Return original if formatting fails
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Convert Date to ISO string (YYYY-MM-DD)
      const isoDate = formatDateToISO(date);
      setBirthdayDate(date);
      handleInputChange("birthDate", isoDate);
    } else {
      setBirthdayDate(undefined);
      handleInputChange("birthDate", "");
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

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required" as unknown as StudentFormData["lastName"];
    }

    if (!formData.customerName.trim()) {
      newErrors.customerName = "Customer name is required" as unknown as StudentFormData["customerName"];
    }

    // Birth date is optional; only validate when provided
    if (formData.birthDate) {
      const d = new Date(formData.birthDate);
      const valid = !isNaN(d.getTime());
      const today = new Date();
      if (!valid) {
        newErrors.birthDate = "Invalid birth date" as unknown as StudentFormData["birthDate"];
      } else if (d > today) {
        newErrors.birthDate = "Birth date cannot be in the future" as unknown as StudentFormData["birthDate"];
      }
    }

    if (!["not-specified", "male", "female"].includes(formData.gender)) {
      newErrors.gender = "Please select gender" as unknown as StudentFormData["gender"];
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
        customerName: sanitizeName(customerName),
        birthDate: "",
        gender: "not-specified",
      });
      setBirthdayDate(undefined);
      setErrors({});
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      customerName: sanitizeName(customerName),
      birthDate: "",
      gender: "not-specified",
    });
    setBirthdayDate(undefined);
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
      showFooter={true}
    >
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto px-6 pb-4">
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
              className={errors.lastName ? "border-red-500" : ""}
              placeholder="Enter last name"
            />
            {errors.lastName && (
              <p className="text-sm text-red-500">{errors.lastName as unknown as string}</p>
            )}
          </div>

          {/* Customer Name */}
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) => handleInputChange("customerName", e.target.value)}
              className={errors.customerName ? "border-red-500" : ""}
              placeholder="Enter customer name"
              readOnly
              disabled
            />
            {errors.customerName && (
              <p className="text-sm text-red-500">{errors.customerName as unknown as string}</p>
            )}
          </div>

          {/* Birth Date */}
          <DatePicker
            id="birthDate"
            label="Birth Date"
            value={birthdayDate}
            onSelect={handleDateSelect}
            placeholder="Pick a date"
            error={!!errors.birthDate}
            errorMessage={errors.birthDate as string | undefined}
            fromYear={1955}
            toYear={2125}
          />

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
            {errors.gender && (
              <p className="text-sm text-red-500">{errors.gender as unknown as string}</p>
            )}
          </div>
        </div>
      </div>
    </ReusableModal>
  );
}