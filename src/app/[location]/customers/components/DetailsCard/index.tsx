import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { KeyValueDisplay } from "@/components/KeyValueDisplay";
import { ReusableModal } from "@/components/TablesModals";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

interface DetailsData {
  firstName: string;
  lastName: string;
  role: string;
  referralSource: string;
  status: string;
  picture?: string;
}

interface DetailsCardProps {
  data: DetailsData;
  onSave?: (data: DetailsData) => void;
  className?: string;
  loading?: boolean;
}

const REFERRAL_SOURCES = [
  "Drive By",
  "Arcadia's Website",
  "Newspaper Advertisement",
  "Social Media",
  "Street Sign",
  "Test Referral",
  "Other"
];

export function DetailsCard({ 
  data, 
  onSave,
  className,
  loading = false
}: DetailsCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [firstName, setFirstName] = useState(data.firstName);
  const [lastName, setLastName] = useState(data.lastName);
  const [referralSource, setReferralSource] = useState(data.referralSource);
  const [picture, setPicture] = useState(data.picture || "");
  
  const [showError, setShowError] = useState(false);
  const [firstNameTouched, setFirstNameTouched] = useState(false);
  const [lastNameTouched, setLastNameTouched] = useState(false);

  // Password states
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  // Sync local state with prop data when it changes
  useEffect(() => {
    setFirstName(data.firstName);
    setLastName(data.lastName);
    setReferralSource(data.referralSource);
    setPicture(data.picture || "");
  }, [data.firstName, data.lastName, data.referralSource, data.picture]);

  const handleEditClick = () => {
    // Reset form with current data
    setFirstName(data.firstName);
    setLastName(data.lastName);
    setReferralSource(data.referralSource);
    setPicture(data.picture || "");
    setShowError(false);
    setFirstNameTouched(false);
    setLastNameTouched(false);
    setIsModalOpen(true);
  };

  const isFirstNameValid = firstName.trim() !== "";
  const isLastNameValid = lastName.trim() !== "";
  const isReferralSourceValid = referralSource !== "";
  const isFormValid = isFirstNameValid && isLastNameValid && isReferralSourceValid;

  const handleSave = () => {
    // Show error state if validation fails
    if (!isFormValid) {
      setShowError(true);
      setFirstNameTouched(true);
      setLastNameTouched(true);
      return;
    }

    // Call onSave callback if provided
    if (onSave) {
      onSave({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role: data.role,
        referralSource,
        status: data.status,
        picture
      });
    }

    // Close modal
    setIsModalOpen(false);
    setShowError(false);
    setFirstNameTouched(false);
    setLastNameTouched(false);
  };

  const handleCancel = () => {
    setFirstName(data.firstName);
    setLastName(data.lastName);
    setReferralSource(data.referralSource);
    setPicture(data.picture || "");
    setShowError(false);
    setFirstNameTouched(false);
    setLastNameTouched(false);
    setIsModalOpen(false);
  };

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFirstName(e.target.value);
    setFirstNameTouched(true);
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLastName(e.target.value);
    setLastNameTouched(true);
  };

  const handlePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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

  const getInputClassName = (isValid: boolean, isTouched: boolean) => {
    if (isTouched && !isValid) {
      return "border-red-600 text-gray-500";
    }
    if (isTouched && isValid) {
      return "border-green-600 text-gray-900";
    }
    return "border-gray-300 text-gray-500";
  };

  const getLabelClassName = (isValid: boolean, isTouched: boolean) => {
    if (isTouched && !isValid) {
      return "text-red-600";
    }
    if (isTouched && isValid) {
      return "text-green-600";
    }
    return "text-gray-700";
  };

  // Password handlers
  const handleSetPasswordClick = () => {
    setPassword("");
    setConfirmPassword("");
    setShowPasswordError(false);
    setPasswordTouched(false);
    setConfirmPasswordTouched(false);
    setIsPasswordModalOpen(true);
  };

  const handleMergeClick = () => {
    // TODO: Implement merge functionality
    console.log("Merge clicked");
  };

  const handlePasswordSave = () => {
    const isPasswordValid = password.trim() !== "";
    const isConfirmPasswordValid = confirmPassword.trim() !== "";
    const doPasswordsMatch = password === confirmPassword;

    if (!isPasswordValid || !isConfirmPasswordValid || !doPasswordsMatch) {
      setShowPasswordError(true);
      setPasswordTouched(true);
      setConfirmPasswordTouched(true);
      return;
    }

    // TODO: Save password via API
    console.log("Password saved");
    setIsPasswordModalOpen(false);
    setPassword("");
    setConfirmPassword("");
    setShowPasswordError(false);
    setPasswordTouched(false);
    setConfirmPasswordTouched(false);
  };

  const handlePasswordCancel = () => {
    setPassword("");
    setConfirmPassword("");
    setShowPasswordError(false);
    setPasswordTouched(false);
    setConfirmPasswordTouched(false);
    setIsPasswordModalOpen(false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordTouched(true);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setConfirmPasswordTouched(true);
  };

  const isPasswordValid = password.trim() !== "";
  const isConfirmPasswordValid = confirmPassword.trim() !== "";
  const doPasswordsMatch = password === confirmPassword && password !== "";

  const passwordModalActions = [
    {
      label: "Cancel",
      onClick: handlePasswordCancel,
      variant: "outline" as const
    },
    {
      label: "Save",
      onClick: handlePasswordSave,
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
            >
              <Edit className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleMergeClick}>
                  Merge
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSetPasswordClick}>
                  Set Password
                </DropdownMenuItem>
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
              label="Role" 
              value={loading ? "..." : (data.role?.trim() || "Customer")} 
            />
            <KeyValueDisplay 
              label="Referral Source" 
              value={loading ? "..." : (referralSource?.trim() || "Drive By")} 
            />
            <KeyValueDisplay 
              label="Status" 
              value={loading ? "..." : (data.status?.trim() || "Active")} 
            />
          </div>
        </CardContent>
      </Card>

      <ReusableModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Edit"
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
                value={firstName}
                onChange={handleFirstNameChange}
                className={`focus:ring-0 focus:outline-none ${getInputClassName(isFirstNameValid, firstNameTouched)}`}
                style={{ boxShadow: 'none' }}
                placeholder="Enter first name"
              />
              {firstNameTouched && !isFirstNameValid && (
                <p className="text-sm text-red-600">
                  First name cannot be blank.
                </p>
              )}
              {showError && !firstNameTouched && !isFirstNameValid && (
                <p className="text-sm text-red-600">
                  First name cannot be blank.
                </p>
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
                value={lastName}
                onChange={handleLastNameChange}
                className={`focus:ring-0 focus:outline-none ${getInputClassName(isLastNameValid, lastNameTouched)}`}
                style={{ boxShadow: 'none' }}
                placeholder="Enter last name"
              />
              {lastNameTouched && !isLastNameValid && (
                <p className="text-sm text-red-600">
                  Last name cannot be blank.
                </p>
              )}
              {showError && !lastNameTouched && !isLastNameValid && (
                <p className="text-sm text-red-600">
                  Last name cannot be blank.
                </p>
              )}
            </div>
          </div>

          {/* Referral Source */}
          <div className="space-y-3">
            <Label className={`text-sm font-medium ${showError && !isReferralSourceValid ? 'text-red-600' : 'text-gray-700'}`}>
              How did you find us?
            </Label>
            <div className="space-y-2">
              {REFERRAL_SOURCES.map((source) => (
                <div key={source} className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setReferralSource(source)}
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      referralSource === source 
                        ? "border-[#f3573f]" 
                        : showError && !isReferralSourceValid
                        ? "border-red-600"
                        : "border-gray-400"
                    }`}
                    aria-label={`Select ${source}`}
                  >
                    {referralSource === source && (
                      <div className="w-2 h-2 rounded-full bg-[#f3573f]"></div>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReferralSource(source)}
                    className={`text-sm font-normal text-left ${
                      referralSource === source 
                        ? 'text-[#f3573f]' 
                        : showError && !isReferralSourceValid 
                        ? 'text-red-600' 
                        : 'text-gray-500'
                    }`}
                  >
                    {source}
                  </button>
                </div>
              ))}
            </div>
            {showError && !isReferralSourceValid && (
              <p className="text-sm text-red-600">
                Please select how you found us.
              </p>
            )}
          </div>

          {/* Picture Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Picture</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center">
              {picture ? (
                <div className="relative w-24 h-24">
                  <Image 
                    src={picture} 
                    alt="Customer" 
                    width={96}
                    height={96}
                    className="rounded-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPicture("")}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    aria-label="Remove picture"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label htmlFor="picture-upload" className="cursor-pointer">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <svg 
                      className="w-8 h-8 text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 4v16m8-8H4" 
                      />
                    </svg>
                  </div>
                  <input
                    id="picture-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePictureUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      </ReusableModal>

      {/* Password Modal */}
      <ReusableModal
        open={isPasswordModalOpen}
        onOpenChange={setIsPasswordModalOpen}
        title="Edit"
        size="sm"
        actions={passwordModalActions}
        showFooter={true}
      >
        <div className="space-y-4">
          {/* Password Field */}
          <div className="space-y-2">
            <Label 
              htmlFor="password" 
              className={`text-sm font-medium ${getLabelClassName(isPasswordValid, passwordTouched)}`}
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              className={`focus:ring-0 focus:outline-none ${getInputClassName(isPasswordValid, passwordTouched)}`}
              style={{ boxShadow: 'none' }}
              placeholder="Enter password"
            />
            {passwordTouched && !isPasswordValid && (
              <p className="text-sm text-red-600">
                Password cannot be blank.
              </p>
            )}
            {showPasswordError && !passwordTouched && !isPasswordValid && (
              <p className="text-sm text-red-600">
                Password cannot be blank.
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label 
              htmlFor="confirmPassword" 
              className={`text-sm font-medium ${getLabelClassName(isConfirmPasswordValid && doPasswordsMatch, confirmPasswordTouched)}`}
            >
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className={`focus:ring-0 focus:outline-none ${getInputClassName(isConfirmPasswordValid && doPasswordsMatch, confirmPasswordTouched)}`}
              style={{ boxShadow: 'none' }}
              placeholder="Confirm password"
            />
            {confirmPasswordTouched && !isConfirmPasswordValid && (
              <p className="text-sm text-red-600">
                Confirm password cannot be blank.
              </p>
            )}
            {confirmPasswordTouched && isConfirmPasswordValid && !doPasswordsMatch && (
              <p className="text-sm text-red-600">
                Passwords do not match.
              </p>
            )}
            {showPasswordError && !confirmPasswordTouched && !isConfirmPasswordValid && (
              <p className="text-sm text-red-600">
                Confirm password cannot be blank.
              </p>
            )}
            {showPasswordError && confirmPasswordTouched && isConfirmPasswordValid && !doPasswordsMatch && (
              <p className="text-sm text-red-600">
                Passwords do not match.
              </p>
            )}
          </div>
        </div>
      </ReusableModal>
    </>
  );
}