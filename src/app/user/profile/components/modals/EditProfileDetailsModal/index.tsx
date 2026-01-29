"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GenericBasicDetails } from "@/components/user-details/types/common";

interface EditProfileDetailsModalProps<TDetails extends GenericBasicDetails> {
  open: boolean;
  onClose: () => void;
  details: TDetails | null;
  onSubmit: (details: TDetails) => Promise<boolean>;
  saving?: boolean;
  title?: string;
  defaultRole?: string;
}

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

export default function EditProfileDetailsModal<TDetails extends GenericBasicDetails>({
  open,
  onClose,
  details,
  onSubmit,
  saving = false,
  title = "Edit Details",
  defaultRole = "Customer",
}: EditProfileDetailsModalProps<TDetails>) {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [picture, setPicture] = React.useState<string | undefined>(undefined);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [firstNameTouched, setFirstNameTouched] = React.useState(false);
  const [lastNameTouched, setLastNameTouched] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setFirstName(details?.firstName ?? "");
    setLastName(details?.lastName ?? "");
    setPicture((details?.picture as string | undefined) ?? undefined);
    setFirstNameTouched(false);
    setLastNameTouched(false);
  }, [open, details]);

  const isFirstNameValid = (firstName?.trim() ?? "") !== "";
  const isLastNameValid = (lastName?.trim() ?? "") !== "";
  const isFormValid = isFirstNameValid && isLastNameValid;

  const firstNameError = firstNameTouched && !isFirstNameValid ? "First name is required" : "";
  const lastNameError = lastNameTouched && !isLastNameValid ? "Last name is required" : "";

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // basic guard for very large images (UI-only)
    if (file.size > 3 * 1024 * 1024) {
      // 3MB
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setPicture(dataUrl);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFirstNameTouched(true);
    setLastNameTouched(true);
    if (!isFormValid) return;

    const updated = {
      ...(details ?? ({} as TDetails)),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: (details?.role as string | undefined) || defaultRole,
      picture,
    } as TDetails;

    const ok = await onSubmit(updated);
    if (ok) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[560px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Picture */}
            <div className="space-y-2">
              <Label>Picture</Label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full border bg-muted overflow-hidden flex items-center justify-center">
                  {picture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={picture} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-semibold text-muted-foreground">N/A</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button type="button" variant="outline" onClick={handlePickFile} disabled={saving}>
                    Upload
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setPicture(undefined)}
                    disabled={saving || !picture}
                  >
                    Remove
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Upload an image (max 3MB). This is stored locally for now.
              </p>
            </div>

            {/* Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onBlur={() => setFirstNameTouched(true)}
                  placeholder="Enter first name"
                  className={firstNameError ? "border-red-500" : ""}
                />
                {firstNameError && <p className="text-sm text-red-500">{firstNameError}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onBlur={() => setLastNameTouched(true)}
                  placeholder="Enter last name"
                  className={lastNameError ? "border-red-500" : ""}
                />
                {lastNameError && <p className="text-sm text-red-500">{lastNameError}</p>}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !isFormValid}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

