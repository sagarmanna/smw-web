// StudentDetailsCard.tsx - Reusable Details Card Component with Edit Modal
import * as React from "react";
import { Edit, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyValueDisplay } from "@/components/KeyValueDisplay";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ReusableModal } from "@/components/TablesModals";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StudentDetailsCardProps {
  firstName: string;
  lastName: string;
  birthday?: string;
  age?: string;
  gender?: string;
  status: string;
  notes?: string;
  onEdit?: (data: {
    firstName: string;
    lastName: string;
    birthday: string;
    gender: string;
    notes: string;
    age: string;
  }) => void;
  onDelete?: () => void;
  onMerge?: () => void;
  loading?: boolean;
  className?: string;
}

export function StudentDetailsCard({
  firstName,
  lastName,
  birthday,
  age,
  gender,
  status,
  notes,
  onEdit,
  onDelete,
  onMerge,
  loading = false,
  className,
}: StudentDetailsCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editForm, setEditForm] = React.useState({
    firstName: firstName || "",
    lastName: lastName || "",
    birthday: "",
    gender: gender || "",
    notes: notes || "",
  });
  const [calculatedAge, setCalculatedAge] = React.useState(age || "");
  
  const [showError, setShowError] = React.useState(false);
  const [firstNameTouched, setFirstNameTouched] = React.useState(false);
  const [lastNameTouched, setLastNameTouched] = React.useState(false);

  React.useEffect(() => {
    // Convert birthday to YYYY-MM-DD format if it exists
    let formattedBirthday = "";
    if (birthday) {
      // Handle various date formats
      const date = new Date(birthday);
      if (!isNaN(date.getTime())) {
        // Add timezone offset to prevent date shifting
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
        formattedBirthday = adjustedDate.toISOString().split('T')[0];
      }
    }
    
    setEditForm({
      firstName: firstName || "",
      lastName: lastName || "",
      birthday: formattedBirthday,
      gender: gender || "",
      notes: notes || "",
    });
    setCalculatedAge(age || "");
  }, [firstName, lastName, birthday, gender, notes, age]);

  // Format date to "Month DD, YYYY" format
  const formatDateDisplay = (dateString: string): string => {
    if (!dateString) return "";
    
    // Parse the date string - handles various formats
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) return dateString;
    
    // Add timezone offset to prevent date shifting
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
    
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    const month = monthNames[adjustedDate.getMonth()];
    const day = adjustedDate.getDate();
    const year = adjustedDate.getFullYear();
    
    return `${month} ${day}, ${year}`;
  };

  // Calculate age from birthday
  const calculateAge = (birthDate: string): string => {
    if (!birthDate) return "";
    
    const today = new Date();
    const birth = new Date(birthDate);
    let ageYears = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      ageYears--;
    }
    
    return ageYears.toString();
  };

  const handleBirthdayChange = (value: string) => {
    setEditForm((prev) => ({
      ...prev,
      birthday: value,
    }));
    
    // Calculate and update age
    const newAge = calculateAge(value);
    setCalculatedAge(newAge);
  };

  const handleEditClick = () => {
    // Convert birthday to YYYY-MM-DD format if it exists
    let formattedBirthday = "";
    if (birthday) {
      // Try to parse the birthday (e.g., "Nov 09, 2017" format)
      const date = new Date(birthday);
      if (!isNaN(date.getTime())) {
        // Add timezone offset to prevent date shifting
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
        formattedBirthday = adjustedDate.toISOString().split('T')[0];
      }
    }
    
    setEditForm({
      firstName: firstName || "",
      lastName: lastName || "",
      birthday: formattedBirthday,
      gender: gender || "",
      notes: notes || "",
    });
    setCalculatedAge(age || "");
    setShowError(false);
    setFirstNameTouched(false);
    setLastNameTouched(false);
    setIsEditModalOpen(true);
  };

  // Validation
  const isFirstNameValid = (editForm.firstName?.trim() ?? "") !== "";
  const isLastNameValid = (editForm.lastName?.trim() ?? "") !== "";
  const isFormValid = isFirstNameValid && isLastNameValid;

  const handleSave = () => {
    if (!isFormValid) {
      setShowError(true);
      setFirstNameTouched(true);
      setLastNameTouched(true);
      return;
    }

    if (onEdit) {
      onEdit({
        ...editForm,
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        age: calculatedAge,
      });
    }
    setIsEditModalOpen(false);
    setShowError(false);
    setFirstNameTouched(false);
    setLastNameTouched(false);
  };

  const handleCancel = () => {
    // Convert birthday to YYYY-MM-DD format if it exists
    let formattedBirthday = "";
    if (birthday) {
      const date = new Date(birthday);
      if (!isNaN(date.getTime())) {
        // Add timezone offset to prevent date shifting
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
        formattedBirthday = adjustedDate.toISOString().split('T')[0];
      }
    }
    
    setEditForm({
      firstName: firstName || "",
      lastName: lastName || "",
      birthday: formattedBirthday,
      gender: gender || "",
      notes: notes || "",
    });
    setCalculatedAge(age || "");
    setShowError(false);
    setFirstNameTouched(false);
    setLastNameTouched(false);
    setIsEditModalOpen(false);
  };

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm((prev) => ({
      ...prev,
      firstName: e.target.value,
    }));
    setFirstNameTouched(true);
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm((prev) => ({
      ...prev,
      lastName: e.target.value,
    }));
    setLastNameTouched(true);
  };

  const handleChange = (field: string, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Get max date (today) for date input
  const getMaxDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getInputClassName = (isValid: boolean, isTouched: boolean) => {
    if (isTouched && !isValid) return "border-red-600 text-gray-500";
    if (isTouched && isValid) return "border-green-600 text-gray-900";
    return "border-gray-300 text-gray-500";
  };

  const getLabelClassName = (isValid: boolean, isTouched: boolean) => {
    if (isTouched && !isValid) return "text-red-600";
    if (isTouched && isValid) return "text-green-600";
    return "text-gray-700";
  };

  const modalActions = [
    {
      label: "Cancel",
      onClick: handleCancel,
      variant: "outline" as const
    },
    {
      label: "Save",
      onClick: handleSave,
      variant: "default" as const
    }
  ];

  return (
    <>
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">Details</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleEditClick}
              aria-label="Edit details"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onMerge && (
                  <DropdownMenuItem onClick={onMerge}>
                    Merge
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem onClick={onDelete} className="text-red-600">
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <KeyValueDisplay 
              label="Name" 
              value={
                loading 
                  ? "..." 
                  : (firstName?.trim() && lastName?.trim()) 
                    ? `${firstName.trim()} ${lastName.trim()}` 
                    : "N/A"
              } 
            />
            <KeyValueDisplay 
              label="Birthday" 
              value={loading ? "..." : (birthday ? formatDateDisplay(birthday) : "N/A")} 
            />
            <KeyValueDisplay 
              label="Age" 
              value={loading ? "..." : (age?.trim() || "N/A")} 
            />
            <KeyValueDisplay 
              label="Gender" 
              value={loading ? "..." : (gender?.trim() || "N/A")} 
            />
            <KeyValueDisplay 
              label="Status" 
              value={loading ? "..." : (status?.trim() || "Active")} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Modal */}
      <ReusableModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        title="Edit"
        description=""
        size="md"
        actions={modalActions}
        showFooter={true}
      >
        <div className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-2">
              <Label 
                htmlFor="firstName" 
                className={`text-sm font-medium ${getLabelClassName(isFirstNameValid, firstNameTouched)}`}
              >
                First Name
              </Label>
              <Input
                id="firstName"
                type="text"
                value={editForm.firstName}
                onChange={handleFirstNameChange}
                className={`focus:ring-0 focus:outline-none ${getInputClassName(isFirstNameValid, firstNameTouched)}`}
                style={{ boxShadow: "none" }}
                placeholder="Enter first name"
              />
              {(firstNameTouched || showError) && !isFirstNameValid && (
                <p className="text-sm text-red-600">First name cannot be blank.</p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label 
                htmlFor="lastName" 
                className={`text-sm font-medium ${getLabelClassName(isLastNameValid, lastNameTouched)}`}
              >
                Last Name
              </Label>
              <Input
                id="lastName"
                type="text"
                value={editForm.lastName}
                onChange={handleLastNameChange}
                className={`focus:ring-0 focus:outline-none ${getInputClassName(isLastNameValid, lastNameTouched)}`}
                style={{ boxShadow: "none" }}
                placeholder="Enter last name"
              />
              {(lastNameTouched || showError) && !isLastNameValid && (
                <p className="text-sm text-red-600">Last name cannot be blank.</p>
              )}
            </div>
          </div>

          {/* Birthday Field */}
          <div className="space-y-2">
            <Label htmlFor="birthday" className="text-sm font-medium text-gray-700">
              Birth Date
            </Label>
            <Input
              id="birthday"
              type="date"
              value={editForm.birthday}
              onChange={(e) => handleBirthdayChange(e.target.value)}
              max={getMaxDate()}
              className="focus:ring-0 focus:outline-none border-gray-300 text-gray-500"
              style={{ boxShadow: "none" }}
            />
            {calculatedAge && (
              <p className="text-sm text-gray-500">
                Age: {calculatedAge} years old
              </p>
            )}
          </div>

          {/* Gender Field */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Gender</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleChange("gender", "")}
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    editForm.gender === "" 
                      ? "border-[#f3573f]" 
                      : "border-gray-400"
                  }`}
                >
                  {editForm.gender === "" && (
                    <div className="w-2 h-2 rounded-full bg-[#f3573f]" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleChange("gender", "")}
                  className={`text-sm font-normal text-left ${
                    editForm.gender === "" 
                      ? "text-[#f3573f]" 
                      : "text-gray-500"
                  }`}
                >
                  Not Specified
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleChange("gender", "Male")}
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    editForm.gender === "Male" 
                      ? "border-[#f3573f]" 
                      : "border-gray-400"
                  }`}
                >
                  {editForm.gender === "Male" && (
                    <div className="w-2 h-2 rounded-full bg-[#f3573f]" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleChange("gender", "Male")}
                  className={`text-sm font-normal text-left ${
                    editForm.gender === "Male" 
                      ? "text-[#f3573f]" 
                      : "text-gray-500"
                  }`}
                >
                  Male
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleChange("gender", "Female")}
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    editForm.gender === "Female" 
                      ? "border-[#f3573f]" 
                      : "border-gray-400"
                  }`}
                >
                  {editForm.gender === "Female" && (
                    <div className="w-2 h-2 rounded-full bg-[#f3573f]" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleChange("gender", "Female")}
                  className={`text-sm font-normal text-left ${
                    editForm.gender === "Female" 
                      ? "text-[#f3573f]" 
                      : "text-gray-500"
                  }`}
                >
                  Female
                </button>
              </div>
            </div>
          </div>

          {/* Notes Field */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
              Notes
            </Label>
            <textarea
              id="notes"
              value={editForm.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="w-full min-h-[120px] px-3 py-2 text-sm border border-gray-300 text-gray-500 rounded-md resize-none focus:outline-none focus:ring-0"
              style={{ boxShadow: "none" }}
              placeholder="Add notes..."
            />
          </div>
        </div>
      </ReusableModal>
    </>
  );
}