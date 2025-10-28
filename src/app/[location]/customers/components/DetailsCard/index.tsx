import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, ChevronDown, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ReusableModal } from "@/components/TablesModals";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { KeyValueDisplay } from "@/components/KeyValueDisplay";
import Image from "next/image";
import { getReferralSources, ReferralSourceData } from "../DetailsCard/referralSource";
import { updateCustomerProfile } from "./detail-card-api";
import { toast } from "sonner";


interface DetailsData {
  firstName: string;
  lastName: string;
  role: string;
  referralSource: string;
  referralSourceDescription?: string;
  status: string;
  picture?: string;
}

interface DetailsCardProps {
  data: DetailsData;
  onSave?: (data: DetailsData) => void;
  className?: string;
  loading?: boolean;
  location: string;
  customerId: number;
}

export function DetailsCard({ 
  data, 
  onSave,
  className,
  loading = false,
  location,
  customerId
}: DetailsCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [referralSources, setReferralSources] = useState<ReferralSourceData[]>([]);
  const [loadingReferralSources, setLoadingReferralSources] = useState(false);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState(data.firstName || "");
  const [lastName, setLastName] = useState(data.lastName || "");
  const [referralSource, setReferralSource] = useState(data.referralSource || "");
  const [referralSourceDescription, setReferralSourceDescription] = useState(data.referralSourceDescription || "");
  const [picture, setPicture] = useState(data.picture || "");
  
  const [showError, setShowError] = useState(false);
  const [firstNameTouched, setFirstNameTouched] = useState(false);
  const [lastNameTouched, setLastNameTouched] = useState(false);
  const [referralDescriptionTouched, setReferralDescriptionTouched] = useState(false);

  const [displayFields, setDisplayFields] = useState([
    {
      label: "Name",
      value: (data.firstName?.trim() && data.lastName?.trim()) 
        ? `${data.firstName.trim()} ${data.lastName.trim()}` 
        : "N/A"
    },
    {
      label: "Role",
      value: data.role?.trim() || "Customer"
    },
    {
      label: "Referral Source",
      value: data.referralSource?.trim() || "Drive By"
    },
    {
      label: "Status",
      value: data.status?.trim() || "Active"
    }
  ]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  // Fetch referral sources on component mount
  useEffect(() => {
    const fetchReferralSources = async () => {
      setLoadingReferralSources(true);
      try {
        const sources = await getReferralSources();
        setReferralSources(sources);
      } catch (error) {
        console.error("Failed to fetch referral sources:", error);
      } finally {
        setLoadingReferralSources(false);
      }
    };

    fetchReferralSources();
  }, []);

  useEffect(() => {
    setFirstName(data.firstName || "");
    setLastName(data.lastName || "");
    setReferralSource(data.referralSource || "");
    setReferralSourceDescription(data.referralSourceDescription || "");
    setPicture(data.picture || "");
    
    setDisplayFields([
      {
        label: "Name",
        value: (data.firstName?.trim() && data.lastName?.trim()) 
          ? `${data.firstName.trim()} ${data.lastName.trim()}` 
          : "N/A"
      },
      {
        label: "Role",
        value: data.role?.trim() || "Customer"
      },
      {
        label: "Referral Source",
        value: data.referralSource?.trim() || "Drive By"
      },
      {
        label: "Status",
        value: data.status?.trim() || "Active"
      }
    ]);
  }, [data.firstName, data.lastName, data.referralSource, data.referralSourceDescription, data.picture, data.role, data.status]);

  const handleEditClick = () => {
    setFirstName(data.firstName || "");
    setLastName(data.lastName || "");
    setReferralSource(data.referralSource || "");
    setReferralSourceDescription(data.referralSourceDescription || "");
    setPicture(data.picture || "");
    setShowError(false);
    setFirstNameTouched(false);
    setLastNameTouched(false);
    setReferralDescriptionTouched(false);
    setIsModalOpen(true);
  };

  const isOtherSelected = referralSource === "Other";
  const isFirstNameValid = (firstName?.trim() ?? "") !== "";
  const isLastNameValid = (lastName?.trim() ?? "") !== "";
  const isReferralSourceValid = (referralSource?.trim() ?? "") !== "";
  const isReferralDescriptionValid = !isOtherSelected || (referralSourceDescription?.trim() ?? "") !== "";
  const isFormValid = isFirstNameValid && isLastNameValid && isReferralSourceValid && isReferralDescriptionValid;

  const handleSave = async () => {
    if (!isFormValid) {
      setShowError(true);
      setFirstNameTouched(true);
      setLastNameTouched(true);
      if (isOtherSelected) {
        setReferralDescriptionTouched(true);
      }
      return;
    }

    setSaving(true);

    try {
      // Find the referral source ID by name
      const selectedSource = referralSources.find(s => s.name === referralSource);
      const referralSourceId = selectedSource?.id;

      // Call the API
      const response = await updateCustomerProfile(
        location,
        customerId,
        firstName.trim(),
        lastName.trim(),
        referralSourceId,
        isOtherSelected ? referralSourceDescription.trim() : undefined
      );

      if (response?.success) {
        // Call parent onSave if provided
        if (onSave) {
          onSave({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            role: data.role,
            referralSource,
            referralSourceDescription: isOtherSelected ? referralSourceDescription.trim() : undefined,
            status: data.status,
            picture
          });
        }

        toast.success(response.message || "Profile updated successfully");

        setIsModalOpen(false);
        setShowError(false);
        setFirstNameTouched(false);
        setLastNameTouched(false);
        setReferralDescriptionTouched(false);
      } else {
        toast.error(response?.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFirstName(data.firstName || "");
    setLastName(data.lastName || "");
    setReferralSource(data.referralSource || "");
    setReferralSourceDescription(data.referralSourceDescription || "");
    setPicture(data.picture || "");
    setShowError(false);
    setFirstNameTouched(false);
    setLastNameTouched(false);
    setReferralDescriptionTouched(false);
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

  const handleReferralSourceChange = (sourceName: string) => {
    setReferralSource(sourceName);
    if (sourceName !== "Other") {
      setReferralSourceDescription("");
      setReferralDescriptionTouched(false);
    }
  };

  const handleReferralDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReferralSourceDescription(e.target.value);
    setReferralDescriptionTouched(true);
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
      variant: "outline" as const,
      disabled: saving
    },
    {
      label: saving ? "Saving..." : "Save",
      onClick: handleSave,
      variant: "default" as const,
      disabled: saving
    }
  ];

  const getInputClassName = (isValid: boolean, isTouched: boolean) => {
    const darkModeClasses = "dark:text-gray-100 dark:bg-gray-900 dark:placeholder:text-gray-500";
    if (isTouched && !isValid) return `border-red-600 text-gray-900 ${darkModeClasses}`;
    if (isTouched && isValid) return `border-green-600 text-gray-900 ${darkModeClasses}`;
    return `border-gray-300 dark:border-gray-600 text-gray-900 ${darkModeClasses}`;
  };

  const getLabelClassName = (isValid: boolean, isTouched: boolean) => {
    if (isTouched && !isValid) return "text-red-600 dark:text-red-400";
    if (isTouched && isValid) return "text-green-600 dark:text-green-400";
    return "text-gray-700 dark:text-gray-300";
  };

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
  };

  const handlePasswordSave = () => {
    const isPasswordValid = (password?.trim() ?? "") !== "";
    const isConfirmPasswordValid = (confirmPassword?.trim() ?? "") !== "";
    const doPasswordsMatch = password === confirmPassword;

    if (!isPasswordValid || !isConfirmPasswordValid || !doPasswordsMatch) {
      setShowPasswordError(true);
      setPasswordTouched(true);
      setConfirmPasswordTouched(true);
      return;
    }

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

  const isPasswordValid = (password?.trim() ?? "") !== "";
  const isConfirmPasswordValid = (confirmPassword?.trim() ?? "") !== "";
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

  // Separate "Other" from other sources and put it at the end
  const sortedReferralSources = referralSources.sort((a, b) => {
    if (a.name === "Other") return 1;
    if (b.name === "Other") return -1;
    return 0;
  });

  return (
    <>
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">Details</CardTitle>
          {loading ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          ) : (
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
                  <Button variant="ghost" size="icon" className="h-8 w-8">
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
          )}
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="flex justify-center">
                  <div className="flex items-center w-full max-w-sm">
                    <div className="w-40 text-right pr-4">
                      <Skeleton className="h-4 w-24 ml-auto" />
                    </div>
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {displayFields.map((item, index) => (
                <KeyValueDisplay
                  key={index}
                  label={item.label}
                  value={item.value}
                />
              ))}
            </div>
          )}
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
        <div className="space-y-3 max-h-[calc(100vh-12rem)] overflow-y-auto">
          <div className="flex justify-center mb-4">
            <div className="relative w-20 h-20">
              {picture ? (
                <>
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <Image 
                      src={picture} 
                      alt="Customer" 
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setPicture("")}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 z-10"
                    aria-label="Remove picture"
                  >
                    ×
                  </button>
                </>
              ) : (
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                style={{ boxShadow: "none" }}
                placeholder="Enter first name"
                disabled={saving}
              />
              {(firstNameTouched || showError) && !isFirstNameValid && (
                <p className="text-sm text-red-600 dark:text-red-400">First name cannot be blank.</p>
              )}
            </div>

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
                style={{ boxShadow: "none" }}
                placeholder="Enter last name"
                disabled={saving}
              />
              {(lastNameTouched || showError) && !isLastNameValid && (
                <p className="text-sm text-red-600 dark:text-red-400">Last name cannot be blank.</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label className={`text-sm font-medium ${showError && !isReferralSourceValid ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}>
              How did you find us?
            </Label>
            {loadingReferralSources ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, index) => (
                  <Skeleton key={index} className="h-6 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {sortedReferralSources.map((source) => (
                  <div key={source.id}>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleReferralSourceChange(source.name)}
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          referralSource === source.name
                            ? "border-[#f3573f]" 
                            : showError && !isReferralSourceValid
                            ? "border-red-600 dark:border-red-400"
                            : "border-gray-400 dark:border-gray-500"
                        }`}
                        disabled={saving}
                      >
                        {referralSource === source.name && (
                          <div className="w-2 h-2 rounded-full bg-[#f3573f]" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReferralSourceChange(source.name)}
                        className={`text-sm font-normal text-left ${
                          referralSource === source.name
                            ? "text-[#f3573f]" 
                            : showError && !isReferralSourceValid 
                            ? "text-red-600 dark:text-red-400" 
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                        disabled={saving}
                      >
                        {source.name}
                      </button>
                    </div>
                    
                    {/* Show text input when "Other" is selected */}
                    {source.name === "Other" && referralSource === "Other" && (
                      <div className="mt-2 ml-6 space-y-2">
                        <Input
                          type="text"
                          value={referralSourceDescription}
                          onChange={handleReferralDescriptionChange}
                          className={`focus:ring-0 focus:outline-none ${getInputClassName(isReferralDescriptionValid, referralDescriptionTouched)}`}
                          style={{ boxShadow: "none" }}
                          placeholder="Custom description for 'Other' type"
                          disabled={saving}
                        />
                        {(referralDescriptionTouched || showError) && !isReferralDescriptionValid && (
                          <p className="text-sm text-red-600 dark:text-red-400">Description cannot be blank when Other is selected.</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {showError && !isReferralSourceValid && (
              <p className="text-sm text-red-600 dark:text-red-400">Please select how you found us.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="picture-upload" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Picture
            </Label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
              <label htmlFor="picture-upload" className="cursor-pointer flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-1">
                  <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <input
                  id="picture-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePictureUpload}
                  className="hidden"
                  disabled={saving}
                />
              </label>
            </div>
          </div>
        </div>
      </ReusableModal>

      <ReusableModal
        open={isPasswordModalOpen}
        onOpenChange={setIsPasswordModalOpen}
        title="Set Password"
        size="sm"
        actions={passwordModalActions}
        showFooter={true}
      >
        <div className="space-y-4">
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
              style={{ boxShadow: "none" }}
              placeholder="Enter password"
            />
            {(passwordTouched || showPasswordError) && !isPasswordValid && (
              <p className="text-sm text-red-600 dark:text-red-400">Password cannot be blank.</p>
            )}
          </div>

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
              style={{ boxShadow: "none" }}
              placeholder="Confirm password"
            />
            {(confirmPasswordTouched || showPasswordError) && !isConfirmPasswordValid && (
              <p className="text-sm text-red-600 dark:text-red-400">Confirm password cannot be blank.</p>
            )}
            {(confirmPasswordTouched || showPasswordError) && isConfirmPasswordValid && !doPasswordsMatch && (
              <p className="text-sm text-red-600 dark:text-red-400">Passwords do not match.</p>
            )}
          </div>
        </div>
      </ReusableModal>
    </>
  );
}