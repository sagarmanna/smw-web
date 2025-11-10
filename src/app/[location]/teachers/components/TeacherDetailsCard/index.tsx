"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Edit, ChevronDown, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { KeyValueDisplay } from "@/components/KeyValueDisplay";
import { ReusableModal } from "@/components/TablesModals";
import { updateTeacherDetails } from "./teacher-details-card.api";
import { toast } from "sonner";

interface TeacherDetailsCardProps {
  data: {
    firstName: string;
    lastName: string;
    role: string;
    birthDate?: string;
    picture?: string;
  };
  onSave: (data: {
    firstName: string;
    lastName: string;
    role: string;
    birthDate?: string;
    picture?: string;
  }) => void;
  loading?: boolean;
  location: string;
  teacherId: number;
}

export function TeacherDetailsCard({
  data,
  onSave,
  loading = false,
  location,
  teacherId,
}: TeacherDetailsCardProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [firstName, setFirstName] = React.useState(data.firstName || "");
  const [lastName, setLastName] = React.useState(data.lastName || "");
  const [role, setRole] = React.useState(data.role || "Teacher");
  const [birthDate, setBirthDate] = React.useState(data.birthDate || "");

  const [showError, setShowError] = React.useState(false);
  const [firstNameTouched, setFirstNameTouched] = React.useState(false);
  const [lastNameTouched, setLastNameTouched] = React.useState(false);

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const [displayFields, setDisplayFields] = React.useState([
    {
      label: "Name",
      value: (data.firstName?.trim() && data.lastName?.trim()) 
        ? `${data.firstName.trim()} ${data.lastName.trim()}` 
        : "N/A"
    },
    {
      label: "Role",
      value: data.role?.trim() || "Teacher"
    },
    {
      label: "Birth Date",
      value: data.birthDate ? formatDisplayDate(data.birthDate) : "N/A"
    }
  ]);

  React.useEffect(() => {
    setFirstName(data.firstName || "");
    setLastName(data.lastName || "");
    setRole(data.role || "Teacher");
    setBirthDate(data.birthDate || "");
    
    setDisplayFields([
      {
        label: "Name",
        value: (data.firstName?.trim() && data.lastName?.trim()) 
          ? `${data.firstName.trim()} ${data.lastName.trim()}` 
          : "N/A"
      },
      {
        label: "Role",
        value: data.role?.trim() || "Teacher"
      },
      {
        label: "Birth Date",
        value: data.birthDate ? formatDisplayDate(data.birthDate) : "N/A"
      }
    ]);
  }, [data.firstName, data.lastName, data.role, data.birthDate]);

  const handleEditClick = () => {
    setFirstName(data.firstName || "");
    setLastName(data.lastName || "");
    setRole(data.role || "Teacher");
    setBirthDate(data.birthDate || "");
    setShowError(false);
    setFirstNameTouched(false);
    setLastNameTouched(false);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    // Validate required fields
    if (!firstName.trim() || !lastName.trim()) {
      setShowError(true);
      return;
    }

    setSaving(true);
    try {
      const response = await updateTeacherDetails(location, teacherId, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role: role.trim(),
        birthDate: birthDate || undefined,
      });

      if (response.status) {
        onSave({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          role: role.trim(),
          birthDate: birthDate || undefined,
          picture: data.picture,
        });
        setIsModalOpen(false);
        toast.success("Teacher details updated successfully");
      } else {
        toast.error(response.message || "Failed to update teacher details");
      }
    } catch (error) {
      console.error("Error updating teacher details:", error);
      toast.error("Failed to update teacher details");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Card>
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
                  <DropdownMenuItem onClick={handleEditClick}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <div className="space-y-3">
              {displayFields.map((field, index) => (
                <KeyValueDisplay
                  key={index}
                  label={field.label}
                  value={field.value}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <ReusableModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Edit Teacher Details"
        size="md"
        actions={[
          {
            label: "Cancel",
            onClick: () => setIsModalOpen(false),
            variant: "outline",
            disabled: saving,
          },
          {
            label: saving ? "Saving..." : "Save Changes",
            onClick: handleSave,
            variant: "default",
            disabled: saving,
          },
        ]}
      >
        <div className="space-y-4">
          {showError && (!firstName.trim() || !lastName.trim()) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              Please fill in all required fields.
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setFirstNameTouched(true);
                }}
                onBlur={() => setFirstNameTouched(true)}
                disabled={saving}
                className={
                  firstNameTouched && !firstName.trim()
                    ? "border-red-500"
                    : ""
                }
              />
              {firstNameTouched && !firstName.trim() && (
                <p className="text-sm text-red-500 mt-1">
                  First name is required
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  setLastNameTouched(true);
                }}
                onBlur={() => setLastNameTouched(true)}
                disabled={saving}
                className={
                  lastNameTouched && !lastName.trim() ? "border-red-500" : ""
                }
              />
              {lastNameTouched && !lastName.trim() && (
                <p className="text-sm text-red-500 mt-1">
                  Last name is required
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={saving}
            />
          </div>

          <div>
            <Label htmlFor="birthDate">Birth Date</Label>
            <div className="relative">
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                disabled={saving}
                className="pr-10"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </ReusableModal>
    </>
  );
}

